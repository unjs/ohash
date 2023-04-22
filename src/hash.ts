import { objectHash, HashOptions } from "./object-hash";
import { sha256base64 } from "./crypto/sha256";

/**
 * Hash any JS value into a string
 * @param {object} object value to hash
 * @param {HashOptions} options hashing options
 * @return {string} hash value
 * @api public
 */
export function hash(object: any, options: HashOptions = {}): string {
  const hashed =
    typeof object === "string" ? object : objectHash(object, options);
  return sha256base64(hashed).slice(0, 10);
}

export async function asyncHash(
  object: any,
  options: HashOptions = {}
): Promise<string> {
  if (!globalThis.crypto?.subtle?.digest) {
    return hash(object, options);
  }
  const hashed =
    typeof object === "string" ? object : objectHash(object, options);
  const encoded = new TextEncoder().encode(hashed);
  const digest = await globalThis.crypto?.subtle?.digest("SHA-256", encoded);
  const b64Digest = btoa(String.fromCharCode(...new Uint8Array(digest)));
  return b64Digest.toString().slice(0, 10);
}
