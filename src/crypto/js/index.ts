import { Base64 } from "./_core";
import { SHA256 } from "./sha256";

/**
 * Hashes string using SHA-256 algorithm and returns the hash as a base64 string.
 *
 * **Note:** The `+`, `/`, and `=` characters are removed from the base64 result to maximize compatibility.
 * This behavior differs from standard SHA-256 + Base64 encoding.
 */
export function digest(message: string) {
  return new SHA256().finalize(message).toString(Base64);
}
