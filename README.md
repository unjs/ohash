# ohash

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Github Actions][github-actions-src]][github-actions-href]
[![Codecov][codecov-src]][codecov-href]
[![bundle size][bundle-src]][bundle-href]

> Super fast hashing library written in Vanilla JS

## Usage

Install package:

```sh
# npm
npm install ohash

# yarn
yarn add ohash

# pnpm
pnpm install ohash
```

Import:

```js
// ESM
import { hash, objectHash, murmurHash, sha256 } from 'ohash'

// CommonJS
const { hash, objectHash, murmurHash, sha256 } = require('ohash')
```

### `hash(object, options?)`

Converts object value into a string hash using `objectHash` and then applies `sha256` with Base64 encoding (trimmed by length of 10).

Usage:

```js
import { hash } from 'ohash'

// "dZbtA7f0lK"
console.log(hash({ foo: 'bar' }))
```

### `objectHash(object, options?)`

Converts a nest object value into a stable and safe string for hashing.

Usage:

```js
import { objectHash } from 'ohash'

// "object:1:string:3:foo:string:3:bar,"
console.log(objectHash({ foo: 'bar'}))
```

### `murmurHash(str)`

Converts input string (of any length) into a 32-bit positive integer using [MurmurHash3]((https://en.wikipedia.org/wiki/MurmurHash)).

Usage:

```js
import { murmurHash } from 'ohash'

// "2708020327"
console.log(murmurHash('Hello World'))
```

### `sha256`

Create a secure [SHA 256](https://en.wikipedia.org/wiki/SHA-2) digest from input string.

```js
import { sha256 } from 'ohash'

// "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e"
console.log(sha256('Hello World'))
```

### `sha256base64`

Create a secure [SHA 256](https://en.wikipedia.org/wiki/SHA-2) digest in Base64 encoding from input string.

```js
import { sha256base64 } from 'ohash'

// "pZGm1Av0IEBKARczz7exkNYsZb8LzaMrV7J32a2fFG4"
console.log(sha256base64('Hello World'))
```

## 💻 Development

- Clone this repository
- Enable [Corepack](https://github.com/nodejs/corepack) using `corepack enable` (use `npm i -g corepack` for Node.js < 16.10)
- Install dependencies using `pnpm install`
- Run interactive tests using `pnpm dev`

## License

Made with 💛

Published under [MIT License](./LICENSE).

Based on [puleos/object-hash](https://github.com/puleos/object-hash) by [Scott Puleo](https://github.com/puleos/), and implementations from [perezd/node-murmurhash](perezd/node-murmurhash) and
[garycourt/murmurhash-js](https://github.com/garycourt/murmurhash-js) by [Gary Court](mailto:gary.court@gmail.com) and [Austin Appleby](mailto:aappleby@gmail.com) and [brix/crypto-js](https://github.com/brix/crypto-js).

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/ohash?style=flat-square
[npm-version-href]: https://npmjs.com/package/ohash

[npm-downloads-src]: https://img.shields.io/npm/dm/ohash?style=flat-square
[npm-downloads-href]: https://npmjs.com/package/ohash

[github-actions-src]: https://img.shields.io/github/workflow/status/unjs/ohash/ci/main?style=flat-square
[github-actions-href]: https://github.com/unjs/ohash/actions?query=workflow%3Aci

[codecov-src]: https://img.shields.io/codecov/c/gh/unjs/ohash/main?style=flat-square
[codecov-href]: https://codecov.io/gh/unjs/ohash

[bundle-src]: https://flat.badgen.net/bundlephobia/minzip/ohash
[bundle-href]: https://bundlephobia.com/package/ohash
