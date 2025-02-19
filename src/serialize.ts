// Based on https://github.com/puleos/object-hash v3.0.0 (MIT)

export interface SerializeOptions {
  /**
   * Function to determine if a key should be excluded from hashing.
   * @optional
   * @param key - The key to check for exclusion.
   * @returns {boolean} - Returns true to exclude the key from hashing.
   */
  excludeKeys?: ((key: string) => boolean) | undefined;

  /**
   * Specifies whether to exclude values from hashing, so that only the object keys are hashed.
   * @optional
   */
  excludeValues?: boolean | undefined;

  /**
   * Specifies whether to ignore objects of unknown type (not directly serialisable) when hashing.
   * @optional
   * @default false
   */
  ignoreUnknown?: boolean | undefined;

  /**
   * A function that replaces values before they are hashed, which can be used to customise the hashing process.
   * @optional
   * @param value - The current value to be hashed.
   * @returns {any} - The value to use for hashing instead.
   */
  replacer?: ((value: any) => any) | undefined;

  /**
   * Specifies whether the 'name' property of functions should be taken into account when hashing.
   * @optional
   * @default false
   */
  respectFunctionNames?: boolean | undefined;

  /**
   * Specifies whether properties of functions should be taken into account when hashing.
   * @optional
   * @default false
   */
  respectFunctionProperties?: boolean | undefined;

  /**
   * Specifies whether to include type-specific properties such as prototype or constructor in the hash to distinguish between types.
   * @optional
   * @default false
   */
  respectType?: boolean | undefined;

  /**
   * Specifies whether arrays should be sorted before hashing to ensure consistent order.
   * @optional
   * @default false
   */
  unorderedArrays?: boolean | undefined;

  /**
   * Specifies whether Set and Map instances should be sorted by key before hashing to ensure consistent order.
   * @optional
   * @default true
   */
  unorderedObjects?: boolean | undefined;

  /**
   * Specifies whether the elements of `Set' and keys of `Map' should be sorted before hashing to ensure consistent order.
   * @optional
   * @default false
   */
  unorderedSets?: boolean | undefined;
}

/**
 * Serializes any input value into a string for hashing.
 *
 * @param {object} object value to hash
 * @param {SerializeOptions} options hashing options. See {@link SerializeOptions}.
 * @return {string} serialized string value
 */
export function serialize(object: any, options?: SerializeOptions): string {
  if (typeof object === "string" && !options) {
    return `string:${object.length}:${object}`;
  }
  const serializer = new Serializer(options);
  serializer.dispatch(object);
  return serializer.toString();
}

const Serializer = /*@__PURE__*/ (function () {
  const defaultPrototypesKeys = Object.freeze([
    "prototype",
    "__proto__",
    "constructor",
  ]);

  class Serializer {
    buff = "";
    #context = new Map();
    options: SerializeOptions;

    constructor(options: SerializeOptions = {}) {
      this.options = options;
    }

    write(str: string) {
      this.buff += str;
    }

    toString() {
      return this.buff;
    }

    getContext() {
      return this.#context;
    }

    dispatch(value: any): string | void {
      if (this.options.replacer) {
        value = this.options.replacer(value);
      }
      const type = value === null ? "null" : typeof value;
      // @ts-ignore
      const handler = this[type];
      return handler.call(this, value);
    }

    object(object: any): string | void {
      if (object instanceof Date) {
        return this.date(object);
      }

      if (object && typeof object.toJSON === "function") {
        return this.object(object.toJSON());
      }

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

      objType = objType.toLowerCase();

      let objectNumber = null;

      if ((objectNumber = this.#context.get(object)) === undefined) {
        this.#context.set(object, this.#context.size);
      } else {
        return this.dispatch("[CIRCULAR:" + objectNumber + "]");
      }

      if (
        typeof Buffer !== "undefined" &&
        Buffer.isBuffer &&
        Buffer.isBuffer(object)
      ) {
        this.write("buffer:");
        return this.write(object.toString("utf8"));
      }

      if (
        objType !== "object" &&
        objType !== "function" &&
        objType !== "asyncfunction"
      ) {
        // @ts-ignore
        if (this[objType]) {
          // @ts-ignore
          this[objType](object);
        } else if (!this.options.ignoreUnknown) {
          this.unknown(object, objType);
        }
      } else {
        let keys = Object.keys(object);
        if (this.options.unorderedObjects !== false) {
          keys = keys.sort();
        }
        let extraKeys = [] as readonly string[];
        // Make sure to incorporate special properties, so Types with different prototypes will produce
        // a different hash and objects derived from different functions (`new Foo`, `new Bar`) will
        // produce different hashes. We never do this for native functions since some seem to break because of that.
        if (this.options.respectType && !isNativeFunction(object)) {
          extraKeys = defaultPrototypesKeys;
        }

        if (this.options.excludeKeys) {
          keys = keys.filter((key) => {
            return !this.options.excludeKeys!(key);
          });
          extraKeys = extraKeys.filter((key) => {
            return !this.options.excludeKeys!(key);
          });
        }

        this.write("object:" + (keys.length + extraKeys.length) + ":");
        const dispatchForKey = (key: string) => {
          this.dispatch(key);
          this.write(":");
          if (!this.options.excludeValues) {
            this.dispatch(object[key]);
          }
          this.write(",");
        };
        for (const key of keys) {
          dispatchForKey(key);
        }
        for (const key of extraKeys) {
          dispatchForKey(key);
        }
      }
    }

    array(arr: any, unordered: boolean): string | void {
      unordered =
        unordered === undefined ? !!this.options.unorderedArrays : unordered; // default to this.options.unorderedArrays

      this.write("array:" + arr.length + ":");
      if (!unordered || arr.length <= 1) {
        for (const entry of arr) {
          this.dispatch(entry);
        }
        return;
      }

      // The unordered case is a little more complicated: since there is no canonical ordering on objects,
      // i.e. {a:1} < {a:2} and {a:1} > {a:2} are both false,
      // We first serialize each entry using a PassThrough stream before sorting.
      // also: we can’t use the same context for all entries since the order of hashing should *not* matter. instead,
      // we keep track of the additions to a copy of the context and add all of them to the global context when we’re done
      const contextAdditions = new Map();
      const entries = arr.map((entry: any) => {
        const hasher = new Serializer(this.options);
        hasher.dispatch(entry);
        for (const [key, value] of hasher.getContext()) {
          contextAdditions.set(key, value);
        }
        return hasher.toString();
      });
      this.#context = contextAdditions;
      entries.sort();
      return this.array(entries, false);
    }

    date(date: any) {
      return this.write("date:" + date.toJSON());
    }

    unknown(value: any, type: string) {
      this.write(type);
      if (!value) {
        return;
      }
      this.write(":");
      if (value && typeof value.entries === "function") {
        return this.array(Array.from(value.entries()), true /* ordered */);
      }
    }

    boolean(bool: any) {
      return this.write("bool:" + bool);
    }

    string(string: any) {
      this.write("string:" + string.length + ":");
      this.write(string);
    }

    function(fn: any) {
      this.write("fn:");
      if (isNativeFunction(fn)) {
        this.dispatch("[native]");
      } else {
        this.dispatch(fn.toString());
      }

      if (this.options.respectFunctionNames) {
        // Make sure we can still distinguish native functions by their name, otherwise String and Function will have the same hash
        this.dispatch("function-name:" + String(fn.name));
      }

      if (this.options.respectFunctionProperties) {
        this.object(fn);
      }
    }

    number(number: any) {
      return this.write("number:" + number);
    }

    null() {
      return this.write("Null");
    }

    undefined() {
      return this.write("Undefined");
    }

    arraybuffer(arr: any) {
      this.write("arraybuffer:");
      return this.dispatch(new Uint8Array(arr));
    }

    map(map: any) {
      this.write("map:");
      const arr = [...map];
      return this.array(arr, !!this.options.unorderedSets);
    }

    set(set: any) {
      this.write("set:");
      const arr = [...set];
      return this.array(arr, !!this.options.unorderedSets);
    }

    file(file: any) {
      this.write("file:");
      return this.dispatch([
        file.name,
        file.size,
        file.type,
        file.lastModified,
      ]);
    }

    blob(_val: Blob) {
      throw new Error("Cannot serialize Blob");
    }
  }

  for (const type of [
    "error",
    "xml",
    "regexp",
    "url",
    "bigint",
    "symbol",
  ] as const) {
    // @ts-ignore
    Serializer.prototype[type] = function (val: any) {
      return this.write(type + ":" + val.toString());
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
    Serializer.prototype[type] = function (arr: any) {
      this.write(type + ":");
      return this.dispatch(Array.prototype.slice.call(arr));
    };
  }
  return Serializer;
})();

/** Check if the given function is a native function */
function isNativeFunction(f: any) {
  if (typeof f !== "function") {
    return false;
  }
  return (
    Function.prototype.toString
      .call(f)
      .slice(-15 /* "[native code] }".length */) === "[native code] }"
  );
}
