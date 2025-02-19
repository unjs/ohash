// Based on https://github.com/brix/crypto-js 4.1.1 (MIT)

// Initialization and round constants tables
const H = [
  1_779_033_703, -1_150_833_019, 1_013_904_242, -1_521_486_534, 1_359_893_119,
  -1_694_144_372, 528_734_635, 1_541_459_225,
];
const K = [
  1_116_352_408, 1_899_447_441, -1_245_643_825, -373_957_723, 961_987_163,
  1_508_970_993, -1_841_331_548, -1_424_204_075, -670_586_216, 310_598_401,
  607_225_278, 1_426_881_987, 1_925_078_388, -2_132_889_090, -1_680_079_193,
  -1_046_744_716, -459_576_895, -272_742_522, 264_347_078, 604_807_628,
  770_255_983, 1_249_150_122, 1_555_081_692, 1_996_064_986, -1_740_746_414,
  -1_473_132_947, -1_341_970_488, -1_084_653_625, -958_395_405, -710_438_585,
  113_926_993, 338_241_895, 666_307_205, 773_529_912, 1_294_757_372,
  1_396_182_291, 1_695_183_700, 1_986_661_051, -2_117_940_946, -1_838_011_259,
  -1_564_481_375, -1_474_664_885, -1_035_236_496, -949_202_525, -778_901_479,
  -694_614_492, -200_395_387, 275_423_344, 430_227_734, 506_948_616,
  659_060_556, 883_997_877, 958_139_571, 1_322_822_218, 1_537_002_063,
  1_747_873_779, 1_955_562_222, 2_024_104_815, -2_067_236_844, -1_933_114_872,
  -1_866_530_822, -1_538_233_109, -1_090_935_817, -965_641_998,
];

const base64KeyStr =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

// Reusable object
const W: number[] = [];

/**
 * SHA-256 hash algorithm.
 */
class SHA256 {
  _data = new WordArray();
  _hash = new WordArray([...H]);
  _nDataBytes = 0;
  _minBufferSize = 0;

  /**
   * Finishes the hash calculation and returns the hash as a WordArray.
   *
   * @param {string} messageUpdate - Additional message content to include in the hash.
   * @returns {WordArray} The finalised hash as a WordArray.
   */
  finalize(messageUpdate: string): WordArray {
    // Final message update
    if (messageUpdate) {
      this._append(messageUpdate);
    }

    const nBitsTotal = this._nDataBytes * 8;
    const nBitsLeft = this._data.sigBytes * 8;

    // Add padding
    this._data.words[nBitsLeft >>> 5] |= 0x80 << (24 - (nBitsLeft % 32));
    this._data.words[(((nBitsLeft + 64) >>> 9) << 4) + 14] = Math.floor(
      nBitsTotal / 0x1_00_00_00_00,
    );
    this._data.words[(((nBitsLeft + 64) >>> 9) << 4) + 15] = nBitsTotal;
    this._data.sigBytes = this._data.words.length * 4;

    // Hash final blocks
    this._process();

    // Return final computed hash
    return this._hash;
  }

  _doProcessBlock(M: number[], offset: number) {
    // Shortcut
    const H = this._hash.words;

    // Working variables
    let a = H[0];
    let b = H[1];
    let c = H[2];
    let d = H[3];
    let e = H[4];
    let f = H[5];
    let g = H[6];
    let h = H[7];

    // Computation
    for (let i = 0; i < 64; i++) {
      if (i < 16) {
        W[i] = M[offset + i] | 0;
      } else {
        const gamma0x = W[i - 15];
        const gamma0 =
          ((gamma0x << 25) | (gamma0x >>> 7)) ^
          ((gamma0x << 14) | (gamma0x >>> 18)) ^
          (gamma0x >>> 3);

        const gamma1x = W[i - 2];
        const gamma1 =
          ((gamma1x << 15) | (gamma1x >>> 17)) ^
          ((gamma1x << 13) | (gamma1x >>> 19)) ^
          (gamma1x >>> 10);

        W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16];
      }

      const ch = (e & f) ^ (~e & g);
      const maj = (a & b) ^ (a & c) ^ (b & c);

      const sigma0 =
        ((a << 30) | (a >>> 2)) ^
        ((a << 19) | (a >>> 13)) ^
        ((a << 10) | (a >>> 22));
      const sigma1 =
        ((e << 26) | (e >>> 6)) ^
        ((e << 21) | (e >>> 11)) ^
        ((e << 7) | (e >>> 25));

      const t1 = h + sigma1 + ch + K[i] + W[i];
      const t2 = sigma0 + maj;

      h = g;
      g = f;
      f = e;
      e = (d + t1) | 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) | 0;
    }

    // Intermediate hash value
    H[0] = (H[0] + a) | 0;
    H[1] = (H[1] + b) | 0;
    H[2] = (H[2] + c) | 0;
    H[3] = (H[3] + d) | 0;
    H[4] = (H[4] + e) | 0;
    H[5] = (H[5] + f) | 0;
    H[6] = (H[6] + g) | 0;
    H[7] = (H[7] + h) | 0;
  }

  _append(data: string | WordArray) {
    // Convert string to WordArray, else assume WordArray already
    if (typeof data === "string") {
      data = WordArray.fromUtf8(data);
    }

    // Append
    this._data.concat(data);
    this._nDataBytes += data.sigBytes;
  }

  _process(doFlush?: boolean) {
    let processedWords;

    // Count blocks ready
    let nBlocksReady = this._data.sigBytes / (16 * 4); /* bytes */
    if (doFlush) {
      // Round up to include partial blocks
      nBlocksReady = Math.ceil(nBlocksReady);
    } else {
      // Round down to include only full blocks,
      // less the number of blocks that must remain in the buffer
      nBlocksReady = Math.max((nBlocksReady | 0) - this._minBufferSize, 0);
    }

    // Count words ready
    const nWordsReady = nBlocksReady * 16;

    // Count bytes ready
    const nBytesReady = Math.min(nWordsReady * 4, this._data.sigBytes);

    // Process blocks
    if (nWordsReady) {
      for (let offset = 0; offset < nWordsReady; offset += 16) {
        // Perform concrete-algorithm logic
        this._doProcessBlock(this._data.words, offset);
      }

      // Remove processed words
      processedWords = this._data.words.splice(0, nWordsReady);
      this._data.sigBytes -= nBytesReady;
    }

    // Return processed words
    return new WordArray(processedWords, nBytesReady);
  }
}

class WordArray {
  words: number[];
  sigBytes: number;

  constructor(words?: number[], sigBytes?: number) {
    words = this.words = words || [];
    this.sigBytes = sigBytes === undefined ? words.length * 4 : sigBytes;
  }

  static fromUtf8(input: string) {
    const str = unescape(encodeURIComponent(input)); // utf8 => latin1
    const strlen = str.length;
    const words: number[] = [];
    for (let i = 0; i < strlen; i++) {
      words[i >>> 2] |= (str.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
    }
    return new WordArray(words, strlen);
  }

  toBase64(): string {
    const base64Chars: string[] = [];
    for (let i = 0; i < this.sigBytes; i += 3) {
      const byte1 = (this.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
      const byte2 =
        (this.words[(i + 1) >>> 2] >>> (24 - ((i + 1) % 4) * 8)) & 0xff;
      const byte3 =
        (this.words[(i + 2) >>> 2] >>> (24 - ((i + 2) % 4) * 8)) & 0xff;

      const triplet = (byte1 << 16) | (byte2 << 8) | byte3;
      for (let j = 0; j < 4 && i * 8 + j * 6 < this.sigBytes * 8; j++) {
        base64Chars.push(
          base64KeyStr.charAt((triplet >>> (6 * (3 - j))) & 0x3f),
        );
      }
    }
    return base64Chars.join("");
  }

  concat(wordArray: WordArray) {
    // Clamp excess bits
    this.words[this.sigBytes >>> 2] &=
      0xff_ff_ff_ff << (32 - (this.sigBytes % 4) * 8);
    this.words.length = Math.ceil(this.sigBytes / 4);

    // Concat
    if (this.sigBytes % 4) {
      // Copy one byte at a time
      for (let i = 0; i < wordArray.sigBytes; i++) {
        const thatByte =
          (wordArray.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
        this.words[(this.sigBytes + i) >>> 2] |=
          thatByte << (24 - ((this.sigBytes + i) % 4) * 8);
      }
    } else {
      // Copy one word at a time
      for (let j = 0; j < wordArray.sigBytes; j += 4) {
        this.words[(this.sigBytes + j) >>> 2] = wordArray.words[j >>> 2];
      }
    }
    this.sigBytes += wordArray.sigBytes;
  }
}

/**
 * Hashes string using SHA-256 algorithm and returns the hash as a base64 string.
 *
 * **Note:** The `+`, `/`, and `=` characters are removed from the base64 result to maximize compatibility.
 * This behavior differs from standard SHA-256 + Base64 encoding.
 */
export function digest(message: string) {
  return new SHA256().finalize(message).toBase64();
}
