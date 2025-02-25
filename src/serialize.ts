// Originally based on https://github.com/puleos/object-hash v3.0.0 (MIT)

/**
 * Serializes any input value into a string for hashing.
 *
 * This method uses best efforts to generate stable serialized values.
 * However, it is not designed for security purposes.
 * Keep in mind that there is always a chance of intentional collisions caused by user input.
 *
 * @param input any value to serialize
 * @param context optional reusable context that stores serialized content of objects
 * @return {string} serialized string value
 */
export function serialize(input: any, context?: Map<object, string>): string {
  if (typeof input === "string") {
    return `'${input}'`;
  }
  const serializer = new Serializer(context);
  serializer.dispatch(input);
  return serializer.serialized;
}

const Serializer = /*@__PURE__*/ (function () {
  class Serializer {
    #buffer = "";
    #serialized = "";

    constructor(protected context: Map<object, string> = new Map()) {}

    get serialized() {
      this.commit();
      return this.#serialized;
    }

    write(str: string | boolean | number | null | undefined) {
      this.#buffer += str;
    }

    commit() {
      this.#serialized += this.#buffer;
      this.#buffer = "";
    }

    dispatch(value: any) {
      // @ts-ignore
      this["$" + (value === null ? "null" : typeof value)].call(this, value);
    }

    compare(a: any, b: any): number {
      if (typeof a === "string" && typeof b === "string") {
        return a.localeCompare(b);
      }
      return serialize(a, this.context).localeCompare(
        serialize(b, this.context),
      );
    }

    writeObject(object: any) {
      const objString = Object.prototype.toString.call(object);
      const objType =
        objString.length < 10
          ? `unknown:[${objString}]` // '[object a]'.length === 10, the minimum
          : objString.slice(8, -1); // '[object '.length === 8

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
          return this.writeObjectEntries(objType, object.entries());
        }

        throw new TypeError(`Cannot serialize ${objType}`);
      }

      const constructorName = object.constructor.name;
      const finalType = constructorName === "Object" ? "" : constructorName;

      if (typeof object.toJSON === "function") {
        this.write(finalType);
        return this.$object(object.toJSON());
      }

      this.writeObjectEntries(finalType, Object.entries(object));
    }

    writeObjectEntries(type: string, entries: Iterable<[string, any]>) {
      const sortedEntries = Array.from(entries).sort((a, b) =>
        this.compare(a[0], b[0]),
      );
      this.write(`${type}{`);
      for (let i = 0; i < sortedEntries.length; i++) {
        const [key, value] = sortedEntries[i];
        this.write(`${key}:`);
        this.dispatch(value);
        if (i < sortedEntries.length - 1) {
          this.write(",");
        }
      }
      this.write("}");
    }

    $string(string: string) {
      this.write(`'${string}'`);
    }

    $symbol(symbol: symbol) {
      this.write(symbol.toString());
    }

    $bigint(bigint: bigint) {
      this.write(`${bigint}n`);
    }

    $object(object: object) {
      if (this.context.has(object)) {
        return this.write(this.context.get(object));
      }

      this.context.set(object, `#${this.context.size}`);
      this.commit();
      this.writeObject(object);
      this.context.set(object, this.#buffer);
    }

    $function(fn: () => any) {
      const fnStr = Function.prototype.toString.call(fn);
      if (
        fnStr.slice(-15 /* "[native code] }".length */) === "[native code] }"
      ) {
        return this.write(`${fn.name || ""}()[native]`);
      }
      this.write(`${fn.name}(${fn.length})${fnStr.replace(/\s*\n\s*/g, "")}`);
    }

    $Array(arr: Array<any>) {
      this.write("[");
      for (let i = 0; i < arr.length; i++) {
        this.dispatch(arr[i]);
        if (i < arr.length - 1) {
          this.write(",");
        }
      }
      this.write("]");
    }

    $Date(date: Date) {
      this.write(`Date(${date.toJSON()})`);
    }

    $ArrayBuffer(arr: ArrayBuffer) {
      this.write(
        `ArrayBuffer[${Array.prototype.slice.call(new Uint8Array(arr)).join(",")}]`,
      );
    }

    $Set(set: Set<any>) {
      this.write(`Set`);
      this.$Array(Array.from(set).sort((a, b) => this.compare(a, b)));
    }

    $Map(map: Map<any, any>) {
      this.writeObjectEntries("Map", map.entries());
    }
  }

  for (const type of ["boolean", "number", "null", "undefined"] as const) {
    // @ts-ignore
    Serializer.prototype["$" + type] = function (
      val: boolean | number | null | undefined,
    ) {
      this.write(val);
    };
  }

  for (const type of ["Error", "RegExp", "URL"] as const) {
    // @ts-ignore
    Serializer.prototype["$" + type] = function (val: Error | RegExp | URL) {
      this.write(`${type}(${val.toString()})`);
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
      this.write(`${type}[${Array.prototype.slice.call(arr).join(",")}]`);
    };
  }

  for (const type of ["BigInt64Array", "BigUint64Array"] as const) {
    // @ts-ignore
    Serializer.prototype["$" + type] = function (arr: ArrayBufferLike) {
      this.write(
        `${type}[${Array.prototype.slice
          .call(arr)
          .map((n) => `${n}n`)
          .join(",")}]`,
      );
    };
  }
  return Serializer;
})();
