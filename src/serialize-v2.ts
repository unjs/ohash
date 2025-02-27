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
export function serializeV2(input: any): string {
  return _serialize(input);
}

function _serialize(input: any, parent?: any): string {
  if (typeof input === "string") {
    return `'${input}'`;
  }
  const serializer = new Serializer(parent);
  serializer.dispatch(input);
  return serializer.serialized;
}

const Serializer = /*@__PURE__*/ (function () {
  class Serializer {
    serialized = "";

    #context: Map<any, string | [number, number]> = new Map();
    #parent: Serializer | undefined;

    constructor(parent?: Serializer) {
      this.#parent = parent;
    }

    setObjectContent(object: any, content: string): void {
      if (this.#parent) {
        return this.#parent.setObjectContent(object, content);
      }

      this.#context.set(object, content);
    }

    setObjectPosition(object: any, position: number): void {
      if (this.#parent) {
        return this.#parent.setObjectContent(
          object,
          this.serialized.slice(position),
        );
      }

      this.#context.set(object, [position, this.serialized.length]);
    }

    getContextSize(): number {
      return this.#parent ? this.#parent.getContextSize() : this.#context.size;
    }

    getObjectContent(object: any): string | undefined {
      if (this.#parent) {
        return this.#parent.getObjectContent(object);
      }

      let item = this.#context.get(object);

      if (item !== undefined && typeof item !== "string") {
        item = this.serialized.slice(item[0], item[1]);
        this.#context.set(object, item);
      }

      return item;
    }

    write(str: string) {
      this.serialized += str;
    }

    dispatch(value: any): string | void {
      const type = value === null ? "null" : typeof value;
      // @ts-ignore
      const handler = this["$" + type];
      return handler.call(this, value);
    }

    compare(a: any, b: any): number {
      if (typeof a === "string" && typeof b === "string") {
        return a.localeCompare(b);
      }
      return _serialize(a, this).localeCompare(_serialize(b, this));
    }

    writeObject(object: any) {
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
        } else {
          if (typeof object?.entries === "function") {
            return this.objectEntries(objType, object.entries());
          }
          throw new Error(`Cannot serialize ${objType}`);
        }
      } else {
        const constructor = object.constructor.name;
        const objectName = constructor === "Object" ? "" : constructor;
        if (typeof object.toJSON === "function") {
          if (objectName) {
            this.write(objectName);
          }
          return this.$object(object.toJSON());
        }
        this.objectEntries(objectName, Object.entries(object));
      }
    }

    objectEntries(type: string, entries: Iterable<[string, any]>) {
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

    $string(string: any) {
      this.write("'" + string + "'");
    }

    $symbol(symbol: symbol) {
      this.write(symbol.toString());
    }

    $bigint(bigint: bigint) {
      this.write(`${bigint}n`);
    }

    $object(object: any): string | void {
      const objectContent = this.getObjectContent(object);

      if (objectContent !== undefined) {
        return this.write(objectContent);
      }

      const position = this.serialized.length;

      this.setObjectContent(object, `#${this.getContextSize()}`);
      this.writeObject(object);
      this.setObjectPosition(object, position);
    }

    $function(fn: any) {
      const fnStr = Function.prototype.toString.call(fn);
      if (
        fnStr.slice(-15 /* "[native code] }".length */) === "[native code] }"
      ) {
        return this.write(`${fn.name || ""}()[native]`);
      }
      this.write(`${fn.name}(${fn.length})${fnStr.replace(/\s*\n\s*/g, "")}`);
    }

    $Array(arr: any[]): string | void {
      this.write("[");
      for (let i = 0; i < arr.length; i++) {
        this.dispatch(arr[i]);
        if (i < arr.length - 1) {
          this.write(",");
        }
      }
      this.write("]");
    }

    $Date(date: any) {
      return this.write(`Date(${date.toJSON()})`);
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
