import { describe, expect, it } from "vitest";
import { hash } from "../src";

describe("hash", () => {
  it("hash", () => {
    expect(hash({ foo: "bar" })).toMatchInlineSnapshot(`"g82Nh7Lh3C"`);
  });

  it("hash", () => {
    expect(hash("object:1:string:3:foo:string:3:bar,")).toMatchInlineSnapshot(
      `"DB1F7673Yx"`,
    );
  });
});
