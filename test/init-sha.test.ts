import { describe, expect, it } from 'vitest'
import { initSha } from '../src/init-sha'

describe('initSha()', () => {
  it('should return hash function', async () => {
    expect(await initSha()).toMatchInlineSnapshot('[Function]')
  })

  it('should create hash', async () => {
    const hash = await initSha()

    expect(await hash('test')).toMatchInlineSnapshot('"9f86d08188"')
  })

  // See: https://github.com/unjs/ohash/issues/11
  it('should prevent `ufo` and `vue` collision', async () => {
    const hash = await initSha()

    expect(await hash('vue') !== await hash('ufo')).toBeTruthy()
  })
})
