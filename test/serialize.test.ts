import { describe, expect, it } from "vitest";
import { serialize } from "../src";

describe("serialize", () => {
  it("string", () => {
    expect(serialize("hello world 😎")).toMatchInlineSnapshot(
      `"string:14:hello world 😎"`,
    );
  });

  it("basic object", () => {
    expect(
      serialize({ foo: "bar", bar: new Date(0), bool: false }),
    ).toMatchInlineSnapshot(
      `"object:3:string:3:bar:date:1970-01-01T00:00:00.000Z,string:4:bool:bool:false,string:3:foo:string:3:bar,"`,
    );
  });

  it("blob", () => {
    expect(() => serialize(new Blob(["x"]))).toThrow("Cannot serialize Blob");
  });

  it("date", () => {
    const obj: any = {};
    obj.foo = obj;
    expect(serialize(new Date(0))).toMatchInlineSnapshot(
      `"date:1970-01-01T00:00:00.000Z"`,
    );
  });

  it("circular", () => {
    const obj: any = {};
    obj.foo = obj;
    expect(serialize(obj)).toMatchInlineSnapshot(
      `"object:1:string:3:foo:string:12:[CIRCULAR:0],"`,
    );
  });

  it("Buffer", () => {
    expect(serialize(Buffer.from([1, 2, 3]))).toMatchInlineSnapshot(
      `"object:2:string:4:data:array:3:number:1number:2number:3,string:4:type:string:6:Buffer,"`,
    );

    expect(serialize({ buff: Buffer.from([1, 2, 3]) })).toMatchInlineSnapshot(
      `"object:1:string:4:buff:object:2:string:4:data:array:3:number:1number:2number:3,string:4:type:string:6:Buffer,,"`,
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
