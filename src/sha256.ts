import { createHash } from "node:crypto";

/**
 * Computes the SHA-256 digest of `data` and returns it as a lowercase
 * hexadecimal string. This is the hex variant of the base64url {@link digest};
 * ohash v1 exposed it and the community used it, so it is provided again here.
 * See issue #156.
 *
 * @param data - The string (or Buffer/TypedArray) to hash.
 * @returns The SHA-256 hex digest.
 *
 * @example
 * ```js
 * sha256("hello"); // "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
 * ```
 */
export function sha256(data: string | ArrayBufferView | ArrayBuffer): string {
  return createHash("sha256").update(data as Uint8Array).digest("hex");
}