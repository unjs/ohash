import { serialize } from "../serialize";

/**
 * `__proto__` is never traversed or reported as a diff key.
 *
 * A `for..in` over `JSON.parse('{"__proto__": 1}')` does yield `__proto__` as an
 * own enumerable property, but surfacing it would (a) let a diff entry become a
 * prototype-pollution write for any consumer that replays entries with
 * `target[entry.key] = value`, and (b) let an assignment into a `props` record
 * silently reassign that record's prototype. Excluding it keeps a diff key
 * always safe to assign.
 */
const PROTO_KEY = "__proto__";

/**
 * Calculates the difference between two objects and returns a list of differences.
 *
 * @param {any} obj1 - The first object to compare.
 * @param {any} obj2 - The second object to compare.
 * @returns {DiffEntry[]} An array with the differences between the two objects.
 */
export function diff(obj1: any, obj2: any): DiffEntry[] {
  const diffs: DiffEntry[] = [];
  _diff(obj1, obj2, "", diffs);
  return diffs;
}

/**
 * Recursively diffs two values in a single fused traversal.
 *
 * Reference-equal (or primitive-equal) values share no differences, so entire
 * subtrees are skipped via the `v1 === v2` short-circuit without ever visiting
 * them. Entries are appended to the shared `out` accumulator so that no
 * intermediate array is allocated or re-copied per recursion level.
 */
function _diff(v1: any, v2: any, key: string, out: DiffEntry[]): void {
  if (v1 === v2) {
    return;
  }

  // Objects, arrays, `null` and falsy primitives are treated as "containers"
  // (enumerated via `for..in`); only truthy primitives are leaves.
  const leaf1 = v1 ? typeof v1 !== "object" : false;
  const leaf2 = v2 ? typeof v2 !== "object" : false;

  if (!leaf1 && !leaf2) {
    // Each value is read inside the same `for..in` pass that yields its key.
    // Reading keys first and values later would let a getter that mutates its
    // own object (deleting a sibling, truncating an array) produce entries for
    // keys that no longer exist by the time they are read.
    const entries1 = _entries(v1);
    const entries2 = _entries(v2);
    for (const [k, child1] of entries1) {
      const childKey = key ? `${key}.${k}` : k;
      if (entries2.has(k)) {
        _diff(child1, entries2.get(k), childKey, out);
      } else {
        out.push(
          new DiffEntry(
            childKey,
            "removed",
            undefined,
            _toHashedObject(child1, childKey),
          ),
        );
      }
    }
    for (const [k, child2] of entries2) {
      if (entries1.has(k)) {
        continue;
      }
      const childKey = key ? `${key}.${k}` : k;
      out.push(
        new DiffEntry(childKey, "added", _toHashedObject(child2, childKey)),
      );
    }
    // Two containers with no enumerable keys both hash to `{}`, so nothing is
    // emitted for them here.
    return;
  }

  // Mixed (leaf vs container) or both leaves: a "changed" entry is only emitted
  // when neither side has enumerable keys — i.e. both leaves, or a leaf vs an
  // empty container. A leaf vs a non-empty container yields nothing.
  if (_hasKeys(v1, leaf1) || _hasKeys(v2, leaf2)) {
    return;
  }
  // Neither side has keys, so both nodes are cheap to build directly; calling
  // `_toHashedObject` here would re-run `for..in` over each value a second time.
  const node1 = _emptyOrLeafNode(v1, key, leaf1);
  const node2 = _emptyOrLeafNode(v2, key, leaf2);
  if (node1.hash !== node2.hash) {
    out.push(new DiffEntry(key, "changed", node2, node1));
  }
}

/**
 * Snapshots a container's enumerable entries, reading every value in the same
 * pass that yields its key. A `Map` is used so that keys colliding with
 * `Object.prototype` members (`toString`, `constructor`, ...) are handled by
 * value rather than resolving to an inherited member.
 */
function _entries(value: any): Map<string, any> {
  const entries = new Map<string, any>();
  for (const key in value) {
    if (key !== PROTO_KEY) {
      entries.set(key, value[key]);
    }
  }
  return entries;
}

/**
 * Whether a container has at least one enumerable key. Stops at the first one
 * rather than counting them all.
 */
function _hasKeys(value: any, isLeaf: boolean): boolean {
  if (isLeaf) {
    return false;
  }
  for (const key in value) {
    if (key !== PROTO_KEY) {
      return true;
    }
  }
  return false;
}

/** Builds a node for a leaf, or for a container already known to have no keys. */
function _emptyOrLeafNode(
  value: any,
  key: string,
  isLeaf: boolean,
): DiffHashedObject {
  return isLeaf
    ? new DiffHashedObject(key, value, _leafHash(value))
    : new DiffHashedObject(key, value, "{}", Object.create(null));
}

function _toHashedObject(obj: any, key = ""): DiffHashedObject {
  if (obj && typeof obj !== "object") {
    return new DiffHashedObject(key, obj, _leafHash(obj));
  }
  // A null-prototype record so that a key colliding with an `Object.prototype`
  // member is stored and read back as its own value.
  const props: Record<string, DiffHashedObject> = Object.create(null);
  const hashes: (string | undefined)[] = [];
  for (const _key in obj) {
    if (_key === PROTO_KEY) {
      continue;
    }
    const child = _toHashedObject(obj[_key], key ? `${key}.${_key}` : _key);
    props[_key] = child;
    hashes.push(child.hash);
  }
  return new DiffHashedObject(key, obj, `{${hashes.join(":")}}`, props);
}

/**
 * Serializes a primitive leaf value for diffing.
 *
 * Avoids allocating a full `Serializer` (and its backing `Map`) per leaf for
 * the common primitive cases, falling back to {@link serialize} only for
 * functions and symbols.
 */
function _leafHash(value: any): string {
  switch (typeof value) {
    case "string": {
      return `'${value}'`;
    }
    case "number":
    case "boolean": {
      return "" + value;
    }
    case "bigint": {
      return `${value}n`;
    }
    default: {
      return serialize(value);
    }
  }
}

// --- Internal classes ---

export class DiffEntry {
  constructor(
    public key: string,
    public type: "changed" | "added" | "removed",
    public newValue?: DiffHashedObject,
    public oldValue?: DiffHashedObject,
  ) {}

  toString() {
    return this.toJSON();
  }

  toJSON() {
    switch (this.type) {
      case "added": {
        return `Added   \`${this.key}\``;
      }
      case "removed": {
        return `Removed \`${this.key}\``;
      }
      case "changed": {
        return `Changed \`${this.key}\` from \`${
          this.oldValue?.toString() || "-"
        }\` to \`${this.newValue?.toString()}\``;
      }
    }
  }
}

export class DiffHashedObject {
  constructor(
    public key: string,
    public value: any,
    public hash?: string,
    public props?: Record<string, DiffHashedObject>,
  ) {}

  toString() {
    if (this.props) {
      return `{${Object.keys(this.props).join(",")}}`;
    } else {
      return JSON.stringify(this.value);
    }
  }

  toJSON() {
    const k = this.key || ".";
    if (this.props) {
      return `${k}({${Object.keys(this.props).join(",")}})`;
    }
    return `${k}(${this.value})`;
  }
}
