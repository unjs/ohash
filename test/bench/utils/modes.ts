export const modes = {
  full: 0b111,
  presets: 0b100,
  combined: 0b010,
  custom: 0b001,
} as const;

type Mode = keyof typeof modes;

const selectedMode: number =
  process.argv
    .slice(2)
    .map((arg) => {
      const m = arg.replace("--", "");

      if (m in modes) {
        return modes[m as Mode];
      }

      throw new Error(`Invalid mode: ${m}`);
    })
    .reduce((acc, val) => acc | val, 0) || modes.presets;

export function isModeEnabled(mode: Mode) {
  return modes[mode] & selectedMode;
}
