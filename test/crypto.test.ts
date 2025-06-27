import { describe, expect, it } from "vitest";

import { digest as digestJS } from "../src/crypto/js";
import { digest as digestNode } from "../src/crypto/node";

import { sha256 as sha256HexJS } from "../src/crypto/js/sha256";
import { sha256 as sha256HexNode } from "../src/crypto/node/sha256";

// import { digest as distDigestJS } from "../dist/crypto/js/index.mjs";

const digestImpls = {
  js: digestJS,
  node: digestNode,
  // distJs: distDigestJS,
};

describe("crypto:digest", () => {
  for (const [name, digest] of Object.entries(digestImpls)) {
    describe(name, () => {
      it("digest", () => {
        expect(digest("Hello World")).toBe(
          "pZGm1Av0IEBKARczz7exkNYsZb8LzaMrV7J32a2fFG4",
        );
        expect(digest("")).toBe("47DEQpj8HBSa-_TImW-5JCeuQeRkm5NMpJWZG3hSuFU");
      });
    });
  }
});

const sha256HexImpls = {
  js: sha256HexJS,
  node: sha256HexNode,
};

describe("crypto:sha256 (hex)", () => {
  for (const [name, sha256Hex] of Object.entries(sha256HexImpls)) {
    describe(name, () => {
      it("sha256", () => {
        expect(sha256Hex("Hello World")).toBe(
          "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e",
        );
        expect(sha256Hex("")).toBe(
          "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        );
      });
    });
  }
});
