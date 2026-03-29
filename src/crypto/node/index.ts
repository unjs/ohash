import { hashAndEncode } from "./_core";

/**
 * Hashes a string using the SHA-256 algorithm and encodes it in Base64URL format.
 *
 * @param {string} data - data message to hash.
 *
 * @returns {string} The hash of the data.
 */
export function digest(data: string): string {
  return hashAndEncode(data, "sha256", "base64url");
}
