import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";
import { build } from "esbuild";

describe("bundle size", () => {
  it("digest (js)", async () => {
    const code = /* js */ `
      import { digest } from "../src/crypto/js/index";
      digest("")
    `;
    const { bytes, gzipSize } = await getBundleSize(code);
    // console.log({ bytes, gzipSize });
    expect(bytes).toBeLessThanOrEqual(3200); // <3.2kb
    expect(gzipSize).toBeLessThanOrEqual(1750); // <1.75kb
  });

  it("serialize", async () => {
    const code = /* js */ `
      import { serialize } from "../src";
      serialize("")
    `;
    const { bytes, gzipSize } = await getBundleSize(code);
    // console.log({ bytes, gzipSize });
    expect(bytes).toBeLessThanOrEqual(2400); // <2.4kb
    expect(gzipSize).toBeLessThanOrEqual(1000); // <1kb
  });

  it("hash", async () => {
    const code = /* js */ `
      import { hash } from "../src";
      hash("")
    `;
    const { bytes, gzipSize } = await getBundleSize(code);
    // console.log({ bytes, gzipSize });
    expect(bytes).toBeLessThanOrEqual(2600); // <2.6kb
    expect(gzipSize).toBeLessThanOrEqual(1200); // <1.2kb
  });
});

async function getBundleSize(code: string) {
  const res = await build({
    bundle: true,
    metafile: true,
    write: false,
    minify: true,
    format: "esm",
    platform: "node",
    outfile: "index.mjs",
    stdin: {
      contents: code,
      resolveDir: fileURLToPath(new URL(".", import.meta.url)),
      sourcefile: "index.mjs",
      loader: "js",
    },
  });
  const { bytes } = res.metafile.outputs["index.mjs"];
  const gzipSize = zlib.gzipSync(res.outputFiles[0].text).byteLength;
  return { bytes, gzipSize };
}
