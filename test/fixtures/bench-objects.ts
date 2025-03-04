export type BenchObjectPreset = {
  count: number;
  size: "small" | "large";
  circular?: boolean;
  referenced?: boolean;
};

export function createBenchObjects({
  count = 100,
  size = "small",
  circular = false,
  referenced = false,
}: BenchObjectPreset) {
  let object: Record<string, any> = {
    string: "test",
    number: 42,
    boolean: true,
    nullValue: null,
    undefinedValue: undefined,
    date: new Date(0),
  };

  if (size === "large") {
    object = {
      ...object,
      regex: /.*/,
      url: new URL("https://example.com"),
      symbol: Symbol("test"),
      bigint: 9_007_199_254_740_991n,
      set: new Set([1, 2, 3, {}]),
      map: new Map<any, any>([["key", "value"]]),
      array: [1, 2, "x", 3],
      int8Array: new Int8Array([1, 2, 3]),
      uint8Array: new Uint8Array([1, 2, 3]),
      uint8ClampedArray: new Uint8ClampedArray([1, 2, 3]),
      int16Array: new Int16Array([1, 2, 3]),
      uint16Array: new Uint16Array([1, 2, 3]),
      int32Array: new Int32Array([1, 2, 3]),
      uint32Array: new Uint32Array([1, 2, 3]),
      float32Array: new Float32Array([1, 2, 3]),
      float64Array: new Float64Array([1, 2, 3]),
      bigInt64Array: new BigInt64Array([1n, 2n, 3n]),
      bigUint64Array: new BigUint64Array([1n, 2n, 3n]),
      buffer: Buffer.from("hello"),
      nestedObject: { a: 1, b: 2 },
      classInstance: new (class Test {
        x = 1;
      })(),
      toJSONInstance: new (class Test {
        toJSON() {
          return [1, 2, 3];
        }
      })(),
      formData: (() => {
        const form = new FormData();
        form.set("foo", "bar");
        form.set("bar", "baz");
        return form;
      })(),
      nativeFunction: Array,
      customFunction: function sum(a: number, b: number) {
        return a + b;
      },
      arrowFunction: (a: number, b: number) => a + b,
      asyncFunction: async (a: number, b: number) => a + b,
      generatorFunction: function* () {
        yield 1;
        yield 2;
        yield 3;
      },
      asyncGeneratorFunction: async function* () {
        yield 1;
        yield 2;
        yield 3;
      },
      circular: {},
    };
  }

  if (circular) {
    if (size === "small") {
      object.circular = object;
    }

    if (size === "large") {
      const circularObject = { ...object };

      circularObject.circular = object;
      /** These don't work with ohash v1 **/
      // circularObject.map.set("object", object);
      // circularObject.set.add(object);
      // circularObject.set.add(circularObject);

      // object.circular = circularObject;
      // object.map.set("object", object);
      // object.map.set("clonedObject", circularObject);
      // object.set.add(object);
      // object.set.add(circularObject);

      for (let i = 0; i < 1000; i++) {
        object.set.add(i);
        object.set.add(Symbol(i));
        object.set.add(`${i}`);
      }
    }
  }

  const objects = [];
  for (let i = 0; i < count; i++) {
    objects.push(referenced ? object : { ...object });
  }

  return objects;
}
