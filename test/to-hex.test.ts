import { describe, expect, it } from 'vitest'
import { toHex } from '../src/to-hex'

describe('toHex()', () => {
  it('should return hex string from ArrayBuffer', () => {
    const encoder = new TextEncoder()
    const arrayBuffer = encoder.encode('test').buffer

    expect(toHex(arrayBuffer)).toMatchInlineSnapshot('"74657374"')
  })
})
