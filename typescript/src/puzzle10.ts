import * as R from "ramda";
import * as util from "./util";

type Map = string[][];

const readInput = (): Map =>
  R.map(s => Array.from(s), util.readLines("10.txt"));

function solution() {
  let result = readInput();
  let width = result[0].length;
  let height = result.length;
  console.log(result);
  console.log(width, height);
}

export default solution;
