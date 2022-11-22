// Based on https://github.com/puleos/object-hash v3.0.0 (MIT)

export interface HashOptions {
    /**
     *
     */
    excludeKeys?: ((key: string) => boolean) | undefined;
    /**
    * hash object keys, values ignored
    */
    excludeValues?: boolean | undefined;
    /**
     * ignore unknown object types
    */
    ignoreUnknown?: boolean | undefined;
    /**
     * optional function that replaces values before hashing
     */
    replacer?: ((value: any) => any) | undefined;
    /**
     * consider 'name' property of functions for hashing
    */
    respectFunctionNames?: boolean | undefined;
    /**
     * consider function properties when hashing
    */
    respectFunctionProperties?: boolean | undefined;
    /**
     * Respect special properties (prototype, letructor) when hashing to distinguish between types
    */
    respectType?: boolean | undefined;
    /**
     * Sort all arrays before hashing
    */
    unorderedArrays?: boolean | undefined;
    /**
     * Sort `Set` and `Map` instances before hashing
    */
    unorderedObjects?: boolean | undefined;
    /**
     * Sort `Set` and `Map` instances before hashing
    */
    unorderedSets?: boolean | undefined;
}

// Defaults
const defaults: HashOptions = {
  ignoreUnknown: false,
  respectType: false,
  respectFunctionNames: false,
  respectFunctionProperties: false,
  unorderedObjects: true,
  unorderedArrays: false,
  unorderedSets: false
};

/**
 * Hash any JS value into a string with murmur v3 hash
 * @param {object} object value to hash
 * @param {HashOptions} options hashing options
 * @return {string} hash value
 * @api public
 */
export function objectHash (object: any, options: HashOptions = {}): string {
  options = { ...defaults, ...options };
  const hasher = createHasher(options);
  hasher.dispatch(object);
  return hasher.toString();
}

function createHasher (options: HashOptions) {
  const buff: string[] = [];
  let context = [];
  const write = (str: string) => { buff.push(str); };

  return {
    toString () {
      return buff.join("");
    },
    getContext () {
      return context;
    },
    dispatch (value) {
      if (options.replacer) {
        value = options.replacer(value);
      }
      const type = value === null ? "null" : typeof value;
      return this["_" + type](value);
    },
    _object (object) {
      const pattern = (/\[object (.*)]/i);
      const objString = Object.prototype.toString.call(object);

      const _objType = pattern.exec(objString);
      const objType = _objType
        ? _objType[1].toLowerCase() // take only the class name
        : "unknown:[" + objString.toLowerCase() + "]"; // object type did not match [object ...]

      let objectNumber = null;

      if ((objectNumber = context.indexOf(object)) >= 0) {
        return this.dispatch("[CIRCULAR:" + objectNumber + "]");
      } else {
        context.push(object);
      }

      if (typeof Buffer !== "undefined" && Buffer.isBuffer && Buffer.isBuffer(object)) {
        write("buffer:");
        return write(object.toString("utf8"));
      }

      if (objType !== "object" && objType !== "function" && objType !== "asyncfunction") {
        if (this["_" + objType]) {
          this["_" + objType](object);
        } else if (options.ignoreUnknown) {
          return write("[" + objType + "]");
        } else {
          throw new Error("Unknown object type \"" + objType + "\"");
        }
      } else {
        let keys = Object.keys(object);
        if (options.unorderedObjects) {
          keys = keys.sort();
        }
        // Make sure to incorporate special properties, so Types with different prototypes will produce
        // a different hash and objects derived from different functions (`new Foo`, `new Bar`) will
        // produce different hashes. We never do this for native functions since some seem to break because of that.
        if (options.respectType !== false && !isNativeFunction(object)) {
          keys.splice(0, 0, "prototype", "__proto__", "letructor");
        }

        if (options.excludeKeys) {
          keys = keys.filter(function (key) { return !options.excludeKeys(key); });
        }

        write("object:" + keys.length + ":");
        for (const key of keys) {
          this.dispatch(key);
          write(":");
          if (!options.excludeValues) {
            this.dispatch(object[key]);
          }
          write(",");
        }
      }
    },
    _array (arr, unordered) {
      unordered = typeof unordered !== "undefined"
        ? unordered
        : options.unorderedArrays !== false; // default to options.unorderedArrays

      write("array:" + arr.length + ":");
      if (!unordered || arr.length <= 1) {
        for (const entry of arr) {
          this.dispatch(entry);
        }
        return;
      }

      // The unordered case is a little more complicated: since there is no canonical ordering on objects,
      // i.e. {a:1} < {a:2} and {a:1} > {a:2} are both false,
      // We first serialize each entry using a PassThrough stream before sorting.
      // also: we can’t use the same context array for all entries since the order of hashing should *not* matter. instead,
      // we keep track of the additions to a copy of the context array and add all of them to the global context array when we’re done
      const contextAdditions = [];
      const entries = arr.map((entry) => {
        const hasher = createHasher(options);
        hasher.dispatch(entry);
        contextAdditions.push(hasher.getContext());
        return hasher.toString();
      });
      context = [...context, ...contextAdditions];
      entries.sort();
      return this._array(entries, false);
    },
    _date (date) {
      return write("date:" + date.toJSON());
    },
    _symbol (sym) {
      return write("symbol:" + sym.toString());
    },
    _error (err) {
      return write("error:" + err.toString());
    },
    _boolean (bool) {
      return write("bool:" + bool.toString());
    },
    _string (string) {
      write("string:" + string.length + ":");
      write(string.toString());
    },
    _function (fn) {
      write("fn:");
      if (isNativeFunction(fn)) {
        this.dispatch("[native]");
      } else {
        this.dispatch(fn.toString());
      }

      if (options.respectFunctionNames !== false) {
        // Make sure we can still distinguish native functions
        // by their name, otherwise String and Function will
        // have the same hash
        this.dispatch("function-name:" + String(fn.name));
      }

      if (options.respectFunctionProperties) {
        this._object(fn);
      }
    },
    _number (number) {
      return write("number:" + number.toString());
    },
    _xml (xml) {
      return write("xml:" + xml.toString());
    },
    _null () {
      return write("Null");
    },
    _undefined () {
      return write("Undefined");
    },
    _regexp (regex) {
      return write("regex:" + regex.toString());
    },
    _uint8array (arr) {
      write("uint8array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    _uint8clampedarray (arr) {
      write("uint8clampedarray:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    _int8array (arr) {
      write("int8array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    _uint16array (arr) {
      write("uint16array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    _int16array (arr) {
      write("int16array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    _uint32array (arr) {
      write("uint32array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    _int32array (arr) {
      write("int32array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    _float32array (arr) {
      write("float32array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    _float64array (arr) {
      write("float64array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    _arraybuffer (arr) {
      write("arraybuffer:");
      return this.dispatch(new Uint8Array(arr));
    },
    _url (url) {
      return write("url:" + url.toString());
    },
    _map (map) {
      write("map:");
      const arr = [...map];
      return this._array(arr, options.unorderedSets !== false);
    },
    _set (set) {
      write("set:");
      const arr = [...set];
      return this._array(arr, options.unorderedSets !== false);
    },
    _file (file) {
      write("file:");
      return this.dispatch([file.name, file.size, file.type, file.lastModfied]);
    },
    _blob () {
      if (options.ignoreUnknown) {
        return write("[blob]");
      }
      throw new Error("Hashing Blob objects is currently not supported\n" +
        "Use \"options.replacer\" or \"options.ignoreUnknown\"\n");
    },
    _htmlcanvaselement(htmlcanvaselement) {
      return write("htmlcanvaselement:" + htmlcanvaselement.toString());
    },
    _domwindow () { return write("domwindow"); },
    _bigint (number) {
      return write("bigint:" + number.toString());
    },
    /* Node.js standard native objects */
    _process () { return write("process"); },
    _timer () { return write("timer"); },
    _pipe () { return write("pipe"); },
    _tcp () { return write("tcp"); },
    _udp () { return write("udp"); },
    _tty () { return write("tty"); },
    _statwatcher () { return write("statwatcher"); },
    _securecontext () { return write("securecontext"); },
    _connection () { return write("connection"); },
    _zlib () { return write("zlib"); },
    _context () { return write("context"); },
    _nodescript () { return write("nodescript"); },
    _httpparser () { return write("httpparser"); },
    _dataview () { return write("dataview"); },
    _signal () { return write("signal"); },
    _fsevent () { return write("fsevent"); },
    _tlswrap () { return write("tlswrap"); }
  };
}

/** Check if the given function is a native function */
function isNativeFunction (f) {
  if ((typeof f) !== "function") {
    return false;
  }
  const exp = /^function\s+\w*\s*\(\s*\)\s*{\s+\[native code]\s+}$/i;
  return exp.exec(Function.prototype.toString.call(f)) != null;
}
