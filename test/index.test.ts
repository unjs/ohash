import { expect, it } from 'vitest'
import { murmurHash, objectHash, hash, sha256 } from '../src'

it('murmurHash', () => {
  expect(murmurHash('Hello World')).toMatchInlineSnapshot('2708020327')
})

it('sha256', () => {
  expect(sha256('Hello World')).toMatchInlineSnapshot('"a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e"')
  expect(sha256('')).toMatchInlineSnapshot('"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"')
})

it('objectHash', () => {
  expect(objectHash({ foo: 'bar' })).toMatchInlineSnapshot('"object:1:string:3:foo:string:3:bar,"')
})

it('hash', () => {
  expect(hash({ foo: 'bar' })).toMatchInlineSnapshot('"7596ed03b7"')
})
