import { createHash, hash } from "node:crypto";

/**
 * Hashes a string using the SHA-256 algorithm and encodes it in Base64URL format.
 *
 * @param {string} data - data message to hash.
 *
 * @returns {string} The hash of the data.
 */
export function digest(data: string): string {
  if (hash) {
    // Available in Node.js v21.7.0+, v20.12.0+
    // https://nodejs.org/api/crypto.html#cryptohashalgorithm-data-outputencoding
    return hash("sha256", data, "base64url");
  }
  return createHash("sha256").update(data).digest("base64url");
}
