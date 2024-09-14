import { describe, expect, it } from "vitest";
import { murmurHash, objectHash, hash, sha256, isEqual, diff } from "../src";
import { sha256base64 } from "../src/crypto/sha256";

describe("objectHash", () => {
  it("basic object", () => {
    expect(
      objectHash({ foo: "bar", bar: new Date(0), bool: false }),
    ).toMatchInlineSnapshot(
      '"object:3:string:3:bar:string:24:1970-01-01T00:00:00.000Z,string:4:bool:bool:false,string:3:foo:string:3:bar,"',
    );
  });

  it("Serialize object with entries()", () => {
    const form = new FormData();
    form.set("foo", "bar");
    form.set("bar", "baz");

    expect(objectHash(form)).toMatchInlineSnapshot(
      '"formdata:array:2:array:2:string:32:array:2:string:3:barstring:3:bazstring:32:array:2:string:3:foostring:3:bar"',
    );
  });

  it("Serialize object with toJSON()", () => {
    class Test {
      toJSON() {
        return { foo: "bar", bar: "baz" };
      }
    }

    expect(objectHash(new Test())).toMatchInlineSnapshot(
      '"object:2:string:3:bar:string:3:baz,string:3:foo:string:3:bar,"',
    );
  });
});

it("murmurHash", () => {
  expect(murmurHash("Hello World")).toMatchInlineSnapshot("427197390");
  expect(murmurHash("a")).toMatchInlineSnapshot("1009084850");
  expect(murmurHash("aa")).toMatchInlineSnapshot("923832745");
  expect(murmurHash("aaa")).toMatchInlineSnapshot("3033554871");
  expect(murmurHash("aaaa")).toMatchInlineSnapshot("2129582471");
  expect(murmurHash("aaaaa")).toMatchInlineSnapshot("3922341931");
  expect(murmurHash("aaaaaa")).toMatchInlineSnapshot("1736445713");
  expect(murmurHash("aaaaaaa")).toMatchInlineSnapshot("1497565372");
  expect(murmurHash("aaaaaaaa")).toMatchInlineSnapshot("3662943087");
  expect(murmurHash("aaaaaaaaa")).toMatchInlineSnapshot("2724714153");
});

it("sha256", () => {
  expect(sha256("Hello World")).toMatchInlineSnapshot(
    '"a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e"',
  );
  expect(sha256("")).toMatchInlineSnapshot(
    '"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"',
  );
});

it("sha256base64", () => {
  expect(sha256base64("Hello World")).toMatchInlineSnapshot(
    '"pZGm1Av0IEBKARczz7exkNYsZb8LzaMrV7J32a2fFG4"',
  );
  expect(sha256base64("")).toMatchInlineSnapshot(
    '"47DEQpj8HBSaTImW5JCeuQeRkm5NMpJWZG3hSuFU"',
  );
});

it("hash", () => {
  expect(hash({ foo: "bar" })).toMatchInlineSnapshot('"dZbtA7f0lK"');
});

describe("isEqual", () => {
  const cases = [
    [{ foo: "bar" }, { foo: "bar" }, true],
    [{ foo: "bar" }, { foo: "baz" }, false],
    [{ a: 1, b: 2 }, { b: 2, a: 1 }, true],
    [123, 123, true],
    [123, 456, false],
    [[1, 2], [2, 1], false],
  ];
  for (const [obj1, obj2, equals] of cases) {
    it(`${JSON.stringify(obj1)} ${
      equals ? "equals" : "not equals"
    } to ${JSON.stringify(obj2)}`, () => {
      expect(isEqual(obj1, obj2)).toBe(equals);
    });
  }
});

describe("diff", () => {
  // eslint-disable-next-line unicorn/consistent-function-scoping
  const createObject = () =>
    ({
      foo: "bar",
      nested: {
        // x: undefined,
        y: 123,
        bar: {
          baz: "123",
        },
      },
    }) as any;

  it("simple", () => {
    const obj1 = createObject();
    const obj2 = createObject();

    obj2.nested.x = 123;
    delete obj2.nested.y;
    obj2.nested.bar.baz = 123;

    expect(diff(obj1, obj2)).toMatchInlineSnapshot(`
      [
        "Removed \`nested.y\`",
        "Changed \`nested.bar.baz\` from \`\\"123\\"\` to \`123\`",
        "Added   \`nested.x\`",
      ]
    `);
  });
});
