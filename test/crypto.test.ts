import { describe, expect, it } from "vitest";

import * as cryptoJS from "../src/crypto/js";
import * as cryptoNode from "../src/crypto/node";

import { murmurHash } from "../src/crypto/js/murmur";

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
    });
  }
});

describe("crypto:murmurHash", () => {
  it("Generates correct hash for 0 bytes without seed", () => {
    expect(murmurHash("")).toMatchInlineSnapshot("0");
  });
  it("Generates correct hash for 0 bytes with seed", () => {
    expect(murmurHash("", 1)).toMatchInlineSnapshot("1364076727"); // 0x514E28B7
  });
  it("Generates correct hash for 'Hello World'", () => {
    expect(murmurHash("Hello World")).toMatchInlineSnapshot("427197390");
  });
  it("Generates the correct hash for varios string lengths", () => {
    expect(murmurHash("a")).toMatchInlineSnapshot("1009084850");
    expect(murmurHash("aa")).toMatchInlineSnapshot("923832745");
    expect(murmurHash("aaa")).toMatchInlineSnapshot("3033554871");
    expect(murmurHash("aaaa")).toMatchInlineSnapshot("2129582471");
    expect(murmurHash("aaaaa")).toMatchInlineSnapshot("3922341931");
    expect(murmurHash("aaaaaa")).toMatchInlineSnapshot("1736445713");
    expect(murmurHash("aaaaaaa")).toMatchInlineSnapshot("1497565372");
    expect(murmurHash("aaaaaaaa")).toMatchInlineSnapshot("3662943087");
    expect(murmurHash("aaaaaaaaa")).toMatchInlineSnapshot("2724714153");
  });
  it("Works with Uint8Arrays", () => {
    expect(
      murmurHash(new Uint8Array([0x21, 0x43, 0x65, 0x87])),
    ).toMatchInlineSnapshot("4116402539"); // 0xF55B516B
  });
  it("Handles UTF-8 high characters correctly", () => {
    expect(murmurHash("ππππππππ", 0x97_47_b2_8c)).toMatchInlineSnapshot(
      "3581961153",
    );
  });
  it("Gives correct hash with uint32 maximum value as seed", () => {
    expect(murmurHash("a", 2_147_483_647)).toMatchInlineSnapshot("3574244913");
  });
});