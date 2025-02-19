import { describe, expect, it } from "vitest";
import { hash } from "../src";

describe("hash", () => {
  it("hash", () => {
    expect(hash({ foo: "bar" })).toMatchInlineSnapshot('"dZbtA7f0lK"');
  });

  it("hash", () => {
    expect(hash("object:1:string:3:foo:string:3:bar,")).toMatchInlineSnapshot(
      `"I6W3uN12LB"`,
    );
  });
});
