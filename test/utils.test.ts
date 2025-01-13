import { describe, expect, it } from "vitest";
import { isEqual, diff } from "../src";

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
        "Changed \`nested.bar.baz\` from \`"123"\` to \`123\`",
        "Added   \`nested.x\`",
      ]
    `);
  });
});
