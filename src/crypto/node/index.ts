import { createHash } from "node:crypto";

/**
 * Hashes a string using the SHA-256 algorithm and encodes it in Base64URL format.
 *
 * @param {string} message - The message to hash.
 *
 * @returns {string} The hash of the message.
 */
export function digest(date: string): string {
  return createHash("sha256").update(date).digest("base64url");
}
