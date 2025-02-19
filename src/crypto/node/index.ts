import { createHash } from "node:crypto";

/**
 * Hashes string using SHA-256 algorithm and returns the hash as a base64 string.
 *
 * **Note:** The `+`, `/`, and `=` characters are removed from the base64 result to maximize compatibility.
 * This behavior differs from standard SHA-256 + Base64 encoding.
 */
export function digest(date: string): string {
  return createHash("sha256").update(date).digest("base64url");
}
