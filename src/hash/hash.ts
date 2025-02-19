import { objectHash, type HashOptions } from "./object-hash";
import { stringDigest } from "ohash/crypto";

/**
 * Hash any JS value into a string.
 *
 * @param {object} object value to hash
 * @param {HashOptions} options hashing options. See {@link HashOptions}.
 * @return {string} hash value
 * @api public
 */
export function hash(object: any, options: HashOptions = {}): string {
  const hashed =
    typeof object === "string" ? object : objectHash(object, options);
  return stringDigest(hashed).slice(0, 10);
}
