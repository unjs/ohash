import type { BenchObjectPreset } from "./bench-objects";
import type { VersionCode } from "./utils/versions";

type BenchConfig = {
  versions: VersionCode[];
  presets: BenchObjectPreset[];
  /**
   * Options for ohash v1
   */
  hashOptions: Record<string, any>;
};

export const benchConfig: BenchConfig = {
  versions: ["v1.1.6", "v2.0.11"],
  presets: [
    {
      count: 1,
      size: "small",
    },
    { count: 1, size: "small", circular: true },
    { count: 1, size: "large" },
    { count: 1, size: "large", circular: true },
    {
      count: 1024,
      size: "small",
      referenced: true,
    },
    {
      count: 1024,
      size: "small",
      circular: true,
      referenced: true,
    },
    {
      count: 512,
      size: "large",
      referenced: true,
    },
    {
      count: 512,
      size: "large",
      circular: true,
      referenced: true,
    },
    {
      count: 256,
      size: "small",
    },
    {
      count: 256,
      size: "small",
      circular: true,
    },
    {
      count: 128,
      size: "large",
    },
    {
      count: 128,
      size: "large",
      circular: true,
    },
  ],
  hashOptions: { unorderedArrays: true, unorderedSets: true },
};
