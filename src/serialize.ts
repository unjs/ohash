// Originally based on https://github.com/puleos/object-hash v3.0.0 (MIT)

/**
 * Serializes any input value into a string for hashing.
 *
 * @param input any value to serialize
 * @return {string} serialized string value
 */
export function serialize(input: any): string {
  if (typeof input === "string") {
    return `'${input}'`;
  }
  const serializer = new Serializer();
  serializer.dispatch(input);
  return serializer.serialized;
}

const Serializer = /*@__PURE__*/ (function () {
  class Serializer {
    serialized = "";

    #context = new Map();

    write(str: string) {
      this.serialized += str;
    }

    dispatch(value: any): string | void {
      const type = value === null ? "null" : typeof value;
      // @ts-ignore
      const handler = this[type];
      return handler.call(this, value);
    }

    object(object: any): string | void {
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

      let objectNumber = null;

      if ((objectNumber = this.#context.get(object)) === undefined) {
        this.#context.set(object, this.#context.size);
      } else {
        return this.write(`#${objectNumber}`);
      }

      if (
        objType !== "Object" &&
        objType !== "Function" &&
        objType !== "AsyncFunction"
      ) {
        // @ts-expect-error
        const handler = this[objType.toLowerCase()];
        if (handler) {
          handler.call(this, object);
        } else {
          this.unknown(object, objType);
        }
      } else {
        const constructor = object.constructor.name;
        if (constructor !== "Object") {
          this.write(`${constructor}`);
        }
        if (typeof object.toJSON === "function") {
          return this.object(object.toJSON());
        }
        this.write("{");
        for (const key of Object.keys(object).sort()) {
          this.dispatch(key);
          this.write(":");
          this.dispatch(object[key]);
          this.write(",");
        }
        this.write("}");
      }
    }

    array(arr: any, unordered: boolean = false): string | void {
      if (!unordered || arr.length <= 1) {
        this.write("[");
        for (const entry of arr) {
          this.dispatch(entry);
          this.write(",");
        }
        this.write("]");
        return;
      }

      // The unordered case is a little more complicated: since there is no canonical ordering on objects,
      // i.e. {a:1} < {a:2} and {a:1} > {a:2} are both false,
      // We first serialize each entry using a PassThrough stream before sorting.
      // also: we can’t use the same context for all entries since the order of hashing should *not* matter. instead,
      // we keep track of the additions to a copy of the context and add all of them to the global context when we’re done
      const contextAdditions = new Map();
      const entries = arr.map((entry: any) => {
        const hasher = new Serializer();
        hasher.dispatch(entry);
        for (const [key, value] of hasher.#context) {
          contextAdditions.set(key, value);
        }
        return hasher.toString();
      });
      this.#context = contextAdditions;
      return this.array(entries.sort(), false);
    }

    unknown(value: any, type: string) {
      this.write(`(${type})`);
      if (typeof value?.entries === "function") {
        return this.array(Array.from(value.entries()), true /* ordered */);
      }
      throw new Error(`Cannot serialize ${type}`);
    }

    string(string: any) {
      this.write("'" + string + "'");
    }

    date(date: any) {
      return this.write(`Date(${date.toJSON()})`);
    }

    arraybuffer(arr: ArrayBuffer) {
      this.write(`(arraybuffer:${arr.byteLength})`);
      this.write(Array.prototype.slice.call(new Uint8Array(arr)).join(","));
    }

    set(set: Set<any>) {
      this.write(`Set(${[...set].sort().join(",")})`);
    }

    map(map: Map<any, any>) {
      this.write(`Map(`);
      for (const [key, value] of map) {
        this.dispatch(key);
        this.write(":");
        this.dispatch(value);
        this.write(";");
      }
      this.write(")");
    }

    function(fn: any) {
      const fnStr = Function.prototype.toString.call(fn);
      if (
        fnStr.slice(-15 /* "[native code] }".length */) === "[native code] }"
      ) {
        return this.write(`${fn.name || ""}()[native]`);
      }
      this.write(`${fn.name}(${fn.length})${fnStr.replace(/\s*\n\s*/g, "")}`);
    }
  }

  for (const type of ["boolean", "number", "null", "undefined"] as const) {
    // @ts-ignore
    Serializer.prototype[type] = function (val: any) {
      return this.write(val);
    };
  }

  for (const type of ["error", "regexp", "url", "bigint", "symbol"] as const) {
    // @ts-ignore
    Serializer.prototype[type] = function (val: any) {
      return this.write(`(${type})${val.toString()}`);
    };
  }

  for (const type of [
    "uint8array",
    "uint8clampedarray",
    "int8array",
    "uint16array",
    "int16array",
    "uint32array",
    "int32array",
    "float32array",
    "float64array",
  ] as const) {
    // @ts-ignore
    Serializer.prototype[type] = function (arr: ArrayBufferLike) {
      this.write(`${type}[${Array.prototype.slice.call(arr).join(",")}]`);
    };
  }
  return Serializer;
})();
