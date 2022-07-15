import { describe, expect, it } from 'vitest'
import { useHash } from '../src'

describe('useHash()', () => {
  it('should return hash function', async () => {
    const { hash } = await useHash()

    expect(await hash('test')).toMatchInlineSnapshot('"PiAjzw=="')
  })
})
