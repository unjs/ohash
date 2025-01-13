import { objectHash, HashOptions } from "./object-hash";
import { sha256base64 } from "../crypto/sha256";

/**
 * Hash any JS value into a string
 * @param {object} object value to hash
 * @param {HashOptions} options hashing options. See {@link HashOptions}.
 * @return {string} hash value
 * @api public
 */
export function hash(object: any, options: HashOptions = {}): string {
  const hashed =
    typeof object === "string" ? object : objectHash(object, options);
  return sha256base64(hashed).slice(0, 10);
}
