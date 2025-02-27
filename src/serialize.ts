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
  serializer.dispatch(input);
  return serializer.serialized;
}

const Serializer = /*@__PURE__*/ (function () {
  class Serializer {
    serialized = "";

    #context: Map<any, string>;

    constructor(context = new Map()) {
      this.#context = context;
    }

    write(str: string) {
      this.serialized += str;
      return str;
    }

    dispatch(value: any): string {
      const type = value === null ? "null" : typeof value;
      // @ts-ignore
      const handler = this["$" + type];
      return handler.call(this, value);
    }

    compare(a: any, b: any): number {
      if (typeof a === "string" && typeof b === "string") {
        return a.localeCompare(b);
      }
      return _serialize(a, this.#context).localeCompare(
        _serialize(b, this.#context),
      );
    }

    writeObject(object: any): string {
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
          return this.objectEntries(objType, object.entries());
        }
        throw new Error(`Cannot serialize ${objType}`);
      }

      const constructor = object.constructor.name;
      const objectName = constructor === "Object" ? "" : constructor;

      if (typeof object.toJSON === "function") {
        return this.write(objectName) + this.$object(object.toJSON());
      }

      return this.objectEntries(objectName, Object.entries(object));
    }

    objectEntries(type: string, entries: Iterable<[string, any]>) {
      const sortedEntries = Array.from(entries).sort((a, b) =>
        this.compare(a[0], b[0]),
      );
      let content = this.write(`${type}{`);
      for (let i = 0; i < sortedEntries.length; i++) {
        const [key, value] = sortedEntries[i];
        content += this.write(`${key}:`);
        content += this.dispatch(value);
        if (i < sortedEntries.length - 1) {
          content += this.write(",");
        }
      }
      return content + this.write("}");
    }

    $string(string: any) {
      return this.write("'" + string + "'");
    }

    $symbol(symbol: symbol) {
      return this.write(symbol.toString());
    }

    $bigint(bigint: bigint) {
      return this.write(`${bigint}n`);
    }

    $object(object: any) {
      let content = this.#context.get(object);

      if (content !== undefined) {
        return this.write(content);
      }

      this.#context.set(object, `#${this.#context.size}`);
      content = this.writeObject(object);
      this.#context.set(object, content);

      return content;
    }

    $function(fn: any) {
      const fnStr = Function.prototype.toString.call(fn);
      if (
        fnStr.slice(-15 /* "[native code] }".length */) === "[native code] }"
      ) {
        return this.write(`${fn.name || ""}()[native]`);
      }
      return this.write(
        `${fn.name}(${fn.length})${fnStr.replace(/\s*\n\s*/g, "")}`,
      );
    }

    $Array(arr: any[]) {
      let content = this.write("[");
      for (let i = 0; i < arr.length; i++) {
        content += this.dispatch(arr[i]);
        if (i < arr.length - 1) {
          content += this.write(",");
        }
      }
      return content + this.write("]");
    }

    $Date(date: any) {
      return this.write(`Date(${date.toJSON()})`);
    }

    $ArrayBuffer(arr: ArrayBuffer) {
      return this.write(
        `ArrayBuffer[${Array.prototype.slice.call(new Uint8Array(arr)).join(",")}]`,
      );
    }

    $Set(set: Set<any>) {
      return (
        this.write(`Set`) +
        this.$Array(Array.from(set).sort((a, b) => this.compare(a, b)))
      );
    }

    $Map(map: Map<any, any>) {
      return this.objectEntries("Map", map.entries());
    }
  }

  for (const type of ["boolean", "number", "null", "undefined"] as const) {
    // @ts-ignore
    Serializer.prototype["$" + type] = function (val: any) {
      return this.write(val);
    };
  }

  for (const type of ["Error", "RegExp", "URL"] as const) {
    // @ts-ignore
    Serializer.prototype["$" + type] = function (val: any) {
      return this.write(`${type}(${val.toString()})`);
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
      return this.write(
        `${type}[${Array.prototype.slice.call(arr).join(",")}]`,
      );
    };
  }

  for (const type of ["BigInt64Array", "BigUint64Array"] as const) {
    // @ts-ignore
    Serializer.prototype["$" + type] = function (arr: ArrayBufferLike) {
      return this.write(
        `${type}[${Array.prototype.slice
          .call(arr)
          .map((n) => `${n}n`)
          .join(",")}]`,
      );
    };
  }
  return Serializer;
})();
