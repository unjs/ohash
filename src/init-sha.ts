import type { HashFn } from './hash-fn.type'
import { toBase64 } from './to-base64'
import { sha256base64 } from './crypto/sha256'

export const ALGORITHM = 'SHA-256'
export const MAX_LENGTH = 10

function getWebCryptoHash (digest: SubtleCrypto['digest']): HashFn {
  const encoder = new TextEncoder()

  return message => digest(ALGORITHM, encoder.encode(message))
    .then(arrayBuffer => toBase64(arrayBuffer).slice(0, MAX_LENGTH))
}

/**
 * Init SHA2-256
 * @description Works with Web Crypto API, Node.js `crypto` module and JavaScript
 */
export async function initSha (): Promise<HashFn> {
  // Web Crypto API, global: browser, Node.js >= 17.6.0 with `--experimental-global-webcrypto` flag
  if (typeof crypto !== 'undefined' && crypto?.subtle) {
    return getWebCryptoHash(crypto.subtle.digest)
  }

  // Web Crypto API: Node.js >= 15
  try {
    const { webcrypto } = await import('crypto')
    return getWebCryptoHash(webcrypto.subtle.digest)
  } catch (_e) {
  }

  // Crypto API: Node.js
  try {
    const { createHash } = await import('crypto')
    return message => createHash(ALGORITHM).update(message).digest('base64').slice(0, MAX_LENGTH)
  } catch (_e) {
  }

  // Fallback to JavaScript
  return message => sha256base64(message).slice(0, MAX_LENGTH)
}
