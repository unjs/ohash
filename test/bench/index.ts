import { bench, group, run, summary } from "mitata";
import { serialize } from "../../src/serialize";
import { benchConfig } from "./config";
import {
  createBenchObjects,
  getPresetTitle,
  type BenchObjectPreset,
} from "./utils/objects";
import { suite } from "./utils/suites";
import { getVersions } from "./utils/versions";

const versions = await getVersions(benchConfig.versions);

versions.push({
  name: "ohash @ dev",
  serialize,
  baseline: true,
});

suite("presets", () => {
  group("serialize - presets", () => {
    for (const preset of benchConfig.presets) {
      group(getPresetTitle(preset), () => {
        summary(() => {
          for (const version of versions) {
            const objects = createBenchObjects(preset);
            bench(version.name, () => {
              version.serialize(objects, benchConfig.hashOptions);
            }).baseline(version.baseline);
          }
        });
      });
    }
  });
});

suite("combined", () => {
  group("serialize - combined presets", () => {
    summary(() => {
      for (const version of versions) {
        const objects = new Map<BenchObjectPreset, any>();

        for (const preset of benchConfig.presets) {
          objects.set(preset, createBenchObjects(preset));
        }

        bench(version.name, () => {
          for (const preset of benchConfig.presets) {
            version.serialize(objects.get(preset), benchConfig.hashOptions);
          }
        }).baseline(version.baseline);
      }
    });
  });
});

suite("custom", () => {
  group("serialize - custom", () => {
    group("simple object", () => {
      const object = {
        string: "test",
        number: 42,
        boolean: true,
        nullValue: null,
        undefinedValue: undefined,
      };

      summary(() => {
        for (const version of versions) {
          bench(version.name, () => {
            version.serialize(object, benchConfig.hashOptions);
          }).baseline(version.baseline);
        }
      });
    });

    group("circular object", () => {
      const object: any = {
        string: "test",
        number: 42,
        boolean: true,
        nullValue: null,
        undefinedValue: undefined,
      };

      object.object = object;

      summary(() => {
        for (const version of versions) {
          bench(version.name, () => {
            version.serialize(object, benchConfig.hashOptions);
          }).baseline(version.baseline);
        }
      });
    });

    group("array of 100 simple objects", () => {
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

      summary(() => {
        for (const version of versions) {
          bench(version.name, () => {
            version.serialize(array, benchConfig.hashOptions);
          }).baseline(version.baseline);
        }
      });
    });

    group("array of 100 simple objects (by reference)", () => {
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

      summary(() => {
        for (const version of versions) {
          bench(version.name, () => {
            version.serialize(array, benchConfig.hashOptions);
          }).baseline(version.baseline);
        }
      });
    });

    group("complex object", () => {
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

      summary(() => {
        for (const version of versions) {
          bench(version.name, () => {
            version.serialize(object, benchConfig.hashOptions);
          }).baseline(version.baseline);
        }
      });
    });

    group("dates", () => {
      const object: any = {
        dates: [],
      };

      for (let i = 0; i < 100; i++) {
        object.dates.push(new Date(i));
      }

      summary(() => {
        for (const version of versions) {
          bench(version.name, () => {
            version.serialize(object, benchConfig.hashOptions);
          }).baseline(version.baseline);
        }
      });
    });

    group("typed arrays and buffer", () => {
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

      summary(() => {
        for (const version of versions) {
          bench(version.name, () => {
            version.serialize(object, benchConfig.hashOptions);
          }).baseline(version.baseline);
        }
      });
    });

    group("classes/functions/nested objects", () => {
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

      summary(() => {
        for (const version of versions) {
          bench(version.name, () => {
            version.serialize(object, benchConfig.hashOptions);
          }).baseline(version.baseline);
        }
      });
    });
  });
});

await run();

console.log(`
Tips:
 - Run with --presets to run all the presets individually (default)
 - Run with --combined to run all the presets combined
 - Run with --custom to run the custom benchmarks
 - Run with --full to run all benchmarks
  `);
