import * as R from "ramda";
import * as util from "./util";

const WIDTH = 25;
const HEIGHT = 6;

const readInput = (): string[][] => {
  let s = util.readLines("8.txt")[0];

  let idx = 0;

  let l = 0;
  let layers: string[][] = [];
  while (idx < s.length) {
    let lines: string[] = [];
    for (let y = 0; y < HEIGHT; y++) {
      let line = s.substring(idx, idx + WIDTH);
      idx += WIDTH;
      lines.push(line);
    }
    layers.push(lines);
  }
  return layers;
};

function solution() {
  let layers = readInput();

  console.log(layers);
}

export default solution;
