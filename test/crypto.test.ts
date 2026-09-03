import { createHash } from "node:crypto";
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
        expect(digest("")).toBe("47DEQpj8HBSa-_TImW-5JCeuQeRkm5NMpJWZG3hSuFU");
      });

      it.each(["\uD800", "a\uDFFFb", "\uD83D", "\uDE00\uD83D"])(
        "matches node:crypto for the lone surrogate %j",
        (input) => {
          expect(digest(input)).toBe(
            createHash("sha256").update(input, "utf8").digest("base64url"),
          );
        },
      );
    });
  }
});
