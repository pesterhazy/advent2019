import * as R from "ramda";
import * as util from "./util";

type Map = string[][];
type Vector = [number, number];

const readInput = (): Map =>
  R.map(s => Array.from(s), util.readLines("10.txt"));

const dot = (a: Vector, b: Vector): number => a[0] * b[0] + a[1] * b[1];
const mag = (a: Vector): number => Math.sqrt(a[0] * a[0] + a[1] * a[1]);
const norm = (a: Vector): Vector => {
  let maga = mag(a);
  return [a[0] / maga, a[1] / maga];
};
const dop = (a: Vector, b: Vector): number => dot(norm(a), norm(b));
const sub = (a: Vector, b: Vector): Vector => [a[0] - b[0], a[1] - b[1]];
const epsilon = 0.001;
const approxeq = (v1: number, v2: number) => {
  return Math.abs(v1 - v2) < epsilon;
};

const eq = (a: Vector, b: Vector): boolean => a[0] == b[0] && a[1] == b[1];

const between = (p1: Vector, p2: Vector, p3: Vector): boolean => {
  let a = sub(p2, p1);
  let b = sub(p3, p1);

  return mag(b) > mag(a) && approxeq(dop(a, b), 1);
};

function solution() {
  let result = readInput();
  let ps: Vector[] = [];

  for (let [y, line] of result.entries()) {
    for (let [x, ch] of line.entries()) {
      if (ch === "#") ps.push([x, y]);
    }
  }

  let max = 0;
  for (let p1 of ps) {
    let n = 0;
    for (let p3 of ps) {
      if (eq(p1, p3)) continue;
      let blocked = false;
      for (let p2 of ps) {
        if (eq(p2, p3)) continue;
        if (eq(p2, p1)) continue;
        if (between(p1, p2, p3)) {
          blocked = true;
          break;
        }
      }
      if (!blocked) n++;
    }
    if (n > max) max = n;
  }
  console.log(max);
}

export default solution;
