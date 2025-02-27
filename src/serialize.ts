// Originally based on https://github.com/puleos/object-hash v3.0.0 (MIT)

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
  return _serialize(input);
}

function _serialize(input: any, context?: Map<any, string>): string {
  if (typeof input === "string") {
    return `'${input}'`;
  }
  const serializer = new Serializer(context);
  return serializer.serialize(input);
}

const Serializer = /*@__PURE__*/ (function () {
  class Serializer {
    #context: Map<any, string>;

    constructor(context = new Map()) {
      this.#context = context;
    }

    compare(a: any, b: any): number {
      return String.prototype.localeCompare.call(
        toComparableString(a) ?? _serialize(a, this.#context),
        toComparableString(b) ?? _serialize(b, this.#context),
      );
    }

    serialize(value: any): string {
      const type = value === null ? "null" : typeof value;
      // @ts-ignore
      const handler = this["$" + type];
      return handler.call(this, value);
    }

    serializeObject(object: any): string {
      const objString = Object.prototype.toString.call(object);

      let objType = "";
      const objectLength = objString.length;

      // '[object a]'.length === 10, the minimum
      if (objectLength < 10) {
        objType = "unknown:[" + objString + "]";
      } else {
        // '[object '.length === 8
        objType = objString.slice(8, objectLength - 1);
      }

      if (
        objType !== "Object" &&
        objType !== "Function" &&
        objType !== "AsyncFunction"
      ) {
        // @ts-expect-error
        const handler = this["$" + objType];
        if (handler) {
          return handler.call(this, object);
        }
        if (typeof object?.entries === "function") {
          return this.serializeObjectEntries(objType, object.entries());
        }
        throw new Error(`Cannot serialize ${objType}`);
      }

      const constructor = object.constructor.name;
      const objectName = constructor === "Object" ? "" : constructor;

      if (typeof object.toJSON === "function") {
        return objectName + this.$object(object.toJSON());
      }

      return this.serializeObjectEntries(objectName, Object.entries(object));
    }

    serializeObjectEntries(type: string, entries: Iterable<[string, any]>) {
      const sortedEntries = Array.from(entries).sort((a, b) =>
        this.compare(a[0], b[0]),
      );
      let content = `${type}{`;
      for (let i = 0; i < sortedEntries.length; i++) {
        const [key, value] = sortedEntries[i];
        content += `${key}:`;
        content += this.serialize(value);
        if (i < sortedEntries.length - 1) {
          content += ",";
        }
      }
      return content + "}";
    }

    $string(string: any) {
      return `'${string}'`;
    }

    $symbol(symbol: symbol) {
      return symbol.toString();
    }

    $bigint(bigint: bigint) {
      return `${bigint}n`;
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
      return `Date(${date.toJSON()})`;
    }

    $ArrayBuffer(arr: ArrayBuffer) {
      return `ArrayBuffer[${Array.prototype.slice.call(new Uint8Array(arr)).join(",")}]`;
    }

    $Set(set: Set<any>) {
      return `Set${this.$Array(Array.from(set).sort((a, b) => this.compare(a, b)))}`;
    }

    $Map(map: Map<any, any>) {
      return this.serializeObjectEntries("Map", map.entries());
    }
  }

  for (const type of ["boolean", "number", "null", "undefined"] as const) {
    // @ts-ignore
    Serializer.prototype["$" + type] = function (val: any) {
      return `${val}`;
    };
  }

  for (const type of ["Error", "RegExp", "URL"] as const) {
    // @ts-ignore
    Serializer.prototype["$" + type] = function (val: any) {
      return `${type}(${val.toString()})`;
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
    Serializer.prototype["$" + type] = function (arr: ArrayBufferLike) {
      return `${type}[${Array.prototype.slice.call(arr).join(",")}]`;
    };
  }

  for (const type of ["BigInt64Array", "BigUint64Array"] as const) {
    // @ts-ignore
    Serializer.prototype["$" + type] = function (arr: ArrayBufferLike) {
      return `${type}[${Array.prototype.slice
        .call(arr)
        .map((n) => `${n}n`)
        .join(",")}]`;
    };
  }
  return Serializer;
})();

function toComparableString(val: unknown): string | undefined {
  if (val === null) {
    return "null";
  }
  const type = typeof val;
  if (type === "symbol" || type === "function" || type === "object") {
    return undefined;
  }
  return String(val);
}
