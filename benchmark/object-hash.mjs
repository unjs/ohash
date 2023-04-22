import Benchmark from "benchmark";
import { objectHash } from "ohash";
import largeJson from "./fixture/large.mjs";
import { generateItems } from "./_utils.mjs";

const singleObject = generateItems(1)[0];
const tinyArray = generateItems(10);
const mediumArray = generateItems(100);
const largeArray = generateItems(1000);

const suite = new Benchmark.Suite();

suite.add("objectHash({})", function () {
  const v = objectHash({});
});

suite.add("objectHash(singleObject)", function () {
  const v = objectHash(singleObject);
});

suite.add("objectHash(tinyArray)", function () {
  const v = objectHash(tinyArray);
});

suite.add("objectHash(mediumArray)", function () {
  const v = objectHash(mediumArray);
});

suite.add("objectHash(largeArray)", function () {
  const v = objectHash(largeArray);
});

suite.add("objectHash(largeJson)", function () {
  const v = objectHash(largeJson);
});

suite.add("objectHash(largeJson, { unorderedObjects: true })", function () {
  const v = objectHash(largeJson, { unorderedObjects: true });
});

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
