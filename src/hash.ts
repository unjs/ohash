import { serialize } from "./serialize";
import { digest } from "ohash/crypto";

/**
 * Hashes any JS value into a string.
 *
 * The input is first serialized and then hashed and truncated to a length of `10`.
 *
 * @param input any value to serialize
 * @return {string} hash value
 */
export function hash(input: any): string {
  return digest(serialize(input)).slice(0, 10);
}
