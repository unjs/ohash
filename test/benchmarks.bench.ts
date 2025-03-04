import { bench, describe } from "vitest";
import { digest as digestJS } from "../src/crypto/js";
import { digest as digestNode } from "../src/crypto/node";
import {
  createBenchObjects,
  type BenchObjectPreset,
} from "./fixtures/bench-objects";
import { getVersions } from "./fixtures/utils/versions";

// Options for v1
const hashOptions = { unorderedArrays: true, unorderedSets: true };
const versions = await getVersions(["v1.1.6", "v2.0.11"]);

describe("benchmarks", () => {
  describe("digest", async () => {
    const input = "hello world";
    const output = "uU0nuZNNPgilLlLX2n2r-sSE7-N6U4DukIj3rOLvzek";
    const implementations = {
      js: digestJS,
      "node:crypto": digestNode,
      subtleCrypto: subtleCrypto,
      subtleCryptoWithBuffer: subtleCryptoWithNodeBuffer,
    };
    for (const [name, digest] of Object.entries(implementations)) {
      if ((await digest(input)) !== output) {
        throw new Error(
          `digest implementation "${name}" is incorrect: ${await digest(input)}`,
        );
      }
      // @ts-ignore (Promise<string>)
      bench(name, () => {
        return digest(input);
      });
    }
  });

  describe.only("serialize - presets", () => {
    const presets: BenchObjectPreset[] = [
      { count: 1, size: "small" },
      { count: 1, size: "small", circular: true },
      { count: 1, size: "large" },
      { count: 1, size: "large", circular: true },
      {
        count: 1024,
        size: "small",
        referenced: true,
      },
      {
        count: 1024,
        size: "small",
        circular: true,
        referenced: true,
      },
      {
        count: 512,
        size: "large",
        referenced: true,
      },
      {
        count: 512,
        size: "large",
        circular: true,
        referenced: true,
      },
      {
        count: 256,
        size: "small",
      },
      {
        count: 256,
        size: "small",
        circular: true,
      },
      {
        count: 128,
        size: "large",
      },
      {
        count: 128,
        size: "large",
        circular: true,
      },
    ];

    for (const preset of presets) {
      const title = JSON.stringify(preset)
        .replace(/[{"}]/g, "")
        .replace(/,/g, ", ");
      const objects = createBenchObjects(preset);

      describe(title, () => {
        for (const version of versions) {
          bench(version.name, () => {
            version.serialize(objects, hashOptions);
          });
        }
      });
    }
  });

  describe("serialize - custom", () => {
    describe("simple object", () => {
      const object = {
        string: "test",
        number: 42,
        boolean: true,
        nullValue: null,
        undefinedValue: undefined,
      };

      for (const version of versions) {
        bench(version.name, () => {
          version.serialize(object, hashOptions);
        });
      }
    });

    describe("circular object", () => {
      const object: any = {
        string: "test",
        number: 42,
        boolean: true,
        nullValue: null,
        undefinedValue: undefined,
      };

      object.object = object;

      for (const version of versions) {
        bench(version.name, () => {
          version.serialize(object, hashOptions);
        });
      }
    });

    describe("array of 100 simple objects", () => {
      const object = {
        string: "test",
        number: 42,
        boolean: true,
        nullValue: null,
        undefinedValue: undefined,
      };

      const array: any[] = [];

      for (let i = 0; i < 100; i++) {
        array.push({ ...object });
      }

      for (const version of versions) {
        bench(version.name, () => {
          version.serialize(array, hashOptions);
        });
      }
    });

    describe("array of 100 simple objects (by reference)", () => {
      const object = {
        string: "test",
        number: 42,
        boolean: true,
        nullValue: null,
        undefinedValue: undefined,
      };

      const array: any[] = [];

      for (let i = 0; i < 100; i++) {
        array.push(object);
      }

      for (const version of versions) {
        bench(version.name, () => {
          version.serialize(array, hashOptions);
        });
      }
    });

    describe("complex object", () => {
      const object = {
        regex: /.*/,
        url: new URL("https://example.com"),
        symbol: Symbol("test"),
        bigint: 9_007_199_254_740_991n,
        set: new Set([1, 2, 3, {}]),
        map: new Map<any, any>([["key", "value"]]),
        array: [1, 2, "x", 3],
      };

      for (let i = 0; i < 50; i++) {
        object.set.add(i);
        object.set.add(Symbol(i));
        object.set.add(`${i}`);
        object.map.set(i, `${i}`);
      }

      for (const version of versions) {
        bench(version.name, () => {
          version.serialize(object, hashOptions);
        });
      }
    });

    describe("dates", () => {
      const object: any = {
        dates: [],
      };

      for (let i = 0; i < 100; i++) {
        object.dates.push(new Date(i));
      }

      for (const version of versions) {
        bench(version.name, () => {
          version.serialize(object, hashOptions);
        });
      }
    });

    describe("typed arrays and buffer", () => {
      const buffer = new ArrayBuffer(4096);

      const object = {
        int8Array: new Int8Array(buffer),
        uint8Array: new Uint8Array([1, 2, 3]),
        uint8ClampedArray: new Uint8ClampedArray([1, 2, 3]),
        int16Array: new Int16Array(buffer),
        uint16Array: new Uint16Array([1, 2, 3]),
        int32Array: new Int32Array(buffer),
        uint32Array: new Uint32Array([1, 2, 3]),
        float32Array: new Float32Array(buffer),
        float64Array: new Float64Array([1, 2, 3]),
        bigInt64Array: new BigInt64Array(buffer),
        bigUint64Array: new BigUint64Array([1n, 2n, 3n]),
        buffer: Buffer.from("hello"),
      };

      for (const version of versions) {
        bench(version.name, () => {
          version.serialize(object, hashOptions);
        });
      }
    });

    describe("classes/functions/nested objects", () => {
      const object = {
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

      for (const version of versions) {
        bench(version.name, () => {
          version.serialize(object, hashOptions);
        });
      }
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
