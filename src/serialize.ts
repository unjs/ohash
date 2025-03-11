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

const Serializer = /*@__PURE__*/ (function () {
  class Serializer {
    #context = new Map();

    compare(a: any, b: any): number {
      const typeA = typeof a;
      const typeB = typeof b;

      if (typeA !== typeB) {
        return typeA < typeB ? -1 : 1;
      }
      if (typeA === "number" || typeA === "bigint") {
        return a < b ? -1 : a > b ? 1 : 0;
      }
      if (typeA !== "string") {
        a = this.serialize(a);
        b = this.serialize(b);
      }
      return this.compareStrings(a, b);
    }

    compareStrings(a: string, b: string): number {
      const lengthA = a.length;
      const lengthB = b.length;

      if (lengthA !== lengthB) {
        return lengthA < lengthB ? -1 : 1;
      }
      return a < b ? -1 : a > b ? 1 : 0;
    }

    sort<T>(array: T[], compare: (a: T, b: T) => number): T[] {
      if (array.length <= 1) {
        return array;
      }

      if (array.length > 10) {
        return array.sort(compare);
      }

      // Use insertion sort for small arrays (faster)
      for (let i = 1; i < array.length; i++) {
        const current = array[i];
        let j = i;
        while (j > 0 && compare(current, array[j - 1]) === -1) {
          array[j] = array[--j];
        }
        array[j] = current;
      }
      return array;
    }

    serialize(value: any): string {
      if (value === null) {
        return "null";
      }

      switch (typeof value) {
        case "string": {
          return `'${value}'`;
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

      const keys = this.sort(Object.keys(object), (a, b) =>
        this.compareStrings(a, b),
      );
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
      const sortedEntries = this.sort(Array.from(entries), (a, b) =>
        this.compare(a[0], b[0]),
      );
      let content = `${type}{`;
      for (let i = 0; i < sortedEntries.length; i++) {
        const [key, value] = sortedEntries[i];
        content += `${typeof key === "string" ? key : this.serialize(key)}:${this.serialize(value)}`;
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

    $Date(date: Date) {
      return `Date(${date.valueOf()})`;
    }

    $ArrayBuffer(arr: ArrayBuffer) {
      return `ArrayBuffer[${new Uint8Array(arr).join(",")}]`;
    }

    $Set(set: Set<any>) {
      return `Set${this.$Array(this.sort(Array.from(set), (a, b) => this.compare(a, b)))}`;
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
