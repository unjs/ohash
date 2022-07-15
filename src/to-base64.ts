const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

export function encodeBase64 (data: Uint8Array, pad = true): string {
  const len = data.length
  const extraBytes = len % 3
  const parts = []

  const len2 = len - extraBytes
  for (let i = 0; i < len2; i += 3) {
    const tmp = ((data[i] << 16) & 0xFF0000) +
      ((data[i + 1] << 8) & 0xFF00) +
      (data[i + 2] & 0xFF)

    const triplet = base64Chars.charAt((tmp >> 18) & 0x3F) +
      base64Chars.charAt((tmp >> 12) & 0x3F) +
      base64Chars.charAt((tmp >> 6) & 0x3F) +
      base64Chars.charAt(tmp & 0x3F)

    parts.push(triplet)
  }

  if (extraBytes === 1) {
    const tmp = data[len - 1]
    const a = base64Chars.charAt(tmp >> 2)
    const b = base64Chars.charAt((tmp << 4) & 0x3F)

    parts.push(`${a}${b}`)
    if (pad) {
      parts.push('==')
    }
  } else if (extraBytes === 2) {
    const tmp = (data[len - 2] << 8) + data[len - 1]
    const a = base64Chars.charAt(tmp >> 10)
    const b = base64Chars.charAt((tmp >> 4) & 0x3F)
    const c = base64Chars.charAt((tmp << 2) & 0x3F)
    parts.push(`${a}${b}${c}`)
    if (pad) {
      parts.push('=')
    }
  }

  return parts.join('')
}

/**
 * Convert ArrayBuffer to base64 string
 * @see https://github.com/Daninet/hash-wasm/blob/bd3a205ca5603fc80adf71d0966fc72e8d4fa0ef/lib/util.ts#L103
 * @param {ArrayBuffer} arrayBuffer
 * @return {string} Base64
 */
export function toBase64 (arrayBuffer: ArrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer)

  return encodeBase64(bytes)
}
