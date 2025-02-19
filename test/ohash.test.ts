import { describe, expect, it } from "vitest";
import { serialize, hash } from "../src";

describe("hash", () => {
  it("hash", () => {
    expect(hash({ foo: "bar" })).toMatchInlineSnapshot('"dZbtA7f0lK"');
  });
});

describe("serialize", () => {
  it("basic object", () => {
    expect(
      serialize({ foo: "bar", bar: new Date(0), bool: false }),
    ).toMatchInlineSnapshot(
      '"object:3:string:3:bar:string:24:1970-01-01T00:00:00.000Z,string:4:bool:bool:false,string:3:foo:string:3:bar,"',
    );
  });

  it("Serialize object with entries()", () => {
    const form = new FormData();
    form.set("foo", "bar");
    form.set("bar", "baz");

    expect(serialize(form)).toMatchInlineSnapshot(
      '"formdata:array:2:array:2:string:32:array:2:string:3:barstring:3:bazstring:32:array:2:string:3:foostring:3:bar"',
    );
  });

  it("Serialize object with toJSON()", () => {
    class Test {
      toJSON() {
        return { foo: "bar", bar: "baz" };
      }
    }

    expect(serialize(new Test())).toMatchInlineSnapshot(
      '"object:2:string:3:bar:string:3:baz,string:3:foo:string:3:bar,"',
    );
  });
});
