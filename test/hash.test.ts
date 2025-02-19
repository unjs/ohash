import { describe, expect, it } from "vitest";
import { hash } from "../src";

describe("hash", () => {
  it("hash", () => {
    const obj = { foo: "bar" };
    expect(hash(obj)).toMatchInlineSnapshot(
      `"g82Nh7Lh3CURFX9zCBhc5xgU0K7L0V1qkoHyRsKNqA4"`,
    );
  });
});
