import { serialize, type SerializeOptions } from "./serialize";
import { digest } from "ohash/crypto";

/**
 * Hashes any JS value into a string.
 *
 * The input is first serialized into a string like `object:1:string:3:foo:string:3:bar,`. It is then hashed and truncated to a length of `10`.
 *
 * @param {object} object value to hash
 * @param {SerializeOptions} options hashing options. See {@link SerializeOptions}.
 * @return {string} hash value
 */
export function hash(object: any, options: SerializeOptions = {}): string {
  return digest(serialize(object, options)).slice(0, 10);
}
