import Benchmark from "benchmark";
import { objectHash } from "ohash";
import largeJson from "./fixture/large.mjs";

function generateItems(num) {
  return new Array(num).fill(0).map(() => {
    return {
      propNum: Math.random(),
      propBool: Math.random() > 0.5,
      propString: Math.random().toString(16),
      propDate: new Date(),
      propObj: {
        propNum: Math.random(),
        propBool: Math.random() > 0.5,
        propString: Math.random().toString(16),
        propDate: new Date(),
      },
    };
  });
}

const suite = new Benchmark.Suite();
const singleObject = generateItems(1)[0];
const tinyArray = generateItems(10);
const mediumArray = generateItems(100);
const largeArray = generateItems(1000);

suite.add("hash({})", function () {
  const v = objectHash({});
});

suite.add("hash(singleObject)", function () {
  const v = objectHash(singleObject);
});

suite.add("hash(tinyArray)", function () {
  const v = objectHash(tinyArray);
});

suite.add("hash(mediumArray)", function () {
  const v = objectHash(mediumArray);
});

suite.add("hash(largeArray)", function () {
  const v = objectHash(largeArray);
});

suite.add("hash(largeJson)", function () {
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
