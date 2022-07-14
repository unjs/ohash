// Based on https://github.com/brix/crypto-js 4.1.1 (MIT)

export class WordArray {
  words: number[]
  sigBytes: number

  constructor (words?, sigBytes?) {
    words = this.words = words || []

    if (sigBytes !== undefined) {
      this.sigBytes = sigBytes
    } else {
      this.sigBytes = words.length * 4
    }
  }

  toString (encoder?) {
    return (encoder || Hex).stringify(this)
  }

  concat (wordArray) {
    // Shortcuts
    const thisWords = this.words
    const thatWords = wordArray.words
    const thisSigBytes = this.sigBytes
    const thatSigBytes = wordArray.sigBytes

    // Clamp excess bits
    this.clamp()

    // Concat
    if (thisSigBytes % 4) {
      // Copy one byte at a time
      for (let i = 0; i < thatSigBytes; i++) {
        const thatByte = (thatWords[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xFF
        thisWords[(thisSigBytes + i) >>> 2] |= thatByte << (24 - ((thisSigBytes + i) % 4) * 8)
      }
    } else {
      // Copy one word at a time
      for (let j = 0; j < thatSigBytes; j += 4) {
        thisWords[(thisSigBytes + j) >>> 2] = thatWords[j >>> 2]
      }
    }
    this.sigBytes += thatSigBytes

    // Chainable
    return this
  }

  clamp () {
    // Shortcuts
    const words = this.words
    const sigBytes = this.sigBytes

    // Clamp
    words[sigBytes >>> 2] &= 0xFFFFFFFF << (32 - (sigBytes % 4) * 8)
    words.length = Math.ceil(sigBytes / 4)
  }

  clone () {
    return new WordArray(this.words.slice(0))
  }
}

export const Hex = {
  stringify (wordArray) {
    // Shortcuts
    const words = wordArray.words
    const sigBytes = wordArray.sigBytes

    // Convert
    const hexChars = []
    for (let i = 0; i < sigBytes; i++) {
      const bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xFF
      hexChars.push((bite >>> 4).toString(16))
      hexChars.push((bite & 0x0F).toString(16))
    }

    return hexChars.join('')
  },

  parse (hexStr) {
    // Shortcut
    const hexStrLength = hexStr.length

    // Convert
    const words = []
    for (let i = 0; i < hexStrLength; i += 2) {
      words[i >>> 3] |= parseInt(hexStr.substr(i, 2), 16) << (24 - (i % 8) * 4)
    }

    return new WordArray(words, hexStrLength / 2)
  }
}

export const Latin1 = {
  stringify (wordArray) {
    // Shortcuts
    const words = wordArray.words
    const sigBytes = wordArray.sigBytes

    // Convert
    const latin1Chars = []
    for (let i = 0; i < sigBytes; i++) {
      const bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xFF
      latin1Chars.push(String.fromCharCode(bite))
    }

    return latin1Chars.join('')
  },

  parse (latin1Str) {
    // Shortcut
    const latin1StrLength = latin1Str.length

    // Convert
    const words = []
    for (let i = 0; i < latin1StrLength; i++) {
      words[i >>> 2] |= (latin1Str.charCodeAt(i) & 0xFF) << (24 - (i % 4) * 8)
    }

    return new WordArray(words, latin1StrLength)
  }
}

export const Utf8 = {
  stringify (wordArray) {
    try {
      return decodeURIComponent(escape(Latin1.stringify(wordArray)))
    } catch (e) {
      throw new Error('Malformed UTF-8 data')
    }
  },

  parse (utf8Str) {
    return Latin1.parse(unescape(encodeURIComponent(utf8Str)))
  }
}

export class BufferedBlockAlgorithm {
  _data: WordArray
  _nDataBytes: number
  _minBufferSize: number = 0
  blockSize = 512 / 32

  constructor () {
    this.reset()
  }

  reset () {
    // Initial values
    this._data = new WordArray()
    this._nDataBytes = 0
  }

  _append (data) {
    // Convert string to WordArray, else assume WordArray already
    if (typeof data === 'string') {
      data = Utf8.parse(data)
    }

    // Append
    this._data.concat(data)
    this._nDataBytes += data.sigBytes
  }

  _doProcessBlock (_dataWords, _offset) {}

  _process (doFlush?: Boolean) {
    let processedWords

    // Shortcuts
    const data = this._data
    const dataWords = data.words
    const dataSigBytes = data.sigBytes
    const blockSize = this.blockSize
    const blockSizeBytes = blockSize * 4

    // Count blocks ready
    let nBlocksReady = dataSigBytes / blockSizeBytes
    if (doFlush) {
      // Round up to include partial blocks
      nBlocksReady = Math.ceil(nBlocksReady)
    } else {
      // Round down to include only full blocks,
      // less the number of blocks that must remain in the buffer
      nBlocksReady = Math.max((nBlocksReady | 0) - this._minBufferSize, 0)
    }

    // Count words ready
    const nWordsReady = nBlocksReady * blockSize

    // Count bytes ready
    const nBytesReady = Math.min(nWordsReady * 4, dataSigBytes)

    // Process blocks
    if (nWordsReady) {
      for (let offset = 0; offset < nWordsReady; offset += blockSize) {
        // Perform concrete-algorithm logic
        this._doProcessBlock(dataWords, offset)
      }

      // Remove processed words
      processedWords = dataWords.splice(0, nWordsReady)
      data.sigBytes -= nBytesReady
    }

    // Return processed words
    return new WordArray(processedWords, nBytesReady)
  }

  clone () {
    const clone = new BufferedBlockAlgorithm()
    clone._data = this._data.clone()
    return clone
  }
}

export class Hasher extends BufferedBlockAlgorithm {
  update (messageUpdate) {
    // Append
    this._append(messageUpdate)

    // Update the hash
    this._process()

    // Chainable
    return this
  }


  finalize (messageUpdate) {
    // Final message update
    if (messageUpdate) {
      this._append(messageUpdate)
    }
  }
}
