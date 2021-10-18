/**
 * JS Implementation of MurmurHash2
 *
 *
 * @param {Uint8Array | string} str ASCII only
 * @param {number} seed Positive integer only
 * @return {number} 32-bit positive integer hash
 */
declare function murmurHashV2(str: any, seed?: number): number;

/**
 * JS Implementation of MurmurHash3 (r136) (as of May 20, 2011)
 *
 * @param {Uint8Array | string} key ASCII only
 * @param {number} seed Positive integer only
 * @return {number} 32-bit positive integer hash
 */
declare function murmurHashV3(key: any, seed?: number): number;

export { murmurHashV2, murmurHashV3 };
