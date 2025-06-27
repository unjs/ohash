import { createHash } from "node:crypto";

// Available in Node.js v21.7.0+, v20.12.0+
// https://nodejs.org/api/crypto.html#cryptohashalgorithm-data-outputencoding
const fastHash = /*@__PURE__*/ (() =>
  globalThis.process?.getBuiltinModule?.("crypto")?.hash)();

export function hashAndEncode(
  data: string,
  algorithm: "sha256",
  encoding: "base64url" | "hex",
): string {
  if (fastHash) {
    return fastHash(algorithm, data, encoding);
  }

  const h = createHash(algorithm).update(data);

  // Use digest().toString("base64url") as workaround for stackblitz
  // https://github.com/unjs/ohash/issues/115
  return globalThis.process?.versions?.webcontainer
    ? h.digest().toString(encoding)
    : h.digest(encoding);
}
