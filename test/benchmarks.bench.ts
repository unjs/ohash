import { bench, describe } from "vitest";

import { digest as digestJS } from "../src/crypto/js";
import { digest as digestNode } from "../src/crypto/node";

describe("benchmarks", () => {
  describe("digest", () => {
    bench("js", () => {
      digestJS("hello world");
    });
    bench("node", () => {
      digestNode("hello world");
    });
  });
});
