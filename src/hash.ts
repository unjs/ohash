import { objectHash, HashOptions } from './object-hash'
import { murmurHash } from './murmur'

/**
 * Hash any JS value into a string
 * @param {object} object value to hash
 * @param {HashOptions} options hashing options
 * @return {string} hash value
 * @api public
 */
export function hash (object: any, options: HashOptions = {}): string {
  const hashed = typeof object === 'string' ? object : objectHash(object, options)
  return String(murmurHash(hashed))
}
