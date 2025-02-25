import { createHash } from "node:crypto";

// Available in Node.js v21.7.0+, v20.12.0+
// https://nodejs.org/api/crypto.html#cryptohashalgorithm-data-outputencoding
const fastHash = /*@__PURE__*/ (() =>
  globalThis.process?.getBuiltinModule?.("crypto")?.hash)();

const algorithm = "sha256";
const encoding = "base64url";

/**
 * Hashes a string using the SHA-256 algorithm and encodes it in Base64URL format.
 *
 * @param {string} data - data message to hash.
 *
 * @returns {string} The hash of the data.
 */
export function digest(data: string): string {
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
