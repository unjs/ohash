import { bench, describe } from "vitest";

import { digest as digestJS } from "../src/crypto/js";
import { digest as digestNode } from "../src/crypto/node";
import { serialize } from "../src";

describe("benchmarks", () => {
  describe("digest", () => {
    bench("js", () => {
      digestJS("hello world");
    });
    bench("node", () => {
      digestNode("hello world");
    });
  });

  describe("serialize", () => {
    bench("serialize", () => {
      serialize({ foo: "bar", bar: new Date(0), bool: false });
    });
  });
});
