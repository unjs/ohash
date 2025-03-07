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
      expect(serialize(new Date(0))).toMatchInlineSnapshot(
        `"Date(1970-01-01T00:00:00.000Z)"`,
      );
      expect(serialize(new Date(Number.NaN))).toMatchInlineSnapshot(
        `"Date(null)"`,
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

    it("set", () => {
      expect(serialize(new Set([1, 2, 3]))).toMatchInlineSnapshot(
        `"Set[1,2,3]"`,
      );
      expect(serialize(new Set([2, 3, 1]))).toMatchInlineSnapshot(
        `"Set[1,2,3]"`,
      );
      expect(serialize(new Set([{ b: 1 }, { a: 1 }]))).toMatchInlineSnapshot(
        `"Set[{a:1},{b:1}]"`,
      );
    });

    it("map", () => {
      const map = new Map();
      map.set(1, 4);
      map.set(2, 3);
      map.set("z", 2);
      map.set("a", "1");
      map.set({ x: 42 }, "3");

      expect(serialize(map)).toMatchInlineSnapshot(
        `"Map{1:4,2:3,a:'1',z:2,{x:42}:'3'}"`,
      );
    });
  });

  describe("array", () => {
    it("array", () => {
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
    it("blob", () => {
      expect(() =>
        serialize(new Blob(["x"])),
      ).toThrowErrorMatchingInlineSnapshot(`[Error: Cannot serialize Blob]`);
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
        `"{a:Set[#1,1],b:Set[#1,1]}"`,
      );
    });

    it("handles multiple circular references within the same object", () => {
      const obj: any = { a: { name: "A" }, b: { name: "B" } };
      obj.a.ref = obj.b;
      obj.b.ref = obj.a;
      expect(serialize(obj)).toMatchInlineSnapshot(
        `"{a:{name:'A',ref:{name:'B',ref:#1}},b:{name:'B',ref:#1}}"`,
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
});
