import * as R from "ramda";
import * as util from "./util";

interface State {
  ip: number;
  mem: number[];
}

const objectFromEntries = (x: any[]) =>
  x.reduce(function(prev, curr) {
    prev[curr[0]] = curr[1];
    return prev;
  }, {});

const readInput = (): any => objectFromEntries(util.readCSV("6.txt", /\)/));

function solution() {
  let o = readInput();
  for (let k in o) {
    console.log(k);
  }
}

export default solution;
