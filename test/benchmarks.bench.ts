import { bench, describe } from "vitest";
import { serialize } from "../src";
import { serializeMain } from "../src/serialize-main";
import { serializeV0 } from "../src/serialize-v0";
import { serializeV1 } from "../src/serialize-v1";
import { serializeV2 } from "../src/serialize-v2";

describe("benchmarks", () => {
  // describe.only("digest", async () => {
  //   const input = "hello world";
  //   const output = "uU0nuZNNPgilLlLX2n2r-sSE7-N6U4DukIj3rOLvzek";
  //   const implementations = {
  //     js: digestJS,
  //     "node:crypto": digestNode,
  //     subtleCrypto: subtleCrypto,
  //     subtleCryptoWithBuffer: subtleCryptoWithNodeBuffer,
  //   };
  //   for (const [name, digest] of Object.entries(implementations)) {
  //     if ((await digest(input)) !== output) {
  //       throw new Error(
  //         `digest implementation "${name}" is incorrect: ${await digest(input)}`,
  //       );
  //     }
  //     // @ts-ignore (Promise<string>)
  //     bench(name, () => {
  //       return digest(input);
  //     });
  //   }
  // });

  describe("serialize 1 object", () => {
    bench("serialize @ main", () => {
      serializeMain({ foo: "bar", bar: new Date(0), bool: false });
    });
    bench("serialize v0 @ 7529f93", () => {
      serializeV0({ foo: "bar", bar: new Date(0), bool: false });
    });
    bench("serialize v1 @ 461e7f3", () => {
      serializeV1({ foo: "bar", bar: new Date(0), bool: false });
    });
    bench("serialize v2 @ 73d01b6", () => {
      serializeV2({ foo: "bar", bar: new Date(0), bool: false });
    });
    bench("serialize v3", () => {
      serialize({ foo: "bar", bar: new Date(0), bool: false });
    });
  });

  describe("serialize array with 1000 identical small objects", () => {
    const createObjects = () => {
      const arr = [];
      for (let i = 0; i < 1000; i++) {
        arr.push({ foo: "bar", bar: new Date(0), bool: false });
      }

      return arr;
    };

    bench("serialize @ main", () => {
      serializeMain(createObjects());
    });
    bench("serialize v0 @ 7529f93", () => {
      serializeV0(createObjects());
    });
    bench("serialize v1 @ 461e7f3", () => {
      serializeV1(createObjects());
    });
    bench("serialize v2 @ 73d01b6", () => {
      serializeV2(createObjects());
    });
    bench("serialize v3", () => {
      serialize(createObjects());
    });
  });

  describe("serialize array with 1000 identical small objects (by ref)", () => {
    const createObjects = () => {
      const obj = { foo: "bar", bar: new Date(0), bool: false };
      const arr = [];
      for (let i = 0; i < 1000; i++) {
        arr.push(obj);
      }

      return arr;
    };

    bench("serialize @ main", () => {
      serializeMain(createObjects());
    });
    bench("serialize v0 @ 7529f93", () => {
      serializeV0(createObjects());
    });
    bench("serialize v1 @ 461e7f3", () => {
      serializeV1(createObjects());
    });
    bench("serialize v2 @ 73d01b6", () => {
      serializeV2(createObjects());
    });
    bench("serialize v3", () => {
      serialize(createObjects());
    });
  });

  describe("serialize array with 100 identical large circular objects", () => {
    const createObjects = () => {
      const arr = [];
      for (let i = 0; i < 100; i++) {
        const obj = {
          string: "test",
          number: 42,
          boolean: true,
          nullValue: null,
          undefinedValue: undefined,
          date: new Date(0),
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

        const obj2 = { ...obj };

        obj2.circular = obj;
        obj2.map.set("obj", obj);

        obj.circular = obj2;
        obj.map.set("obj", obj);
        obj.map.set("obj2", obj2);

        arr.push(obj);
      }

      return arr;
    };

    bench("serialize @ main", () => {
      serializeMain(createObjects());
    });
    bench("serialize v0 @ 7529f93", () => {
      serializeV0(createObjects());
    });
    bench("serialize v1 @ 461e7f3", () => {
      serializeV1(createObjects());
    });
    bench("serialize v2 @ 73d01b6", () => {
      serializeV2(createObjects());
    });
    bench("serialize v3", () => {
      serialize(createObjects());
    });
  });

  describe("serialize array with 100 identical large objects (by ref)", () => {
    const createObjects = () => {
      const obj = {
        string: "test",
        number: 42,
        boolean: true,
        nullValue: null,
        undefinedValue: undefined,
        date: new Date(0),
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
      };

      const arr = [];
      for (let i = 0; i < 100; i++) {
        arr.push(obj);
      }

      return arr;
    };

    bench("serialize @ main", () => {
      serializeMain(createObjects());
    });
    bench("serialize v0 @ 7529f93", () => {
      serializeV0(createObjects());
    });
    bench("serialize v1 @ 461e7f3", () => {
      serializeV1(createObjects());
    });
    bench("serialize v2 @ 73d01b6", () => {
      serializeV2(createObjects());
    });
    bench("serialize v3", () => {
      serialize(createObjects());
    });
  });

  describe("serialize array with 100 identical large objects", () => {
    const createObjects = () => {
      const arr = [];
      for (let i = 0; i < 100; i++) {
        const obj = {
          string: "test",
          number: 42,
          boolean: true,
          nullValue: null,
          undefinedValue: undefined,
          date: new Date(0),
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
        };

        arr.push(obj);
      }

      return arr;
    };

    bench("serialize @ main", () => {
      serializeMain(createObjects());
    });
    bench("serialize v0 @ 7529f93", () => {
      serializeV0(createObjects());
    });
    bench("serialize v1 @ 461e7f3", () => {
      serializeV1(createObjects());
    });
    bench("serialize v2 @ 73d01b6", () => {
      serializeV2(createObjects());
    });
    bench("serialize v3", () => {
      serialize(createObjects());
    });
  });

  describe("serialize array with 100 identical large circular objects (by ref)", () => {
    const createObjects = () => {
      const obj = {
        string: "test",
        number: 42,
        boolean: true,
        nullValue: null,
        undefinedValue: undefined,
        date: new Date(0),
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

      const obj2 = { ...obj };

      obj2.circular = obj;
      obj2.map.set("obj", obj);

      obj.circular = obj2;
      obj.map.set("obj", obj);
      obj.map.set("obj2", obj2);

      const arr = [];
      for (let i = 0; i < 100; i++) {
        arr.push(obj);
      }

      return arr;
    };

    bench("serialize @ main", () => {
      serializeMain(createObjects());
    });
    bench("serialize v0 @ 7529f93", () => {
      serializeV0(createObjects());
    });
    bench("serialize v1 @ 461e7f3", () => {
      serializeV1(createObjects());
    });
    bench("serialize v2 @ 73d01b6", () => {
      serializeV2(createObjects());
    });
    bench("serialize v3", () => {
      serialize(createObjects());
    });
  });
});

const encoder = new TextEncoder();

function subtleCrypto(input: string) {
  return crypto.subtle.digest("SHA-256", encoder.encode(input)).then((hash) => {
    return btoa(String.fromCharCode(...new Uint8Array(hash)))
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  });
}

function subtleCryptoWithNodeBuffer(input: string) {
  return crypto.subtle
    .digest("SHA-256", encoder.encode(input))
    .then((hash) => Buffer.from(hash).toString("base64url"));
}
