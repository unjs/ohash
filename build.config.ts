import { defineBuildConfig } from "obuild/config";

export default defineBuildConfig({
  entries: [
    {
      type: "bundle",
      rolldown: {
        external: ["ohash/crypto"],
      },
      input: [
        "./src/index.ts",
        "./src/utils/index.ts",
        "./src/crypto/js/index.ts",
        "./src/crypto/node/index.ts",
      ],
    },
  ],
});
