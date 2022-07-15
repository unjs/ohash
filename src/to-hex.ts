const byteToHex = []

for (let n = 0; n <= 0xFF; ++n) {
  const hexOctet = n.toString(16).padStart(2, '0')
  byteToHex.push(hexOctet)
}

/**
 * Convert ArrayBuffer to hex string
 * @see https://stackoverflow.com/a/55200387
 * @param {ArrayBuffer} arrayBuffer
 * @return {string} Hex
 */
export function toHex (arrayBuffer: ArrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer)
  const hexOctets = new Array(bytes.length)

  for (let i = 0; i < bytes.length; ++i) {
    hexOctets[i] = byteToHex[bytes[i]]
  }

  return hexOctets.join('')
}
