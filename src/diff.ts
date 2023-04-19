import { objectHash, HashOptions } from "./object-hash";

export function diff(obj1: any, obj2: any, opts: HashOptions = {}): any[] {
  const h1 = _toHashedObject(obj1, opts);
  const h2 = _toHashedObject(obj2, opts);
  return _diff(h1, h2, opts);
}

function _diff(h1: HashEntry, h2: HashEntry, opts: HashOptions = {}): any[] {
  const diffs = [];

  const allProps = new Set([
    ...Object.keys(h1.$props || {}),
    ...Object.keys(h2.$props || {}),
  ]);
  if (h1.$props && h2.$props) {
    for (const prop of allProps) {
      const p1 = h1.$props[prop];
      const p2 = h2.$props[prop];
      if (p1 && p2) {
        diffs.push(..._diff(h1.$props?.[prop], h2.$props?.[prop], opts));
      } else if (p1) {
        diffs.push(new DiffEntry("removed", p1));
      } else if (p2) {
        diffs.push(new DiffEntry("added", p2));
      }
    }
  }

  if (allProps.size === 0 && h1.$hash !== h2.$hash) {
    diffs.push(new DiffEntry("changed", h1, h2));
  }

  return diffs;
}

function _toHashedObject(obj, opts: HashOptions, key = ""): HashEntry {
  if (obj && typeof obj !== "object") {
    return new HashEntry(key, obj, objectHash(obj, opts));
  }
  const $props: Record<string, HashEntry> = {};
  const hashes = [];
  for (const _key in obj) {
    $props[_key] = _toHashedObject(
      obj[_key],
      opts,
      key ? `${key}.${_key}` : _key
    );
    hashes.push($props[_key].$hash);
  }
  return new HashEntry(key, obj, `{${hashes.join(":")}}`, $props);
}

// --- Internal classes ---

class DiffEntry {
  // eslint-disable-next-line no-useless-constructor
  private key: string;
  constructor(
    public type: "changed" | "added" | "removed",
    public o1: HashEntry,
    public o2?: HashEntry
  ) {
    this.key = o1.$key || ".";
  }

  toJSON() {
    switch (this.type) {
      case "added":
        return `[+] Added   ${this.key}`;
      case "removed":
        return `[-] Removed ${this.key}`;
      case "changed":
        return `[~] Changed ${
          this.key
        } from ${this.o1.toString()} to ${this.o2.toString()}`;
    }
  }
}

class HashEntry {
  // eslint-disable-next-line no-useless-constructor
  constructor(
    public $key: string,
    public $value: any,
    public $hash?: string,
    public $props?: Record<string, HashEntry>
  ) {}

  toString() {
    if (!this.$props) {
      return JSON.stringify(this.$value);
    } else {
      return `{${Object.keys(this.$props).join(",")}}`;
    }
  }

  toJSON() {
    const k = this.$key || "<root>";
    if (this.$props) {
      return `${k}({${Object.keys(this.$props).join(",")}})`;
    }
    return `${k}(${this.$value})`;
  }
}
