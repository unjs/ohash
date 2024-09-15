import unjs from "eslint-config-unjs";

// https://github.com/unjs/eslint-config
export default unjs({
  ignores: [
  "benchmark"
],
  rules: {
  "unicorn/no-null": 0,
  "unicorn/prevent-abbreviations": 0,
  "unicorn/prefer-math-trunc": 0,
  "numeric-separators-style": 0,
  "unicorn/prefer-code-point": 0,
  "unicorn/prefer-ternary": 0,
  "unicorn/prefer-spread": 0
},
});