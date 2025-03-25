import type { BenchObjectPreset } from "./utils/objects";
import { type VersionString } from "./utils/versions";

type BenchConfig = {
  versions: VersionString[];
  presets: BenchObjectPreset[];
  /**
   * Options for ohash v1
   */
  hashOptions: Record<string, any>;
};

export const benchConfig: BenchConfig = {
  versions: [
    // "v1.0.0",
    // "v1.1.0",
    // "v1.1.1",
    // "v1.1.2",
    // "v1.1.3",
    // "v1.1.4",
    // "v1.1.5",
    "v1.1.6",
    // "v2.0.0",
    // "v2.0.1",
    // "v2.0.2",
    // "v2.0.3",
    // "v2.0.4",
    // "v2.0.5",
    // "v2.0.6",
    // "v2.0.7",
    // "v2.0.8",
    // "v2.0.9",
    // "v2.0.10",
    // "v2.0.11",
    // "7a52c4ac82c33396c2e2ea90e2896ccf3a03256b",
    "main",
  ],
  // Note: large circular presets don't work with v1
  presets: [
    {
      count: 1,
      size: "small",
    },
    { count: 1, size: "medium" },
    { count: 1, size: "large" },

    // {
    //   count: 256,
    //   size: "small",
    // },
    // {
    //   count: 192,
    //   size: "medium",
    // },
    // {
    //   count: 128,
    //   size: "large",
    // },

    // { count: 1, size: "small", circular: true },
    // { count: 1, size: "medium", circular: true },
    // { count: 1, size: "large", circular: true },

    // {
    //   count: 256,
    //   size: "small",
    //   circular: true,
    // },
    // {
    //   count: 192,
    //   size: "medium",
    //   circular: true,
    // },
    // {
    //   count: 128,
    //   size: "large",
    //   circular: true,
    // },

    // {
    //   count: 1024,
    //   size: "small",
    //   referenced: true,
    // },
    // {
    //   count: 768,
    //   size: "medium",
    //   referenced: true,
    // },
    // {
    //   count: 512,
    //   size: "large",
    //   referenced: true,
    // },

    // {
    //   count: 1024,
    //   size: "small",
    //   circular: true,
    //   referenced: true,
    // },
    // {
    //   count: 768,
    //   size: "medium",
    //   circular: true,
    //   referenced: true,
    // },
    // {
    //   count: 512,
    //   size: "large",
    //   circular: true,
    //   referenced: true,
    // },
  ],
  hashOptions: { unorderedArrays: true, unorderedSets: true },
};
