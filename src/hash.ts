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

const hashMap: Record<string, string> = {}

export interface SafeHashOptions extends HashOptions {
  startingLength?: number
}

export function safeHash (object: any, { startingLength: outputLength = 3, ...options }: SafeHashOptions = {}) {
  const fullKey = hash(object, options)
  do {
    const key = fullKey.slice(0, outputLength)
    if (key in hashMap && hashMap[key] !== fullKey) {
      outputLength++
      continue
    }
    hashMap[key] = fullKey
    return key
  } while (true)
}
