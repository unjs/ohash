import { describe, expect, it } from "vitest";

import * as cryptoJS from "../src/crypto/js";
import * as cryptoNode from "../src/crypto/node";

const impls = {
  js: cryptoJS,
  node: cryptoNode,
};

describe("crypto", () => {
  for (const [name, { sha256, sha256base64 }] of Object.entries(impls)) {
    describe(name, () => {
      it("sha256", () => {
        expect(sha256("Hello World")).toBe(
          "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e",
        );
        expect(sha256("")).toBe(
          "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        );
      });

      it("sha256base64", () => {
        expect(sha256base64("Hello World")).toBe(
          "pZGm1Av0IEBKARczz7exkNYsZb8LzaMrV7J32a2fFG4",
        );
        expect(sha256base64("")).toBe(
          "47DEQpj8HBSaTImW5JCeuQeRkm5NMpJWZG3hSuFU",
        );
      });
    });
  }
});
