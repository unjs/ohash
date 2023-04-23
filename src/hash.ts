import { subtle } from "uncrypto";
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
  if (!subtle.digest) {
    return hash(object, options);
  }
  const hashed =
    typeof object === "string" ? object : objectHash(object, options);
  const encoded = new TextEncoder().encode(hashed);
  const digest = await subtle.digest("SHA-256", encoded);
  return _arrayBufferToBase64(digest).slice(0, 10);
}

function _arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
