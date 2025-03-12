type SuiteName = keyof typeof suites;
type Suite = (typeof suites)[SuiteName];

const suites = {
  full: 0b111,
  presets: 0b100,
  combined: 0b010,
  custom: 0b001,
  undefined: 0b000,
} as const;

const defaultSuite = suites.presets;

const selectedSuite: Suite =
  process.argv
    .slice(2)
    .map((arg) => {
      const m = arg.replace("--", "");
      return m in suites ? suites[m as SuiteName] : suites.undefined;
    })
    // eslint-disable-next-line unicorn/no-array-reduce
    .reduce((acc, val) => (acc | val) as Suite, suites.undefined) ||
  defaultSuite;

export function suite(mode: SuiteName, fn: () => void) {
  if (suites[mode] & selectedSuite) {
    fn();
  }
}
