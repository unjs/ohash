/**
 * MurmurHash3 (x86 32-bit) — a fast non-cryptographic hash that ohash v1
 * provided and the community used. Returns the 32-bit hash as an 8-character
 * lowercase hexadecimal string. See issue #156.
 *
 * Reference implementation: https://github.com/aappleby/smhasher (MurmurHash3,
 * public domain).
 *
 * @param data - The input string (UTF-8 encoded before hashing).
 * @param seed - The 32-bit seed. @default 0
 * @returns The hash as an 8-character hex string.
 *
 * @example
 * ```js
 * murmur("hello"); // "61315335"
 * murmur("");       // "00000000"
 * ```
 */
export function murmur(data: string, seed: number = 0): string {
  const key = new TextEncoder().encode(data);
  const remainder = key.length & 3;
  const bytes = key.length - remainder;
  let h1 = seed >>> 0;
  const c1 = 0xcc9e2d51;
  const c2 = 0x1b873593;

  let i = 0;
  while (i < bytes) {
    let k1 =
      (key[i] & 0xff) |
      ((key[i + 1] & 0xff) << 8) |
      ((key[i + 2] & 0xff) << 16) |
      ((key[i + 3] & 0xff) << 24);
    i += 4;

    k1 = Math.imul(k1, c1);
    k1 = (k1 << 15) | (k1 >>> 17);
    k1 = Math.imul(k1, c2);

    h1 ^= k1;
    h1 = (h1 << 13) | (h1 >>> 19);
    h1 = (Math.imul(h1, 5) + 0xe6546b64) >>> 0;
  }

  let k1 = 0;
  switch (remainder) {
    case 3: {
      k1 ^= (key[i + 2] & 0xff) << 16;
    }
    case 2: {
      k1 ^= (key[i + 1] & 0xff) << 8;
    }
    case 1: {
      k1 ^= key[i] & 0xff;
      k1 = Math.imul(k1, c1);
      k1 = (k1 << 15) | (k1 >>> 17);
      k1 = Math.imul(k1, c2);
      h1 ^= k1;
    }
  }

  h1 ^= key.length;
  h1 ^= h1 >>> 16;
  h1 = Math.imul(h1, 0x85ebca6b);
  h1 ^= h1 >>> 13;
  h1 = Math.imul(h1, 0xc2b2ae35);
  h1 ^= h1 >>> 16;

  return (h1 >>> 0).toString(16).padStart(8, "0");
}