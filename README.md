# ohash

<!-- automd:badges bundlephobia codecov -->

[![npm version](https://img.shields.io/npm/v/ohash)](https://npmjs.com/package/ohash)
[![npm downloads](https://img.shields.io/npm/dm/ohash)](https://npm.chart.dev/ohash)
[![bundle size](https://img.shields.io/bundlephobia/minzip/ohash)](https://bundlephobia.com/package/ohash)
[![codecov](https://img.shields.io/codecov/c/gh/unjs/ohash)](https://codecov.io/gh/unjs/ohash)

<!-- /automd -->

Fast data [hashing](https://en.wikipedia.org/wiki/Hash_function) utils.

## Usage

Install package:

<!--automd:pm-install -->

```sh
# ✨ Auto-detect
npx nypm install ohash

# npm
npm install ohash

# yarn
yarn add ohash

# pnpm
pnpm install ohash

# bun
bun install ohash

# deno
deno install ohash
```

<!--/automd -->

Import:

```js
// ESM import
import { hash, objectHash, sha256 } from "ohash";

// ..or dnamic import
const { hash, objectHash, sha256 } = await import("ohash");
```

### `hash(object, options?)`

Converts object value into a string hash using `objectHash` and then applies `sha256` with Base64 encoding (trimmed by length of 10).

**Usage:**

```js
import { hash } from "ohash";

// "dZbtA7f0lK"
console.log(hash({ foo: "bar" }));
```

### `objectHash(object, options?)`

Serializes any value into a stable and safe string for hashing.

**Usage:**

```js
import { objectHash } from "ohash";

// "object:1:string:3:foo:string:3:bar,"
console.log(objectHash({ foo: "bar" }));
```

### `isEqual(obj1, obj2, options?)`

Compare two objects using reference equality and stable object hashing.

Usage:

```js
import { isEqual } from "ohash";

// true
console.log(isEqual({ a: 1, b: 2 }, { b: 2, a: 1 }));
```

### `diff(obj1, obj2, options?)`

Compare two objects with nested hashing. Returns an array of changes.

Returned value is an array of diff entries with `$key`, `$hash`, `$value` and `$props`. When logging, a string version of changelog is displayed.

**Usage:**

```js
import { diff } from "ohash";

const createObject = () => ({
  foo: "bar",
  nested: {
    y: 123,
    bar: {
      baz: "123",
    },
  },
});

const obj1 = createObject();
const obj2 = createObject();

obj2.nested.x = 123;
delete obj2.nested.y;
obj2.nested.bar.baz = 123;

const diff = diff(obj1, obj2);

// [-] Removed nested.y
// [~] Changed nested.bar.baz from "123" to 123
// [+] Added   nested.x
console.log(diff(obj1, obj2));
```

### `sha256`

Create a [sha256](https://en.wikipedia.org/wiki/SHA-2) digest from input string.

```js
import { sha256 } from "ohash";

// "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e"
console.log(sha256("Hello World"));
```

### `sha256base64`

Create a [sha256](https://en.wikipedia.org/wiki/SHA-2) digest in Base64 encoding from input string.

```js
import { sha256base64 } from "ohash";

// "pZGm1Av0IEBKARczz7exkNYsZb8LzaMrV7J32a2fFG4"
console.log(sha256base64("Hello World"));
```

## 💻 Development

- Clone this repository
- Enable [Corepack](https://github.com/nodejs/corepack) using `corepack enable`
- Install dependencies using `pnpm install`
- Run interactive tests using `pnpm dev`

## License

Made with 💛

Published under [MIT License](./LICENSE). Based on [puleos/object-hash](https://github.com/puleos/object-hash) by [Scott Puleo](https://github.com/puleos/), and [brix/crypto-js](https://github.com/brix/crypto-js).
