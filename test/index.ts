import { murmurHashV2, murmurHashV3 } from '../src'

const input = 'Hello World'

console.log('v2', murmurHashV2(input))
console.log('v3', murmurHashV3(input))
