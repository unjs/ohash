# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## v1.1.4

[compare changes](https://github.com/unjs/ohash/compare/v1.1.3...v1.1.4)

### 🩹 Fixes

- **murmurHash:** Fix murmurHash3 implementation, add tests ([#83](https://github.com/unjs/ohash/pull/83))

### 📖 Documentation

- Improved and finalized jsdocs in exported functions ([#74](https://github.com/unjs/ohash/pull/74))

### 🏡 Chore

- Update badge ([#46](https://github.com/unjs/ohash/pull/46))
- Update links in readme ([#59](https://github.com/unjs/ohash/pull/59))
- Update repo ([e09027f](https://github.com/unjs/ohash/commit/e09027f))

### ❤️ Contributors

- Max ([@onmax](http://github.com/onmax))
- Pooya Parsa ([@pi0](http://github.com/pi0))
- Hexagon <robinnilsson@gmail.com>
- Estéban ([@Barbapapazes](http://github.com/Barbapapazes))
- Luke Nelson <luke@nelson.zone>

## v1.1.3

[compare changes](https://github.com/unjs/ohash/compare/v1.1.2...v1.1.3)

### 🔥 Performance

- **object-hash:** Avoid using array to just concatenate the string ([#36](https://github.com/unjs/ohash/pull/36))
- **object-hash:** Avoid toString when we know that the value is already a string ([#33](https://github.com/unjs/ohash/pull/33))
- **object-hash:** Faster `isNativeFunction` check ([#30](https://github.com/unjs/ohash/pull/30))
- **object-hash:** Faster extract object type from toString ([#31](https://github.com/unjs/ohash/pull/31))
- **object-hash:** Faster object access by avoid string concat ([#32](https://github.com/unjs/ohash/pull/32))
- **object-hash:** Faster circular checking by using map ([#34](https://github.com/unjs/ohash/pull/34))
- **object-hash:** Reuse default options when is not passed ([#37](https://github.com/unjs/ohash/pull/37))
- **object-hash:** Avoid splice method to insert values ([#35](https://github.com/unjs/ohash/pull/35))

### 💅 Refactors

- Simplify diff formatting ([8e6cabc](https://github.com/unjs/ohash/commit/8e6cabc))

### 📖 Documentation

- Improve jsdoc for `objectHash()` ([#43](https://github.com/unjs/ohash/pull/43))

### 🏡 Chore

- Add benchmark scripts ([#40](https://github.com/unjs/ohash/pull/40))
- Update dev dependencies ([f1ab5f7](https://github.com/unjs/ohash/commit/f1ab5f7))
- Lint repo ([cd42064](https://github.com/unjs/ohash/commit/cd42064))
- Add autofix ci ([af19f81](https://github.com/unjs/ohash/commit/af19f81))
- Fix ts issue ([68a3429](https://github.com/unjs/ohash/commit/68a3429))
- Enable strict type checking ([2ed5b67](https://github.com/unjs/ohash/commit/2ed5b67))

### ❤️  Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))
- Owen Kieffer-Jones 
- Vinicius Lourenço

## v1.1.2

[compare changes](https://github.com/unjs/ohash/compare/v1.1.1...v1.1.2)


### 🩹 Fixes

  - **objectHash:** Serialize `boolean` as `bool` ([186e719](https://github.com/unjs/ohash/commit/186e719))

### ✅ Tests

  - Update snapshots ([52830c8](https://github.com/unjs/ohash/commit/52830c8))

### ❤️  Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))

## v1.1.1

[compare changes](https://github.com/unjs/ohash/compare/v1.1.0...v1.1.1)


### 💅 Refactors

  - Expose `diff` function types ([bc08321](https://github.com/unjs/ohash/commit/bc08321))

### ❤️  Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))

## v1.1.0

[compare changes](https://github.com/unjs/ohash/compare/v1.0.0...v1.1.0)


### 🚀 Enhancements

  - Expose `sha256base64` utility ([#19](https://github.com/unjs/ohash/pull/19))
  - **objectHash:** Serialize objects with `entries` ([1c8e8b9](https://github.com/unjs/ohash/commit/1c8e8b9))
  - **objectHash:** Support serializing classes with custom `toJSON()` ([331eceb](https://github.com/unjs/ohash/commit/331eceb))
  - `diff` utility ([#28](https://github.com/unjs/ohash/pull/28))

### 🩹 Fixes

  - Fix type of `SHA256.prototype.toString` method ([#23](https://github.com/unjs/ohash/pull/23))
  - **objectHash:** Serialize boolean types ([7fd580f](https://github.com/unjs/ohash/commit/7fd580f))

### 🏡 Chore

  - Add @vitest/coverage-c8 ([#24](https://github.com/unjs/ohash/pull/24))
  - Update all dependencies ([b17fa41](https://github.com/unjs/ohash/commit/b17fa41))
  - Lint and format with prettier ([373eac4](https://github.com/unjs/ohash/commit/373eac4))
  - Upgrade node version for ci ([9532f47](https://github.com/unjs/ohash/commit/9532f47))
  - Update release script ([3124feb](https://github.com/unjs/ohash/commit/3124feb))

### ❤️  Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))
- Nozomu Ikuta 
- Damian Głowala

## [1.0.0](https://github.com/unjs/ohash/compare/v0.1.5...v1.0.0) (2022-11-14)

### [0.1.5](https://github.com/unjs/ohash/compare/v0.1.4...v0.1.5) (2022-08-04)


### Features

* add `isEqual` ([098b1ec](https://github.com/unjs/ohash/commit/098b1ec82d858a740b719d278e24ebbc6a5aebef))

### [0.1.4](https://github.com/unjs/ohash/compare/v0.1.3...v0.1.4) (2022-07-14)


### Features

* use base64 to encode sha256 hash ([#13](https://github.com/unjs/ohash/issues/13)) ([778413f](https://github.com/unjs/ohash/commit/778413f5a848fb310dd08b17bbe65f2564ba2222))

### [0.1.3](https://github.com/unjs/ohash/compare/v0.1.2...v0.1.3) (2022-07-14)

### [0.1.2](https://github.com/unjs/ohash/compare/v0.1.1...v0.1.2) (2022-07-14)

### 0.1.1 (2022-07-14)


### Features

* rewrite as ohash ([61f834c](https://github.com/unjs/ohash/commit/61f834c7ffed805795b01f92a5eeea20ecba2f8e))
* support object hashing ([1e45c58](https://github.com/unjs/ohash/commit/1e45c5880b73ae74ac655532f2cfac74dffc262f))
* use secure sha256 algorithm ([#12](https://github.com/unjs/ohash/issues/12)) ([af60b50](https://github.com/unjs/ohash/commit/af60b50cec577ced43f1035b858601383b8fdf57))


### Bug Fixes

* **pkg:** set `sideEffects` field ([583d85e](https://github.com/unjs/ohash/commit/583d85e8ab96ef0da15aa897f7893fbb5ea44d8f))

### 0.1.1 (2021-10-18)


### Bug Fixes

* **pkg:** set `sideEffects` field ([583d85e](https://github.com/unjs/murmurhash-es/commit/583d85e8ab96ef0da15aa897f7893fbb5ea44d8f))
