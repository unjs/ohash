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
  suite.add(`asyncHash(${name})`, async () => {
    await asyncHash(data);
  });
}

suite
  // add listeners
  .on("cycle", function (event) {
    console.log(event.target.toString());
  })
  .on("complete", function () {
    console.log("Fastest is " + this.filter("fastest").map("name"));
  })
  .run({
    async: false,
  });
