import { createBuffer } from './utils'

/**
 * JS Implementation of MurmurHash2
 *
 *
 * @param {Uint8Array | string} str ASCII only
 * @param {number} seed Positive integer only
 * @return {number} 32-bit positive integer hash
 */
export function murmurHashV2(str, seed = 0) {
  if (typeof str === 'string') {
    str = createBuffer(str);
  }
  let l = str.length
  let h = seed ^ l
  let i = 0
  let k
  while (l >= 4) {
    k =
      ((str[i] & 0xff)) |
      ((str[++i] & 0xff) << 8) |
      ((str[++i] & 0xff) << 16) |
      ((str[++i] & 0xff) << 24);

    k = (((k & 0xffff) * 0x5bd1e995) + ((((k >>> 16) * 0x5bd1e995) & 0xffff) << 16));
    k ^= k >>> 24;
    k = (((k & 0xffff) * 0x5bd1e995) + ((((k >>> 16) * 0x5bd1e995) & 0xffff) << 16));

    h = (((h & 0xffff) * 0x5bd1e995) + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16)) ^ k;

    l -= 4;
    ++i;
  }

  switch (l) {
    case 3: h ^= (str[i + 2] & 0xff) << 16;
    case 2: h ^= (str[i + 1] & 0xff) << 8;
    case 1: h ^= (str[i] & 0xff);
      h = (((h & 0xffff) * 0x5bd1e995) + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16));
  }

  h ^= h >>> 13;
  h = (((h & 0xffff) * 0x5bd1e995) + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16));
  h ^= h >>> 15;

  return h >>> 0;
};
