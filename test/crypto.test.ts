import { describe, expect, it } from "vitest";

import * as cryptoJS from "../src/crypto/js";
import * as cryptoNode from "../src/crypto/node";

// import * as cryptoDistJS from "../dist/crypto/js/index.mjs";

const impls = {
  js: cryptoJS,
  node: cryptoNode,
  // distJs: cryptoDistJS,
};

describe("crypto:digest", () => {
  for (const [name, { digest }] of Object.entries(impls)) {
    describe(name, () => {
      it("digest", () => {
        expect(digest("Hello World")).toBe(
          "pZGm1Av0IEBKARczz7exkNYsZb8LzaMrV7J32a2fFG4",
        );
        expect(digest("")).toBe("47DEQpj8HBSaTImW5JCeuQeRkm5NMpJWZG3hSuFU");
      });
    });
  }
});
