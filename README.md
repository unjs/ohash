# ohash

<!-- automd:badges bundlephobia codecov -->

[![npm version](https://img.shields.io/npm/v/ohash)](https://npmjs.com/package/ohash)
[![npm downloads](https://img.shields.io/npm/dm/ohash)](https://npm.chart.dev/ohash)
[![bundle size](https://img.shields.io/bundlephobia/minzip/ohash)](https://bundlephobia.com/package/ohash)
[![codecov](https://img.shields.io/codecov/c/gh/unjs/ohash)](https://codecov.io/gh/unjs/ohash)

<!-- /automd -->

Fast data [hashing](https://en.wikipedia.org/wiki/Hash_function) utils.

> [!NOTE]
> You are on active v2 development branch. Check [v1](https://github.com/unjs/ohash/tree/v1) for ohash v1 docs.

## Usage

Install [`ohash`](https://www.npmjs.com/package/ohash):

```sh
# ✨ Auto-detect (npm, yarn, pnpm, bun or deno)
npx nypm i ohash
```

**Then import it:**

```js
// ESM import
import { hash, serialize, isEqual, diff, digest } from "ohash";

// Dynamic import
const { hash } = await import("ohash");

// import from CDN
import { hash } from "https://esm.sh/ohash";
const { hash } = await import("https://esm.sh/ohash");
```

## `hash(input, options?)`

Hashes any JS value into a string.

```js
import { hash } from "ohash";

// "dZbtA7f0lK"
console.log(hash({ foo: "bar" }));
```

**How it works:**

- If input is not a string, it will be serialized into a string like `object:1:string:3:foo:string:3:bar,` using [`serialize()`](#serializeinput-options).
- Then it is hashed using [SHA-256](https://en.wikipedia.org/wiki/SHA-2) algorithm and encoded as a [Base64](https://en.wikipedia.org/wiki/Base64) string using [`digest()`](#digeststr).

## `serialize(input, options?)`

Serializes any input value into a string for usable hashing.

```js
import { serialize } from "ohash";

// "object:1:string:3:foo:string:3:bar,"
console.log(serialize({ foo: "bar" }));
```

## `digest(str)`

Create a [sha256](https://en.wikipedia.org/wiki/SHA-2) digest from input (string) and returns the hash as a base64 string.

> [!IMPORTANT]
> The `+`, `/`, and `=` characters are removed from base64 result to maximize compatibility.

```ts
import { digest } from "ohash";

// "pZGm1Av0IEBKARczz7exkNYsZb8LzaMrV7J32a2fFG4"
console.log(digest("Hello World"));
```

## `isEqual(obj1, obj2, options?)`

Compare two objects using `===` then fallbacks to compare based on their [serialized](#serializeinput-options) values.

```js
import { isEqual } from "ohash";

// true
console.log(isEqual({ a: 1, b: 2 }, { b: 2, a: 1 }));
```

## `diff(obj1, obj2, options?)`

Compare two objects with nested [serialization](#serializeinput-options). Returns an array of changes.

Returned value is an array of diff entries with `$key`, `$hash`, `$value` and `$props`. When logging, a string version of changelog is displayed.

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

## Contribute

- Clone this repository
- Enable [Corepack](https://github.com/nodejs/corepack) using `corepack enable`
- Install dependencies using `pnpm install`
- Run interactive tests using `pnpm dev`

## License

Made with 💛 Published under [MIT License](./LICENSE).

Based on [puleos/object-hash](https://github.com/puleos/object-hash) by [Scott Puleo](https://github.com/puleos/), and [brix/crypto-js](https://github.com/brix/crypto-js).
