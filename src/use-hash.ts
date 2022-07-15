import { initSha } from './init-sha'
import { initXxHash } from './init-xx-hash'
import { HashOptions, objectHash } from './object-hash'
import type { HashFn } from './hash-fn.type'

let hashFn: Promise<HashFn> | undefined

function initHashFn () {
  // Check for cached
  if (hashFn) {
    return hashFn
  }

  try {
    hashFn = initXxHash()
  } catch (_e) {
    hashFn = initSha()
  }
  return hashFn
}

/**
 * Use hash
 * @description
 * @example
 * const hash = await useHash();
 * const key = await hash(obj);
 */
export async function useHash () {
  const hashFn = await initHashFn()

  return {
    /**
     * Hash any JS value into a string
     * @param {object} object value to hash
     * @param {HashOptions} [options] hashing options
     * @return {string | Promise<string>} hash value
     * @api public
     */
    hash (object: unknown, options?: HashOptions) {
      const hashed = typeof object === 'string' ? object : objectHash(object, options)
      return hashFn(hashed)
    }
  }
}
