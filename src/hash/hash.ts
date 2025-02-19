import { objectHash, type HashOptions } from "./object-hash";
import { stringDigest } from "ohash/crypto";

/**
 * Hashes any JS value into a string.
 *
 * **How it works:**
 * - Input will be serialized into a string like `"object:1:string:3:foo:string:3:bar,"`
 * - Then it is hashed using [SHA-256](https://en.wikipedia.org/wiki/SHA-2) algorithm and encoded as a [base64](https://en.wikipedia.org/wiki/Base64) string
 * - `+`, `/` and `=` characters will be removed and string trimmed to `10` chars
 *
 * @param {object} object value to hash
 * @param {HashOptions} options hashing options. See {@link HashOptions}.
 * @return {string} hash value
 */
export function hash(object: any, options: HashOptions = {}): string {
  const hashed =
    typeof object === "string" ? object : objectHash(object, options);
  return stringDigest(hashed).slice(0, 10);
}
