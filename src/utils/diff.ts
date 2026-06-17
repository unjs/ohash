import { serialize } from "../serialize";

/**
 * Calculates the difference between two objects and returns a list of differences.
 *
 * @param {any} obj1 - The first object to compare.
 * @param {any} obj2 - The second object to compare.
 * @param {HashOptions} [opts={}] - Configuration options for hashing the objects. See {@link HashOptions}.
 * @returns {DiffEntry[]} An array with the differences between the two objects.
 */
export function diff(obj1: any, obj2: any): DiffEntry[] {
  return _diff(obj1, obj2, "");
}

/**
 * Recursively diffs two values in a single fused traversal.
 *
 * Reference-equal (or primitive-equal) values share no differences, so entire
 * subtrees are skipped via the `v1 === v2` short-circuit without ever building
 * hashed nodes for them. Hashed {@link DiffHashedObject} nodes are constructed
 * lazily, only for the values that actually appear in a {@link DiffEntry}.
 */
function _diff(v1: any, v2: any, key: string): DiffEntry[] {
  if (v1 === v2) {
    return [];
  }

  // The original treats objects, arrays, `null` and falsy primitives as
  // "containers" (enumerated via `for..in`); only truthy primitives are leaves.
  const leaf1 = v1 ? typeof v1 !== "object" : false;
  const leaf2 = v2 ? typeof v2 !== "object" : false;

  if (!leaf1 && !leaf2) {
    const diffs: DiffEntry[] = [];
    const keys1 = new Set<string>();
    const allKeys: string[] = [];
    for (const k in v1) {
      if (!keys1.has(k)) {
        keys1.add(k);
        allKeys.push(k);
      }
    }
    const keys2 = new Set<string>();
    for (const k in v2) {
      keys2.add(k);
      if (!keys1.has(k)) {
        allKeys.push(k);
      }
    }
    for (const k of allKeys) {
      const has1 = keys1.has(k);
      const has2 = keys2.has(k);
      const childKey = key ? `${key}.${k}` : k;
      if (has1 && has2) {
        const sub = _diff(v1[k], v2[k], childKey);
        for (const element_ of sub) {
          diffs.push(element_);
        }
      } else if (has1) {
        diffs.push(
          new DiffEntry(
            childKey,
            "removed",
            undefined as any,
            _toHashedObject(v1[k], childKey),
          ),
        );
      } else {
        diffs.push(
          new DiffEntry(childKey, "added", _toHashedObject(v2[k], childKey)),
        );
      }
    }
    // Two empty containers compare equal (`{}` === `{}`), so emit nothing here.
    return diffs;
  }

  // Mixed (leaf vs container) or both leaves: the original only emits a
  // "changed" entry when the union of props is empty — i.e. both leaves, or a
  // leaf vs an empty container. A leaf vs a non-empty container yields nothing.
  let unionSize = 0;
  if (!leaf1) {
    for (const _k in v1) unionSize++;
  }
  if (!leaf2) {
    for (const _k in v2) unionSize++;
  }
  if (unionSize === 0) {
    const node1 = _toHashedObject(v1, key);
    const node2 = _toHashedObject(v2, key);
    if (node1.hash !== node2.hash) {
      return [new DiffEntry(key, "changed", node2, node1)];
    }
  }
  return [];
}

function _toHashedObject(obj: any, key = ""): DiffHashedObject {
  if (obj && typeof obj !== "object") {
    return new DiffHashedObject(key, obj, _leafHash(obj));
  }
  const props: Record<string, DiffHashedObject> = {};
  let hasProps = false;
  for (const _key in obj) {
    hasProps = true;
    props[_key] = _toHashedObject(obj[_key], key ? `${key}.${_key}` : _key);
  }
  // The combined hash of a node with props is never compared in `_diff`
  // (it only inspects `hash` when a node has no props), so we skip building
  // it. Nodes without props keep the stable empty-container hash.
  return new DiffHashedObject(key, obj, hasProps ? undefined : "{}", props);
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
    public newValue: DiffHashedObject,
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
        }\` to \`${this.newValue.toString()}\``;
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
