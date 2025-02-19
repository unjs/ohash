import { defineBuildConfig } from "unbuild";
import { transform } from "esbuild";
import { rm } from "node:fs/promises";

export default defineBuildConfig({
  hooks: {
    "rollup:options"(ctx, opts) {
      opts.plugins.push({
        name: "selective-minify",
        async transform(code, id) {
          if (id.includes("crypto/js") || id.includes("serialize")) {
            const res = await transform(code, { minify: true });
            return res.code;
          }
        },
      });
    },
    async "build:done"() {
      await rm("dist/index.d.ts");
      await rm("dist/crypto/js/index.d.ts");
      await rm("dist/crypto/node/index.d.ts");
    },
  },
});
