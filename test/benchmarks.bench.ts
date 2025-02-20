import { bench, describe } from "vitest";

import { digest as digestJS } from "../src/crypto/js";
import { digest as digestNode } from "../src/crypto/node";
import { serialize } from "../src";

describe("benchmarks", () => {
  describe.only("digest", async () => {
    const input = "hello world";
    const output = "uU0nuZNNPgilLlLX2n2r-sSE7-N6U4DukIj3rOLvzek"
    const implementations = {
      'js': digestJS,
      'node:crypto': digestNode,
      'subtleCrypto': subtleCrypto,
      'subtleCryptoWithBuffer': subtleCryptoWithNodeBuffer,
    }
    for (const [name, digest] of Object.entries(implementations)) {
      if (await digest(input) !== output) {
        throw new Error(`digest implementation "${name}" is incorrect: ${await digest(input)}`);
      }
      // @ts-ignore (Promise<string>)
      bench(name, () => {
        return digest(input);
      });
    }
  });

  describe("serialize", () => {
    bench("serialize", () => {
      serialize({ foo: "bar", bar: new Date(0), bool: false });
    });
  });
});

const encoder = new TextEncoder();

function subtleCrypto(input: string) {
  return crypto.subtle.digest("SHA-256", encoder.encode(input)).then((hash) => {
    return btoa(String.fromCharCode(...new Uint8Array(hash))).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  });
}

function subtleCryptoWithNodeBuffer(input: string) {
  return crypto.subtle.digest("SHA-256", encoder.encode(input)).then((hash) => Buffer.from(hash).toString("base64url"));
}
