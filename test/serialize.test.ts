import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { serialize } from "../src";

describe("serialize", () => {
  describe("primitive and builtins", () => {
    it("string", () => {
      expect(serialize("hello world 😎")).toMatchInlineSnapshot(
        `"'hello world 😎'"`,
      );

      expect(serialize({ msg: "hello world 😎" })).toMatchInlineSnapshot(
        `"{msg:'hello world 😎'}"`,
      );
    });

    it("date", () => {
      expect(serialize(new Date(0))).toMatchInlineSnapshot(`"Date(0)"`);
      expect(serialize(new Date(1_741_794_951_781))).toMatchInlineSnapshot(
        `"Date(1741794951781)"`,
      );
      expect(serialize(new Date(Number.NaN))).toMatchInlineSnapshot(
        `"Date(NaN)"`,
      );
    });

    it("boolean", () => {
      expect(serialize(true)).toMatchInlineSnapshot(`"true"`);
      expect(serialize(false)).toMatchInlineSnapshot(`"false"`);
    });

    it("number", () => {
      expect(serialize(0)).toMatchInlineSnapshot(`"0"`);
      expect(serialize(100)).toMatchInlineSnapshot(`"100"`);
      expect(serialize(-100)).toMatchInlineSnapshot(`"-100"`);
      expect(serialize(Number.NaN)).toMatchInlineSnapshot(`"NaN"`);
      expect(serialize(Number.EPSILON)).toMatchInlineSnapshot(
        `"2.220446049250313e-16"`,
      );
      expect(serialize(Number.NEGATIVE_INFINITY)).toMatchInlineSnapshot(
        `"-Infinity"`,
      );
      expect(serialize(Number.POSITIVE_INFINITY)).toMatchInlineSnapshot(
        `"Infinity"`,
      );
    });

    it("null and undefined", () => {
      expect(serialize(null)).toMatchInlineSnapshot(`"null"`);
      expect(serialize(undefined)).toMatchInlineSnapshot(`"undefined"`);
    });

    it("Error", () => {
      expect(serialize(new Error("test"))).toMatchInlineSnapshot(
        `"Error(Error: test)"`,
      );
    });

    it("RegExp", () => {
      expect(serialize(/.*/)).toMatchInlineSnapshot(`"RegExp(/.*/)"`);
    });

    it("URL", () => {
      expect(serialize(new URL("https://example.com"))).toMatchInlineSnapshot(
        `"URL(https://example.com/)"`,
      );
    });

    it("Symbol", () => {
      expect(serialize(Symbol("test"))).toMatchInlineSnapshot(`"Symbol(test)"`);
      expect(serialize(Symbol.for("test"))).toMatchInlineSnapshot(
        `"Symbol(test)"`,
      );
    });

    it("BigInt", () => {
      expect(serialize(9_007_199_254_740_991n)).toMatchInlineSnapshot(
        `"9007199254740991n"`,
      );
    });

    it("Set", () => {
      expect(serialize(new Set([1, 2, 3]))).toMatchInlineSnapshot(
        `"Set[1,2,3]"`,
      );

      // Less than 10 elements
      expect(
        serialize(new Set([64, 38, 27, 81, 93, 29, 70, 45])),
      ).toMatchInlineSnapshot(`"Set[27,29,38,45,64,70,81,93]"`);

      // More than 10 elements
      expect(
        serialize(
          new Set([
            64, 38, 27, 81, 93, 29, 70, 45, 77, 5, 16, 73, 89, 55, 90, 22, 7,
            94, 60, 48, 33, 58, 23, 50, 65, 47, 11, 1, 83, 34, 85, 88, 24, 12,
            74, 79, 82, 95, 17, 51, 39, 3, 62, 46, 37, 20, 69, 18, 56, 78, 86,
            28, 44, 92, 8, 49, 15, 68, 35, 97, 59, 43, 2, 75, 41, 100, 52, 87,
            21, 99, 91, 67, 42, 32, 61, 66, 80, 40, 25, 36, 6, 96, 72, 54, 84,
            71, 10, 76, 53, 30, 57, 98, 4, 13, 31, 19, 9, 26, 63, 14,
          ]),
        ),
      ).toMatchInlineSnapshot(
        `"Set[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100]"`,
      );

      expect(serialize(new Set([{ b: 1 }, { a: 1 }]))).toMatchInlineSnapshot(
        `"Set[{a:1},{b:1}]"`,
      );

      expect(
        serialize(
          new Set([
            "a",
            "aa",
            "b",
            "bb",
            16,
            Symbol("c"),
            2n,
            undefined,
            Symbol("a"),
            { c: 2 },
            { b: 3 },
            "c",
            null,
            1n,
            Symbol("b"),
            { d: 1 },
            { a: 4 },
            64,
          ]),
        ),
      ).toMatchInlineSnapshot(
        `"Set[1n,2n,16,64,null,{a:4},{b:3},{c:2},{d:1},'a','b','c','aa','bb',Symbol(a),Symbol(b),Symbol(c),undefined]"`,
      );
    });

    it("Map", () => {
      const map = new Map();
      map.set(1, 4);
      map.set(2, 3);
      map.set("z", 2);
      map.set("a", "1");
      map.set({ x: 42 }, "3");

      expect(serialize(map)).toMatchInlineSnapshot(
        `"Map{1:4,2:3,{x:42}:'3',a:'1',z:2}"`,
      );
    });
  });

  describe("arrays", () => {
    it("Array", () => {
      expect(serialize([1, 2, "x", 3])).toMatchInlineSnapshot(`"[1,2,'x',3]"`);
      expect(serialize([2, 3, "x", 1])).toMatchInlineSnapshot(`"[2,3,'x',1]"`);
    });

    it("Int8Array", () => {
      expect(serialize(new Int8Array([1, 2, 3]))).toMatchInlineSnapshot(
        `"Int8Array[1,2,3]"`,
      );
    });

    it("Uint8Array", () => {
      expect(serialize(new Uint8Array([1, 2, 3]))).toMatchInlineSnapshot(
        `"Uint8Array[1,2,3]"`,
      );
    });

    it("Uint8ClampedArray", () => {
      expect(serialize(new Uint8ClampedArray([1, 2, 3]))).toMatchInlineSnapshot(
        `"Uint8ClampedArray[1,2,3]"`,
      );
    });

    it("Int16Array", () => {
      expect(serialize(new Int16Array([1, 2, 3]))).toMatchInlineSnapshot(
        `"Int16Array[1,2,3]"`,
      );
    });

    it("Uint16Array", () => {
      expect(serialize(new Uint16Array([1, 2, 3]))).toMatchInlineSnapshot(
        `"Uint16Array[1,2,3]"`,
      );
    });

    it("Int32Array", () => {
      expect(serialize(new Int32Array([1, 2, 3]))).toMatchInlineSnapshot(
        `"Int32Array[1,2,3]"`,
      );
    });

    it("Uint32Array", () => {
      expect(serialize(new Uint32Array([1, 2, 3]))).toMatchInlineSnapshot(
        `"Uint32Array[1,2,3]"`,
      );
    });

    it("Float32Array", () => {
      expect(serialize(new Float32Array([1, 2, 3]))).toMatchInlineSnapshot(
        `"Float32Array[1,2,3]"`,
      );
    });

    it("Float64Array", () => {
      expect(serialize(new Float64Array([1, 2, 3]))).toMatchInlineSnapshot(
        `"Float64Array[1,2,3]"`,
      );
    });

    it("BigInt64Array", () => {
      expect(serialize(new BigInt64Array([1n, 2n, 3n]))).toMatchInlineSnapshot(
        `"BigInt64Array[1n,2n,3n]"`,
      );
    });

    it("BigUint64Array", () => {
      expect(serialize(new BigUint64Array([1n, 2n, 3n]))).toMatchInlineSnapshot(
        `"BigUint64Array[1n,2n,3n]"`,
      );
    });

    it("Empty BigInt64Array", () => {
      expect(serialize(new BigInt64Array([]))).toMatchInlineSnapshot(
        `"BigInt64Array[]"`,
      );
    });

    it("Empty BigUint64Array", () => {
      expect(serialize(new BigUint64Array([]))).toMatchInlineSnapshot(
        `"BigUint64Array[]"`,
      );
    });

    it("ArrayBufferLike", () => {
      expect(serialize(new Uint8Array([1, 2, 3]).buffer)).toMatchInlineSnapshot(
        `"ArrayBuffer[1,2,3]"`,
      );
    });

    it.runIf(typeof Buffer !== "undefined")("Buffer", () => {
      expect(serialize(Buffer.from("hello"))).toMatchInlineSnapshot(
        `"Uint8Array[104,101,108,108,111]"`,
      );
    });
  });

  describe("object", () => {
    it("object", () => {
      expect(serialize({ a: 1, b: 2 })).toMatchInlineSnapshot(`"{a:1,b:2}"`);
      expect(serialize({ b: 2, a: 1 })).toMatchInlineSnapshot(`"{a:1,b:2}"`);
      expect(serialize({ b: 1, aaa: 3, cc: 2 })).toMatchInlineSnapshot(
        `"{b:1,cc:2,aaa:3}"`,
      );
      expect(serialize(Object.create(null))).toBe("{}");
    });

    it("symbol key", () => {
      expect(serialize({ [Symbol("s")]: 123 })).toMatchInlineSnapshot(`"{}"`);
    });

    it("class", () => {
      class Test {
        x = 1;
      }
      expect(serialize(new Test())).toMatchInlineSnapshot(`"Test{x:1}"`);

      // "CustomEvent" key exists in `globalThis`
      // See: https://github.com/unjs/ohash/issues/137
      class CustomEvent {
        y = 1;
      }
      expect(serialize(new CustomEvent())).toMatchInlineSnapshot(
        `"CustomEvent{y:1}"`,
      );
    });

    it("with toJSON()", () => {
      class TestArray {
        toJSON() {
          return [1, 2, 3];
        }
      }
      expect(serialize(new TestArray())).toMatchInlineSnapshot(
        `"TestArray[1,2,3]"`,
      );
      expect(serialize({ x: new TestArray() })).toMatchInlineSnapshot(
        `"{x:TestArray[1,2,3]}"`,
      );

      class TestObject {
        toJSON() {
          return { a: 1, b: 2 };
        }
      }
      expect(serialize(new TestObject())).toMatchInlineSnapshot(
        `"TestObject{a:1,b:2}"`,
      );

      class TestNull {
        toJSON() {
          return null;
        }
      }
      expect(serialize(new TestNull())).toMatchInlineSnapshot(
        `"TestNull(null)"`,
      );

      class TestString {
        toJSON() {
          return "value";
        }
      }
      expect(serialize(new TestString())).toMatchInlineSnapshot(
        `"TestString('value')"`,
      );
    });

    it("with entries()", () => {
      const form = new FormData();
      form.set("foo", "bar");
      form.set("bar", "baz");
      expect(serialize(form)).toMatchInlineSnapshot(
        `"FormData{bar:'baz',foo:'bar'}"`,
      );

      const params = new URLSearchParams();
      params.set("foo", "bar");
      params.set("bar", "baz");
      expect(serialize(params)).toMatchInlineSnapshot(
        `"URLSearchParams{bar:'baz',foo:'bar'}"`,
      );
    });
  });

  describe("function", () => {
    it("native", () => {
      expect(serialize(Array)).toMatchInlineSnapshot(`"Array()[native]"`);
    });

    it("function", () => {
      function sum(a: number, b: number) {
        return a + b;
      }
      expect(serialize(sum)).toMatchInlineSnapshot(
        `"sum(2)function sum(a, b) {return a + b;}"`,
      );
    });

    it("arrow function", () => {
      const sum = (a: number, b: number) => a + b;
      expect(serialize(sum)).toMatchInlineSnapshot(`"sum(2)(a, b) => a + b"`);
    });
  });

  describe("not supported", () => {
    it("Blob", () => {
      expect(() =>
        serialize(new Blob(["x"])),
      ).toThrowErrorMatchingInlineSnapshot(`[Error: Cannot serialize Blob]`);
    });

    it("WeakMap", () => {
      expect(() => serialize(new WeakMap())).toThrowErrorMatchingInlineSnapshot(
        `[Error: Cannot serialize WeakMap]`,
      );
    });

    it("WeakSet", () => {
      expect(() => serialize(new WeakSet())).toThrowErrorMatchingInlineSnapshot(
        `[Error: Cannot serialize WeakSet]`,
      );
    });

    it.runIf(typeof WeakRef !== "undefined")("WeakRef", () => {
      expect(() =>
        serialize(new WeakRef({})),
      ).toThrowErrorMatchingInlineSnapshot(`[Error: Cannot serialize WeakRef]`);
    });

    const generator = function* () {
      yield 1;
    };

    it("Generator", () => {
      expect(() => serialize(generator())).toThrowErrorMatchingInlineSnapshot(
        `[Error: Cannot serialize Generator]`,
      );
    });

    const asyncGenerator = async function* () {
      yield 1;
    };

    it("AsyncGenerator", () => {
      expect(() =>
        serialize(asyncGenerator()),
      ).toThrowErrorMatchingInlineSnapshot(
        `[Error: Cannot serialize AsyncGenerator]`,
      );
    });

    it("Promise", () => {
      expect(() =>
        serialize(new Promise(() => {})),
      ).toThrowErrorMatchingInlineSnapshot(`[Error: Cannot serialize Promise]`);
    });
  });

  describe("unknown object type", () => {
    let originalToString: any;

    beforeEach(() => {
      originalToString = Object.prototype.toString;
      Object.prototype.toString = function () {
        return "TEST";
      };
    });

    afterEach(() => {
      Object.prototype.toString = originalToString;
    });

    it("throws error", () => {
      expect(() => serialize({})).toThrowErrorMatchingInlineSnapshot(
        `[Error: Cannot serialize unknown:TEST]`,
      );
    });
  });

  describe("circular references", () => {
    it("handles simple circular reference", () => {
      const obj: any = {};
      obj.foo = obj;
      expect(serialize(obj)).toMatchInlineSnapshot(`"{foo:#0}"`);
    });

    it("handles circular references in nested objects", () => {
      const obj: any = { a: { b: {} } };
      obj.a.b = obj;
      expect(serialize(obj)).toMatchInlineSnapshot(`"{a:{b:#0}}"`);
    });

    it("handles circular references in arrays", () => {
      const arr: any[] = [];
      arr.push(arr);
      expect(serialize(arr)).toMatchInlineSnapshot(`"[#0]"`);
    });

    it("handles deep circular references", () => {
      const obj: any = { a: { b: { c: {} } } };
      obj.a.b.c = obj.a;
      expect(serialize(obj)).toMatchInlineSnapshot(`"{a:{b:{c:#1}}}"`);
    });

    it("handles mixed object and array references", () => {
      const obj: any = { a: [] };
      obj.a.push(obj);
      expect(serialize(obj)).toMatchInlineSnapshot(`"{a:[#0]}"`);
    });

    it("handles self-referencing objects with multiple keys", () => {
      const obj: any = { a: {}, b: {} };
      obj.a.ref = obj;
      obj.b.ref = obj;
      expect(serialize(obj)).toMatchInlineSnapshot(`"{a:{ref:#0},b:{ref:#0}}"`);
    });

    it("handles circular references with symbols as keys", () => {
      const sym = Symbol("key");
      const obj: any = {};
      obj[sym] = obj;
      expect(serialize(obj)).toMatchInlineSnapshot(`"{}"`);
    });

    it("handles circular references within Map objects", () => {
      const map = new Map();
      map.set("key", map);
      expect(serialize(map)).toMatchInlineSnapshot(`"Map{key:#0}"`);
    });

    it("handles circular references within keys of Map objects", () => {
      const map = new Map();
      map.set(map, "value");
      expect(serialize(map)).toMatchInlineSnapshot(`"Map{#0:'value'}"`);
    });

    it("handles circular references within Set objects", () => {
      const set = new Set();
      set.add(set);
      expect(serialize(set)).toMatchInlineSnapshot(`"Set[#0]"`);

      const obj = {
        a: {},
        b: new Set(),
      };

      obj.a = obj.b;
      obj.b.add(1);
      obj.b.add(obj.a);

      expect(serialize(obj)).toMatchInlineSnapshot(
        `"{a:Set[1,#1],b:Set[1,#1]}"`,
      );
    });

    it("handles multiple circular references within the same object", () => {
      const obj: any = { a: { name: "A" }, b: { name: "B" } };
      obj.a.ref = obj.b;
      obj.b.ref = obj.a;
      expect(serialize(obj)).toMatchInlineSnapshot(
        `"{a:{ref:{ref:#1,name:'B'},name:'A'},b:{ref:#1,name:'B'}}"`,
      );
    });

    it("handles deep recursion with multiple levels of references", () => {
      const obj: any = { x: { y: { z: {} } } };
      obj.x.y.z.ref1 = obj.x;
      obj.x.y.z.ref2 = obj;
      expect(serialize(obj)).toMatchInlineSnapshot(
        `"{x:{y:{z:{ref1:#1,ref2:#0}}}}"`,
      );
    });
  });

  describe("output", () => {
    it("provides stable output", () => {
      const simple = {
        a: { _: 1, b: { _: 2, c: { _: 3 } } },
        b: { _: 1, b: { _: 2, c: { _: 3 } } },
      };

      expect(serialize(simple)).toMatchInlineSnapshot(
        `"{a:{_:1,b:{_:2,c:{_:3}}},b:{_:1,b:{_:2,c:{_:3}}}}"`,
      );

      const a = { _: 1, b: { _: 2, c: { _: 3 } } };
      const refs = { a: a, b: a };

      expect(serialize(refs)).toMatchInlineSnapshot(`"${serialize(simple)}"`);
    });
  });
});

// https://github.com/cloudflare/workerd/issues/3641
describe("Object.prototype.toString issues", () => {
  let originalToString: any;

  beforeEach(() => {
    originalToString = Object.prototype.toString;
    Object.prototype.toString = function () {
      return "[object Object]";
    };
  });

  afterEach(() => {
    Object.prototype.toString = originalToString;
  });

  it("URL", () => {
    expect(serialize(new URL("https://example.com"))).toMatchInlineSnapshot(
      `"URL(https://example.com/)"`,
    );
  });

  it("Blob", () => {
    expect(() => serialize(new Blob(["x"]))).toThrowErrorMatchingInlineSnapshot(
      `[Error: Cannot serialize Blob]`,
    );
  });

  it("FormData", () => {
    const form = new FormData();
    form.set("foo", "bar");
    form.set("bar", "baz");
    expect(serialize(form)).toMatchInlineSnapshot(
      `"FormData{bar:'baz',foo:'bar'}"`,
    );
  });

  it("URLSearchParams", () => {
    const form = new URLSearchParams();
    form.set("foo", "bar");
    form.set("bar", "baz");
    expect(serialize(form)).toMatchInlineSnapshot(
      `"URLSearchParams{bar:'baz',foo:'bar'}"`,
    );
  });
});
