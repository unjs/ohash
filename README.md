
# murmurhash-es

[![bundle size](https://flat.badgen.net/bundlephobia/minzip/murmurhash-es)](https://bundlephobia.com/package/murmurhash-es)

> ESM version of murmurhash v2 and v3

## What is MurmurHash

MurmurHash is a non-cryptographic hash function created by Austin Appleby.

According to [official website](https://sites.google.com/site/murmurhash/):

- Extremely simple - compiles down to ~52 instructions on x86.

- Excellent distribution - Passes chi-squared tests for practically all keysets & bucket sizes.

- Excellent avalanche behavior - Maximum bias is under 0.5%.

- Excellent collision resistance - Passes Bob Jenkin's frog.c torture-test. No collisions possible for 4-byte keys, no small (1- to 7-bit) differentials.

- Excellent performance

## Install

```sh
# yarn
yarn add murmurhash-es

# npm
npm i murmurhash-es
```

```js
// ESM
import { murmurHashV2, murmurHashV3 } from 'murmurhash-es'

// CommonJS
const { murmurHashV2, murmurHashV3 } = require('murmurhash-es')
```

## Compatiblity

Implementation is pure Javascript and using `TextEncoder`. Check [compatibility](https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder#browser_compatibility).

## License

[MIT](./LICENSE.md)

Based on implementation from [perezd/node-murmurhash](perezd/node-murmurhash) and
[garycourt/murmurhash-js](https://github.com/garycourt/murmurhash-js)
by [Gary Court](mailto:gary.court@gmail.com) and [Austin Appleby](mailto:aappleby@gmail.com).
