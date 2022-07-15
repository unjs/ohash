import { describe, expect, it } from 'vitest'
import { toBase64 } from '../src/to-base64'

describe('toBase64()', () => {
  it('should return Base64 string from ArrayBuffer', () => {
    const encoder = new TextEncoder()
    const arrayBuffer = encoder.encode('test').buffer

    expect(toBase64(arrayBuffer)).toMatchInlineSnapshot('"dGVzdA=="')
  })
})
