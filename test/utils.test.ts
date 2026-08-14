import { describe, expect, it } from "vitest";
import { isEqual, diff } from "../src/utils";

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

  it("short-circuits reference-equal values without reading them", () => {
    let reads = 0;
    const obj = {
      get a() {
        reads++;
        return reads;
      },
    };
    expect(diff(obj, obj)).toEqual([]);
    expect(reads).toBe(0);
  });

  it("short-circuits a shared subtree but still diffs its siblings", () => {
    let reads = 0;
    const shared = {
      get deep() {
        reads++;
        return reads;
      },
    };
    expect(diff({ s: shared, a: 1 }, { s: shared, a: 2 }).map(String)).toEqual([
      "Changed `a` from `1` to `2`",
    ]);
    expect(reads).toBe(0);
  });

  it("exposes the container hash on added and removed entries", () => {
    const [added] = diff({ a: 1 }, { a: 1, b: { c: 2 } });
    expect(added.type).toBe("added");
    expect(added.newValue?.hash).toBe("{2}");

    const [removed] = diff({ a: 1, b: { c: 2 } }, { a: 1 });
    expect(removed.type).toBe("removed");
    expect(removed.newValue).toBeUndefined();
    expect(removed.oldValue?.hash).toBe("{2}");
  });

  it("treats keys colliding with Object.prototype members as ordinary keys", () => {
    expect(diff({}, { toString: 1 }).map(String)).toEqual([
      "Added   `toString`",
    ]);
    expect(diff({ toString: 1 }, {}).map(String)).toEqual([
      "Removed `toString`",
    ]);
    expect(diff({ constructor: 1 }, { constructor: 2 }).map(String)).toEqual([
      "Changed `constructor` from `1` to `2`",
    ]);
    expect(diff({ valueOf: 1 }, { valueOf: 2 }).map(String)).toEqual([
      "Changed `valueOf` from `1` to `2`",
    ]);
  });

  it("never reports `__proto__` as a diff key", () => {
    const withProto = JSON.parse('{"__proto__": 1, "x": 2}');
    expect(diff({ x: 2 }, withProto)).toEqual([]);
    expect(diff(withProto, { x: 2 })).toEqual([]);
    // A container whose only own key is `__proto__` still counts as empty.
    expect(diff(5, JSON.parse('{"__proto__": {"z": 1}}')).map(String)).toEqual([
      "Changed `` from `5` to `{}`",
    ]);
  });

  it("builds props without inheriting from Object.prototype", () => {
    const [added] = diff(
      {},
      { sub: JSON.parse('{"__proto__": {"z": 9}, "x": 1}') },
    );
    const props = added.newValue?.props as Record<string, unknown>;
    expect(Object.getPrototypeOf(props)).toBeNull();
    expect(Object.keys(props)).toEqual(["x"]);
  });

  it("reads each value in the same pass that yields its key", () => {
    const obj: any = {
      get a() {
        delete obj.b;
        return 1;
      },
      b: 2,
    };
    // `b` is deleted before `for..in` reaches it, so it must read as absent
    // rather than as a change from an empty container.
    expect(diff(obj, { a: 1, b: 2 }).map(String)).toEqual(["Added   `b`"]);
  });

  it("diffs an empty container against a leaf", () => {
    expect(diff({}, 5).map(String)).toEqual(["Changed `` from `{}` to `5`"]);
    expect(diff(5, {}).map(String)).toEqual(["Changed `` from `5` to `{}`"]);
    // A leaf against a NON-empty container yields nothing.
    expect(diff({ a: 1 }, { a: { b: 2 } })).toEqual([]);
  });
});
