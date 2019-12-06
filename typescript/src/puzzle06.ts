import * as R from "ramda";
import * as util from "./util";

const objectFromEntries = (x: any[]) =>
  x.reduce(function(prev, curr) {
    prev[curr[0]] = curr[1];
    return prev;
  }, {});

const readInput = (): any =>
  objectFromEntries(R.map(([a, b]) => [b, a], util.readCSV("6.txt", /\)/)));

function solution() {
  let o = readInput();
  let parents: { [key: string]: string[] } = {};
  let count = 0;
  for (let k in o) {
    let orig = k;
    parents[orig] = [];
    while (o[k]) {
      k = o[k];
      count++;
      parents[orig].push(k);
    }
  }
  console.log(count);

  let src = ["YOU", ...parents[o["YOU"]]],
    dst = ["SAN", ...parents[o["SAN"]]];

  // console.log(src, dst);

  let i, j;
  for (i = 0; i < src.length; i++) {
    j = dst.indexOf(src[i]);
    if (j == -1) continue;
    break;
  }
  console.log(i + (j as number));
}

export default solution;
