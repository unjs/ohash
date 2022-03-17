import { murmurHashV2, murmurHashV3, hashRaw, hash } from '../src'

const input = 'Hello World'

console.log('v2', murmurHashV2(input))
console.log('v3', murmurHashV3(input))

const inputObj = {
  foo: {
    bar: [1, 2]
  },
  fn: (arg) => { console.log('Hello World!') }
}

console.log(hashRaw(inputObj))
console.log(hash(inputObj))
