import * as R from "ramda";
import * as util from "./util";
import * as _ from "lodash";

enum Tag {
  Cut,
  Inc,
  New
}

interface Step {
  tag: Tag;
  v?: number;
}

const readInput = (): Step[] =>
  util.readLines("22.txt").map(l => {
    let matches = l.match(/-?\d+/g);
    if (l.match(/deal into new stack/)) return { tag: Tag.New };
    if (l.match(/deal with increment/))
      return { tag: Tag.Inc, v: parseInt(matches![0]) };
    if (l.match(/cut/)) return { tag: Tag.Cut, v: parseInt(matches![0]) };

    throw "Could not read line";
  });

function solution() {
  let input = readInput();

  console.log(input);
}

export default solution;
