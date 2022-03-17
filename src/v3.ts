import { createBuffer } from './utils'

/**
 * JS Implementation of MurmurHash3 (r136) (as of May 20, 2011)
 *
 * @param {Uint8Array | string} key ASCII only
 * @param {number} seed Positive integer only
 * @return {number} 32-bit positive integer hash
 */
export function murmurHashV3 (key: Uint8Array | string, seed = 0) {
  if (typeof key === 'string') {
    key = createBuffer(key)
  }

  let i = 0
  let h1 = seed
  let k1
  let h1b

  const remainder = key.length & 3 // key.length % 4
  const bytes = key.length - remainder
  const c1 = 0xCC9E2D51
  const c2 = 0x1B873593

  while (i < bytes) {
    k1 =
      ((key[i] & 0xFF)) |
      ((key[++i] & 0xFF) << 8) |
      ((key[++i] & 0xFF) << 16) |
      ((key[++i] & 0xFF) << 24)
    ++i

    k1 = ((((k1 & 0xFFFF) * c1) + ((((k1 >>> 16) * c1) & 0xFFFF) << 16))) & 0xFFFFFFFF
    k1 = (k1 << 15) | (k1 >>> 17)
    k1 = ((((k1 & 0xFFFF) * c2) + ((((k1 >>> 16) * c2) & 0xFFFF) << 16))) & 0xFFFFFFFF

    h1 ^= k1
    h1 = (h1 << 13) | (h1 >>> 19)
    h1b = ((((h1 & 0xFFFF) * 5) + ((((h1 >>> 16) * 5) & 0xFFFF) << 16))) & 0xFFFFFFFF
    h1 = (((h1b & 0xFFFF) + 0x6B64) + ((((h1b >>> 16) + 0xE654) & 0xFFFF) << 16))
  }

  k1 = 0

  switch (remainder) {
    case 3: k1 ^= (key[i + 2] & 0xFF) << 16; break
    case 2: k1 ^= (key[i + 1] & 0xFF) << 8; break
    case 1: k1 ^= (key[i] & 0xFF)
      k1 = (((k1 & 0xFFFF) * c1) + ((((k1 >>> 16) * c1) & 0xFFFF) << 16)) & 0xFFFFFFFF
      k1 = (k1 << 15) | (k1 >>> 17)
      k1 = (((k1 & 0xFFFF) * c2) + ((((k1 >>> 16) * c2) & 0xFFFF) << 16)) & 0xFFFFFFFF
      h1 ^= k1
  }

  h1 ^= key.length

  h1 ^= h1 >>> 16
  h1 = (((h1 & 0xFFFF) * 0x85EBCA6B) + ((((h1 >>> 16) * 0x85EBCA6B) & 0xFFFF) << 16)) & 0xFFFFFFFF
  h1 ^= h1 >>> 13
  h1 = ((((h1 & 0xFFFF) * 0xC2B2AE35) + ((((h1 >>> 16) * 0xC2B2AE35) & 0xFFFF) << 16))) & 0xFFFFFFFF
  h1 ^= h1 >>> 16

  return h1 >>> 0
}
