import { objectHash, HashOptions } from "./object-hash";
import { sha256base64, sha256base64Async } from "./crypto/sha256";

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

/**
 * Hash any JS value into a string
 * @param {object} object value to hash
 * @param {HashOptions} options hashing options
 * @return {Promise<string>} hash value
 * @api public
 */
export function hashAsync(
  object: any,
  options: HashOptions = {},
): Promise<string> {
  const hashed =
    typeof object === "string" ? object : objectHash(object, options);
  return sha256base64Async(hashed).then((digest) => digest.slice(0, 10));
}
