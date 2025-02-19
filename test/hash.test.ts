import { describe, expect, it } from "vitest";
import { hash } from "../src";

describe("hash", () => {
  it("hash", () => {
    expect(hash({ foo: "bar" })).toMatchInlineSnapshot('"dZbtA7f0lK"');
  });
});
