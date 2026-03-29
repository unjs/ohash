import { SHA256, type WordArray } from "./_core";

function toHex(wordArray: WordArray): string {
  // Convert
  const hexChars: string[] = [];
  for (let i = 0; i < wordArray.sigBytes; i++) {
    const bite = (wordArray.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
    hexChars.push((bite >>> 4).toString(16), (bite & 0x0f).toString(16));
  }

  return hexChars.join("");
}

/**
 * Calculates the SHA-256 hash of the message provided.
 *
 * @param {string} message - The message to hash.
 * @returns {string} The message hash as a hexadecimal string.
 */
export function sha256(message: string): string {
  return toHex(new SHA256().finalize(message));
}
