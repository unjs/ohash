import { hashAndEncode } from "./_core";

/**
 * Hashes a string using the SHA-256 algorithm and encodes it in hexadecimal format.
 *
 * @param {string} data - data message to hash.
 *
 * @returns {string} The hash of the data.
 */
export function sha256(data: string): string {
  return hashAndEncode(data, "sha256", "hex").replace(/=+$/, "");
}
