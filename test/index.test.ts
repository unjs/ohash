import { expect, it } from 'vitest'
import { murmurHash, objectHash, hash } from '../src'

it('murmurHash', () => {
  expect(murmurHash('Hello World')).toMatchInlineSnapshot('2708020327')
})

it('objectHash', () => {
  expect(objectHash({ foo: 'bar' })).toMatchInlineSnapshot('"object:1:string:3:foo:string:3:bar,"')
})

it('hash', () => {
  expect(hash({ foo: 'bar' })).toMatchInlineSnapshot('"2736179692"')
})
