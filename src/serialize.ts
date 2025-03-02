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
  if (typeof input === "string") {
    return `'${input}'`;
  }
  return new Serializer().serialize(input);
}

const Serializer = /*@__PURE__*/ (function () {
  class Serializer {
    #context = new Map();

    compare(a: any, b: any): number {
      if (typeof a === "number" && typeof b === "number") {
        return a - b;
      }

      return String.prototype.localeCompare.call(
        this.serialize(a, true),
        this.serialize(b, true),
      );
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
      const constructorName = object.constructor?.name;
      const objName =
        constructorName === "Object" || constructorName === undefined
          ? ""
          : constructorName;

      let objType =
        objString.length < 10 // '[object a]'.length === 10, the minimum
          ? `unknown:${objString}`
          : objString.slice(8, -1); // '[object '.length === 8

      if (objType === "Object" && objName in globalThis) {
        objType = objName;
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

      if (typeof object.toJSON === "function") {
        return objName + this.$object(object.toJSON());
      }

      return this.serializeObjectEntries(objName, Object.entries(object));
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
      return `ArrayBuffer[${Array.prototype.slice.call(new Uint8Array(arr)).join(",")}]`;
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
