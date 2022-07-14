// Based on https://github.com/brix/crypto-js 4.1.1 (MIT)

import { WordArray, Hasher, Base64 } from './core'

// Initialization and round constants tables
const H = [1779033703, -1150833019, 1013904242, -1521486534, 1359893119, -1694144372, 528734635, 1541459225]
const K = [1116352408, 1899447441, -1245643825, -373957723, 961987163, 1508970993, -1841331548, -1424204075, -670586216, 310598401, 607225278, 1426881987, 1925078388, -2132889090, -1680079193, -1046744716, -459576895, -272742522, 264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986, -1740746414, -1473132947, -1341970488, -1084653625, -958395405, -710438585, 113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291, 1695183700, 1986661051, -2117940946, -1838011259, -1564481375, -1474664885, -1035236496, -949202525, -778901479, -694614492, -200395387, 275423344, 430227734, 506948616, 659060556, 883997877, 958139571, 1322822218, 1537002063, 1747873779, 1955562222, 2024104815, -2067236844, -1933114872, -1866530822, -1538233109, -1090935817, -965641998]

// Reusable object
const W = []

/**
 * SHA-256 hash algorithm.
 */
export class SHA256 extends Hasher {
  _hash: WordArray

  constructor () {
    super()
    this.reset()
  }

  reset () {
    super.reset()
    this._hash = new WordArray(H.slice(0))
  }

  _doProcessBlock (M, offset) {
    // Shortcut
    const H = this._hash.words

    // Working variables
    let a = H[0]
    let b = H[1]
    let c = H[2]
    let d = H[3]
    let e = H[4]
    let f = H[5]
    let g = H[6]
    let h = H[7]

    // Computation
    for (let i = 0; i < 64; i++) {
      if (i < 16) {
        W[i] = M[offset + i] | 0
      } else {
        const gamma0x = W[i - 15]
        const gamma0 = ((gamma0x << 25) | (gamma0x >>> 7)) ^
                              ((gamma0x << 14) | (gamma0x >>> 18)) ^
                                (gamma0x >>> 3)

        const gamma1x = W[i - 2]
        const gamma1 = ((gamma1x << 15) | (gamma1x >>> 17)) ^
                              ((gamma1x << 13) | (gamma1x >>> 19)) ^
                                (gamma1x >>> 10)

        W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16]
      }

      const ch = (e & f) ^ (~e & g)
      const maj = (a & b) ^ (a & c) ^ (b & c)

      const sigma0 = ((a << 30) | (a >>> 2)) ^ ((a << 19) | (a >>> 13)) ^ ((a << 10) | (a >>> 22))
      const sigma1 = ((e << 26) | (e >>> 6)) ^ ((e << 21) | (e >>> 11)) ^ ((e << 7) | (e >>> 25))

      const t1 = h + sigma1 + ch + K[i] + W[i]
      const t2 = sigma0 + maj

      h = g
      g = f
      f = e
      e = (d + t1) | 0
      d = c
      c = b
      b = a
      a = (t1 + t2) | 0
    }

    // Intermediate hash value
    H[0] = (H[0] + a) | 0
    H[1] = (H[1] + b) | 0
    H[2] = (H[2] + c) | 0
    H[3] = (H[3] + d) | 0
    H[4] = (H[4] + e) | 0
    H[5] = (H[5] + f) | 0
    H[6] = (H[6] + g) | 0
    H[7] = (H[7] + h) | 0
  }

  finalize (messageUpdate) {
    super.finalize(messageUpdate)

    const nBitsTotal = this._nDataBytes * 8
    const nBitsLeft = this._data.sigBytes * 8

    // Add padding
    this._data.words[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32)
    this._data.words[(((nBitsLeft + 64) >>> 9) << 4) + 14] = Math.floor(nBitsTotal / 0x100000000)
    this._data.words[(((nBitsLeft + 64) >>> 9) << 4) + 15] = nBitsTotal
    this._data.sigBytes = this._data.words.length * 4

    // Hash final blocks
    this._process()

    // Return final computed hash
    return this._hash
  }
}

export function sha256 (message: string) {
  return new SHA256().finalize(message).toString()
}

export function sha256base64 (message: string) {
  return new SHA256().finalize(message).toString(Base64)
}
