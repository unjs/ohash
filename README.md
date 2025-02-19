# ohash

<!-- automd:badges bundlephobia codecov -->

[![npm version](https://img.shields.io/npm/v/ohash)](https://npmjs.com/package/ohash)
[![npm downloads](https://img.shields.io/npm/dm/ohash)](https://npm.chart.dev/ohash)
[![bundle size](https://img.shields.io/bundlephobia/minzip/ohash)](https://bundlephobia.com/package/ohash)
[![codecov](https://img.shields.io/codecov/c/gh/unjs/ohash)](https://codecov.io/gh/unjs/ohash)

<!-- /automd -->

Fast data [hashing](https://en.wikipedia.org/wiki/Hash_function) utils.

## Usage

Install `ohash`:

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

**Import:**

```js
// ESM import
import { hash, serialize, isEqual, diff, stringDigest } from "ohash";

// ..or dnamic import
const { hash, serialize, stringDigest } = await import("ohash");
```

### `hash(object, options?)`

Hashes any JS value into a string.

**Usage:**

```js
import { hash } from "ohash";

// "dZbtA7f0lK"
console.log(hash({ foo: "bar" }));
```

**How it works:**

- Input will be serialized into a string like `object:1:string:3:foo:string:3:bar,`.
- Then it is hashed using [SHA-256](https://en.wikipedia.org/wiki/SHA-2) algorithm and encoded as a [base64](https://en.wikipedia.org/wiki/Base64) string.
- `+`, `/` and `=` characters will be removed and string trimmed to `10` chars.

### `serialize(object, options?)`

Serializes any value into a stable and safe string for hashing.

**Usage:**

```js
import { serialize } from "ohash";

// "object:1:string:3:foo:string:3:bar,"
console.log(serialize({ foo: "bar" }));
```

### `isEqual(obj1, obj2, options?)`

Compare two objects using `==` then fallbacks to compare using `serialize`.

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

### `stringDigest`

Create a [sha256](https://en.wikipedia.org/wiki/SHA-2) digest from input and returns the hash as a base64 string.

> [!IMPORTANT]
> The `+`, `/`, and `=` characters are removed from base64 result to maximize compatibility.
> This behavior differs from standard SHA-256 + Base64 encoding.

```ts
import { stringDigest } from "ohash";

// "pZGm1Av0IEBKARczz7exkNYsZb8LzaMrV7J32a2fFG4"
console.log(stringDigest("Hello World"));
```

## 💻 Development

- Clone this repository
- Enable [Corepack](https://github.com/nodejs/corepack) using `corepack enable`
- Install dependencies using `pnpm install`
- Run interactive tests using `pnpm dev`

## License

Made with 💛

Published under [MIT License](./LICENSE). Based on [puleos/object-hash](https://github.com/puleos/object-hash) by [Scott Puleo](https://github.com/puleos/), and [brix/crypto-js](https://github.com/brix/crypto-js).
