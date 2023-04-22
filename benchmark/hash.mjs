import Benchmark from "benchmark";
import { hash, asyncHash } from "ohash";
import largeJson from "./fixture/large.mjs";
import { generateItems } from "./_utils.mjs";

const dataSets = {
  emptyObject: {},
  singleObject: generateItems(1)[0],
  tinyArray: generateItems(10),
  mediumArray: generateItems(100),
  largeArray: generateItems(1000),
  largeJson,
};

const suite = new Benchmark.Suite();

for (const [name, data] of Object.entries(dataSets)) {
  suite.add(`hash(${name})`, () => {
    hash(data);
  });
  suite.add(
    `asyncHash(${name})`,
    (ctx) => {
      asyncHash(data).then(() => ctx.resolve());
    },
    { defer: true }
  );
}

suite
  .on("cycle", (event) => {
    console.log(event.target.toString());
  })
  .run();
