import { describe, expect, it } from "vitest";
import { murmurHash, sha256, sha256base64 } from "../src";

describe("crypto", () => {
  describe("murmurHash", () => {
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
      expect(murmurHash("a", 2_147_483_647)).toMatchInlineSnapshot(
        "3574244913",
      );
    });
  });

  it("sha256", () => {
    expect(sha256("Hello World")).toMatchInlineSnapshot(
      '"a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e"',
    );
    expect(sha256("")).toMatchInlineSnapshot(
      '"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"',
    );
  });

  it("sha256base64", () => {
    expect(sha256base64("Hello World")).toMatchInlineSnapshot(
      '"pZGm1Av0IEBKARczz7exkNYsZb8LzaMrV7J32a2fFG4"',
    );
    expect(sha256base64("")).toMatchInlineSnapshot(
      '"47DEQpj8HBSaTImW5JCeuQeRkm5NMpJWZG3hSuFU"',
    );
  });
});
