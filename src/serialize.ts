// Originally based on https://github.com/puleos/object-hash v3.0.0 (MIT)

type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array
  | BigInt64Array
  | BigUint64Array;

/**
 * Serializes any input value into a string for hashing.
 *
 * This method uses best efforts to generate stable serialized values.
 * However, it is not designed for security purposes.
 * Keep in mind that there is always a chance of intentional collisions caused by user input.
 *
 * @param input any value to serialize
 * @return {string} serialized string value
 */
export function serialize(input: any): string {
  if (typeof input === "string") {
    return `'${input}'`;
  }
  return new Serializer().serialize(input);
}

// Sort weights of printable ASCII, matching the order previously produced by
// `localeCompare` (identical in every ICU locale, verified in tests below).
// Uppercase letters share the weight of their lowercase counterpart and are
// only used as a tie-breaker, as collation does.
const asciiOrder =
  " _-,;:!?.'\"()[]{}@*/\\&#%`^+<=>|~$0123456789abcdefghijklmnopqrstuvwxyz";
const asciiWeights = /*@__PURE__*/ (function () {
  const weights = new Uint8Array(128);
  for (let i = 0; i < asciiOrder.length; i++) {
    weights[asciiOrder.charCodeAt(i)] = i + 1;
  }
  for (let code = 65 /* A */; code <= 90 /* Z */; code++) {
    weights[code] = weights[code + 32];
  }
  return weights;
})();

/**
 * Compares two strings in a stable, environment independent way.
 *
 * `localeCompare` is not used as its result depends on the environment locale
 * (in Slovak, for example, `ch` is a single letter sorted after `h`) and on the
 * ICU data the runtime was built with.
 *
 * Printable ASCII keeps the collation order to avoid needlessly changing hashes,
 * anything else is compared by UTF-16 code units.
 */
function compareStrings(a: string, b: string): number {
  if (a === b) {
    return 0;
  }
  const length = Math.min(a.length, b.length);
  let tieBreaker = 0;
  for (let i = 0; i < length; i++) {
    const codeA = a.charCodeAt(i);
    const codeB = b.charCodeAt(i);
    if (codeA === codeB) {
      continue;
    }
    // Non-ASCII (and control characters) sort after ASCII, by code unit
    const weightA =
      codeA < 128 && asciiWeights[codeA] ? asciiWeights[codeA] : codeA + 128;
    const weightB =
      codeB < 128 && asciiWeights[codeB] ? asciiWeights[codeB] : codeB + 128;
    if (weightA !== weightB) {
      return weightA < weightB ? -1 : 1;
    }
    if (tieBreaker === 0) {
      tieBreaker = codeA > codeB ? -1 : 1; // lowercase before uppercase
    }
  }
  if (a.length !== b.length) {
    return a.length < b.length ? -1 : 1;
  }
  return tieBreaker;
}

const Serializer = /*@__PURE__*/ (function () {
  class Serializer {
    #context = new Map();

    compare(a: any, b: any): number {
      const typeA = typeof a;
      const typeB = typeof b;

      if (typeA === "string" && typeB === "string") {
        return compareStrings(a, b);
      }

      if (typeA === "number" && typeB === "number") {
        return a - b;
      }

      return compareStrings(this.serialize(a, true), this.serialize(b, true));
    }

    serialize(value: any, noQuotes?: boolean): string {
      if (value === null) {
        return "null";
      }

      switch (typeof value) {
        case "string": {
          return noQuotes ? value : `'${value}'`;
        }
        case "bigint": {
          return `${value}n`;
        }
        case "object": {
          return this.$object(value);
        }
        case "function": {
          return this.$function(value);
        }
      }

      return String(value);
    }

    serializeObject(object: any): string {
      const objString = Object.prototype.toString.call(object);

      if (objString !== "[object Object]") {
        return this.serializeBuiltInType(
          objString.length < 10 /* '[object a]'.length === 10, the minimum */
            ? `unknown:${objString}`
            : objString.slice(8, -1) /* '[object '.length === 8 */,
          object,
        );
      }

      const constructor = object.constructor;
      const objName =
        constructor === Object || constructor === undefined
          ? ""
          : constructor.name;

      // @ts-expect-error
      if (objName !== "" && globalThis[objName] === constructor) {
        return this.serializeBuiltInType(objName, object);
      }
      if ("toJSON" in object && typeof object.toJSON === "function") {
        const json = object.toJSON();
        return (
          objName +
          (json !== null && typeof json === "object"
            ? this.$object(json)
            : `(${this.serialize(json)})`)
        );
      }

      const keys = Object.keys(object).sort(compareStrings);
      let content = `${objName}{`;
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        content += `${key}:${this.serialize(object[key])}`;
        if (i < keys.length - 1) {
          content += ",";
        }
      }
      return content + "}";
    }

    serializeBuiltInType(type: string, object: any) {
      // @ts-expect-error
      const handler = this["$" + type];
      if (handler) {
        return handler.call(this, object);
      }
      if (typeof object.entries === "function") {
        return this.serializeObjectEntries(type, object.entries());
      }
      throw new Error(`Cannot serialize ${type}`);
    }

    serializeObjectEntries(type: string, entries: Iterable<[any, any]>) {
      const sortedEntries = Array.from(entries).sort((a, b) =>
        this.compare(a[0], b[0]),
      );
      let content = `${type}{`;
      for (let i = 0; i < sortedEntries.length; i++) {
        const [key, value] = sortedEntries[i];
        content += `${this.serialize(key, true)}:${this.serialize(value)}`;
        if (i < sortedEntries.length - 1) {
          content += ",";
        }
      }
      return content + "}";
    }

    $object(object: any) {
      let content = this.#context.get(object);

      if (content === undefined) {
        this.#context.set(object, `#${this.#context.size}`);
        content = this.serializeObject(object);
        this.#context.set(object, content);
      }

      return content;
    }

    $function(fn: any) {
      const fnStr = Function.prototype.toString.call(fn);
      if (
        fnStr.slice(-15 /* "[native code] }".length */) === "[native code] }"
      ) {
        return `${fn.name || ""}()[native]`;
      }
      return `${fn.name}(${fn.length})${fnStr.replace(/\s*\n\s*/g, "")}`;
    }

    $Array(arr: any[]) {
      let content = "[";
      for (let i = 0; i < arr.length; i++) {
        content += this.serialize(arr[i]);
        if (i < arr.length - 1) {
          content += ",";
        }
      }
      return content + "]";
    }

    $Date(date: any) {
      try {
        return `Date(${date.toISOString()})`;
      } catch {
        return `Date(null)`;
      }
    }

    $ArrayBuffer(arr: ArrayBuffer) {
      return `ArrayBuffer[${new Uint8Array(arr).join(",")}]`;
    }

    $Set(set: Set<any>) {
      return `Set${this.$Array(Array.from(set).sort((a, b) => this.compare(a, b)))}`;
    }

    $Map(map: Map<any, any>) {
      return this.serializeObjectEntries("Map", map.entries());
    }
  }

  for (const type of ["Error", "RegExp", "URL"] as const) {
    // @ts-ignore
    Serializer.prototype["$" + type] = function (val: any) {
      return `${type}(${val})`;
    };
  }

  for (const type of [
    "Int8Array",
    "Uint8Array",
    "Uint8ClampedArray",
    "Int16Array",
    "Uint16Array",
    "Int32Array",
    "Uint32Array",
    "Float32Array",
    "Float64Array",
  ] as const) {
    // @ts-ignore
    Serializer.prototype["$" + type] = function (arr: TypedArray) {
      return `${type}[${arr.join(",")}]`;
    };
  }

  for (const type of ["BigInt64Array", "BigUint64Array"] as const) {
    // @ts-ignore
    Serializer.prototype["$" + type] = function (arr: TypedArray) {
      return `${type}[${arr.join("n,")}${arr.length > 0 ? "n" : ""}]`;
    };
  }
  return Serializer;
})();
