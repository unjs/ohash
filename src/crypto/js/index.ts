import { SHA256 } from "./_core";

/**
 * Hashes a string using the SHA-256 algorithm and encodes it in Base64URL format.
 *
 * @param {string} message - The message to hash.
 *
 * @returns {string} The hash of the message.
 */
export function digest(message: string): string {
  return new SHA256().finalize(message).toBase64();
}
