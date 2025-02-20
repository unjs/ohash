import { describe, expect, it } from "vitest";
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
        `"Set[1,2,3,]"`,
      );
      expect(serialize(new Set([2, 3, 1]))).toMatchInlineSnapshot(
        `"Set[1,2,3,]"`,
      );
      expect(serialize(new Set([{ b: 1 }, { a: 1 }]))).toMatchInlineSnapshot(
        `"Set[{a:1},{b:1},]"`,
      );
    });

    it("map", () => {
      const map = new Map();
      map.set("z", 2);
      map.set("a", "1");
      expect(serialize(map)).toMatchInlineSnapshot(`"Map{a:'1',z:2}"`);
    });
  });

  describe("array", () => {
    it("array", () => {
      expect(serialize([1, 2, "x", 3])).toMatchInlineSnapshot(`"[1,2,'x',3,]"`);
      expect(serialize([2, 3, "x", 1])).toMatchInlineSnapshot(`"[2,3,'x',1,]"`);
    });

    it("Uint8Array, Buffer and ArrayBufferLike", () => {
      expect(serialize(new Uint8Array([1, 2, 3]).buffer)).toMatchInlineSnapshot(
        `"ArrayBuffer[1,2,3]"`,
      );

      expect(serialize(new Uint8Array([1, 2, 3]))).toMatchInlineSnapshot(
        `"Uint8Array[1,2,3]"`,
      );

      expect(serialize(Buffer.from("hello"))).toMatchInlineSnapshot(
        `"Uint8Array[104,101,108,108,111]"`,
      );
    });
  });

  describe("object", () => {
    it("object", () => {
      expect(serialize({ a: 1, b: 2 })).toMatchInlineSnapshot(`"{a:1,b:2}"`);

      expect(serialize({ b: 2, a: 1 })).toMatchInlineSnapshot(`"{a:1,b:2}"`);
    });

    it("circular", () => {
      const obj: any = {};
      obj.foo = obj;
      expect(serialize(obj)).toMatchInlineSnapshot(`"{foo:#0}"`);
    });

    it("symbol key", () => {
      expect(serialize({ [Symbol("s")]: 123 })).toMatchInlineSnapshot(`"{}"`);
    });

    it("class", () => {
      class Test {
        x = 1;
      }
      expect(serialize(new Test())).toMatchInlineSnapshot(`"Test{x:1}"`);
    });

    it("with toJSON()", () => {
      class Test {
        toJSON() {
          return [1, 2, 3];
        }
      }
      expect(serialize(new Test())).toMatchInlineSnapshot(`"Test[1,2,3,]"`);
      expect(serialize({ x: new Test() })).toMatchInlineSnapshot(
        `"{x:Test[1,2,3,]}"`,
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

  describe("consistency", () => {
    const v = {
      a: { value: 1 },
      b: { value: 1 },
      c: { value: 1 },
    };

    const o: Record<string, unknown> = {
      vvv: {
        value: { value: 1 },
        values: [{ value: 1 }, { value: 1 }],
      },
      aaa: {
        value: v.a,
        values: [v.a, v.a],
      },
      aab: {
        value: v.a,
        values: [v.a, v.b],
      },
      aac: {
        value: v.a,
        values: [v.a, v.c],
      },
      aca: {
        value: v.a,
        values: [v.c, v.a],
      },
      bbb: {
        value: v.b,
        values: [v.b, v.b],
      },
      bbc: {
        value: v.b,
        values: [v.b, v.c],
      },
      cca: {
        value: v.c,
        values: [v.c, v.a],
      },
    };

    Object.keys(o).flatMap((keyA) =>
      Object.keys(o).map((keyB) =>
        it(`Expected: "${keyA}" equals Received: "${keyB}"`, () =>
          expect(serialize(o[keyB])).toBe(serialize(o[keyA]))),
      ),
    );
  });
});
