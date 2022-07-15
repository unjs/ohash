import { describe, expect, it } from 'vitest'
import { initXxHash } from '../src/init-xx-hash'

describe('initXxHash64()', () => {
  it('should return hash function', async () => {
    expect(await initXxHash()).toMatchInlineSnapshot('[Function]')
  })

  it('should create hash', async () => {
    const hash = await initXxHash()

    expect(await hash('test')).toMatchInlineSnapshot('"3e2023cf"')
  })

  // See: https://github.com/unjs/ohash/issues/11
  it('should prevent `ufo` and `vue` collision', async () => {
    const hash = await initXxHash()

    expect(await hash('vue') !== await hash('ufo')).toBeTruthy()
  })
})
