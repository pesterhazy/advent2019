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

type Stack = number[];

const readInput = (): Step[] =>
  util.readLines("22-1.txt").map(l => {
    let matches = l.match(/-?\d+/g);
    if (l.match(/deal into new stack/)) return { tag: Tag.New };
    if (l.match(/deal with increment/))
      return { tag: Tag.Inc, v: parseInt(matches![0]) };
    if (l.match(/cut/)) return { tag: Tag.Cut, v: parseInt(matches![0]) };

    throw "Could not read line: " + l;
  });

const next = (stack: Stack, { tag, v }: Step) => {
  if (tag === Tag.New) {
    return _.reverse(stack);
  }
  if (tag === Tag.Cut) {
    if (v == undefined) throw "Missing v";
    return [...stack.slice(v), ...stack.slice(0, v)];
  }
  if (tag === Tag.Inc) {
    if (v == undefined) throw "Missing v";
    let pos = 0;
    let out = [];
    for (let i = 0; i < stack.length; i++) {
      out[pos] = stack[i];
      pos = (pos + v) % stack.length;
    }
    return out;
  }
  throw "Unknown tag";
};

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

const calc = (i: number, { tag, v }: Step) => {
  if (tag === Tag.New) {
    return N - i;
  }
  if (tag === Tag.Cut) {
    if (v == undefined) throw "Missing v";
    return mod(i + v, N);
  }
  if (tag === Tag.Inc) {
    if (v == undefined) throw "Missing v";
    return N - i;
  }
  throw "Unknown tag";
};

// const N = 10007;
const N = 10;

function solution() {
  let input = readInput();

  let stack = _.range(N);
  console.log(stack);
  for (let step of input) {
    stack = next(stack, step);
    if (stack.length != N) throw "oops";
  }
  // console.log(
  //   "n=2019",
  //   _.findIndex(stack, n => n == 2019)
  // );
  console.log(stack);
  let result = _.range(N).map(i => input.reduce(calc, i));
  console.log(result);
}

export default solution;
