import { serialize, type SerializeOptions } from "./serialize";
import { digest } from "ohash/crypto";

/**
 * Hashes any JS value into a string.
 *
 * @param {object} object value to hash
 * @param {SerializeOptions} options hashing options. See {@link SerializeOptions}.
 * @return {string} hash value
 */
export function hash(object: any, options: SerializeOptions = {}): string {
  return digest(serialize(object, options)).slice(0, 10);
}
