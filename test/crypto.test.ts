import { describe, expect, it } from "vitest";

import * as cryptoJS from "../src/crypto/js";
import * as cryptoNode from "../src/crypto/node";

// import * as cryptoDistJS from "../dist/crypto/js/index.mjs";

const impls = {
  js: cryptoJS,
  node: cryptoNode,
  // distJs: cryptoDistJS,
};

describe("crypto:stringDigest", () => {
  for (const [name, { stringDigest }] of Object.entries(impls)) {
    describe(name, () => {
      it("stringDigest", () => {
        expect(stringDigest("Hello World")).toBe(
          "pZGm1Av0IEBKARczz7exkNYsZb8LzaMrV7J32a2fFG4",
        );
        expect(stringDigest("")).toBe(
          "47DEQpj8HBSaTImW5JCeuQeRkm5NMpJWZG3hSuFU",
        );
      });
    });
  }
});
