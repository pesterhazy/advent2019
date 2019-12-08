import * as R from "ramda";
import * as util from "./util";

const WIDTH = 25;
const HEIGHT = 6;

type Layer = string[];

const readInput = (): Layer[] => {
  let s = util.readLines("8.txt")[0];

  let idx = 0;

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

const countChars = (needle: string, lines: Layer) =>
  R.filter(
    ch => ch === needle,
    R.chain(line => Array.from(line), lines)
  ).length;

function solution() {
  let layers = readInput();

  {
    let min = Number.POSITIVE_INFINITY;
    let layer: Layer | undefined;

    for (let lines of layers) {
      let v = countChars("0", lines);

      if (v < min) {
        min = v;
        layer = lines;
      }
    }

    if (layer == undefined) throw new Error("Invariant violation");

    console.log(layer);

    let result = countChars("1", layer) * countChars("2", layer);

    console.log(result);
  }

  {
    for (let y = 0; y < HEIGHT; y++) {
      let rline = "";
      for (let x = 0; x < WIDTH; x++) {
        let v;

        for (let lines of layers) {
          let vv = lines[y][x];

          if (vv === "0" || vv === "1") {
            v = vv;
            break;
          }
        }
        let px;
        if (v === "1") px = "\u2588";
        else if (v === "0") px = " ";
        else throw new Error("Invalid pixel");

        rline += px;
      }
      console.log(rline);
    }
  }
}

export default solution;
