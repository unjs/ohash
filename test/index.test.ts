import { describe, expect, it } from 'vitest'
import { murmurHash, objectHash, hash, sha256, isEqual } from '../src'
import { sha256base64 } from '../src/crypto/sha256'

it('murmurHash', () => {
  expect(murmurHash('Hello World')).toMatchInlineSnapshot('2708020327')
})

it('sha256', () => {
  expect(sha256('Hello World')).toMatchInlineSnapshot('"a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e"')
  expect(sha256('')).toMatchInlineSnapshot('"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"')
})

it('sha256base64', () => {
  expect(sha256base64('Hello World')).toMatchInlineSnapshot('"pZGm1Av0IEBKARczz7exkNYsZb8LzaMrV7J32a2fFG4"')
  expect(sha256base64('')).toMatchInlineSnapshot('"47DEQpj8HBSaTImW5JCeuQeRkm5NMpJWZG3hSuFU"')
})

it('objectHash', () => {
  expect(objectHash({ foo: 'bar' })).toMatchInlineSnapshot('"object:1:string:3:foo:string:3:bar,"')
})

it('hash', () => {
  expect(hash({ foo: 'bar' })).toMatchInlineSnapshot('"dZbtA7f0lK"')
})

describe('isEqual', () => {
  const cases = [
    [{ foo: 'bar' }, { foo: 'bar' }, true],
    [{ foo: 'bar' }, { foo: 'baz' }, false],
    [{ a: 1, b: 2 }, { b: 2, a: 1 }, true],
    [123, 123, true],
    [123, 456, false],
    [[1, 2], [2, 1], false]
  ]
  for (const [obj1, obj2, equals] of cases) {
    it(`${JSON.stringify(obj1)} ${equals ? 'equals' : 'not equals'} to ${JSON.stringify(obj2)}`, () => {
      expect(isEqual(obj1, obj2)).toBe(equals)
    })
  }
})
