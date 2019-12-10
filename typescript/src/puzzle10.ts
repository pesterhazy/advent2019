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
const epsilon = 0.000000001;
const approxeq = (v1: number, v2: number) => {
  return Math.abs(v1 - v2) < epsilon;
};

const eq = (a: Vector, b: Vector): boolean => a[0] == b[0] && a[1] == b[1];

const between = (p1: Vector, p2: Vector, p3: Vector): boolean => {
  let a = sub(p2, p1);
  let b = sub(p3, p1);

  return mag(b) > mag(a) && approxeq(dop(a, b), 1);
};

const angle = (a: Vector, b: Vector): number => {
  let x = Math.atan2(a[1], a[0]) - Math.atan2(b[1], b[0]);
  let result = 360 - ((x > 0 ? x : 2 * Math.PI + x) * 360) / (2 * Math.PI);
  if (result == 0) return 360;
  else return result;
};

function solution() {
  let input = readInput();
  let ps: Vector[] = [];

  for (let [y, line] of input.entries()) {
    for (let [x, ch] of line.entries()) {
      if (ch === "#") ps.push([x, y]);
    }
  }

  // console.log("count", ps.length);

  // let max = 0;
  // for (let p1 of ps) {
  //   let n = 0;
  //   // try all other asteroids
  //   for (let p3 of ps) {
  //     if (eq(p1, p3)) continue;

  //     // is any p2 between p1 and p3?
  //     let blocked = false;
  //     for (let p2 of ps) {
  //       if (eq(p2, p3)) continue;
  //       if (eq(p2, p1)) continue;
  //       if (between(p1, p2, p3)) {
  //         blocked = true;
  //         break;
  //       }
  //     }
  //     if (!blocked) n++;
  //   }
  //   if (n > max) max = n;
  // }
  // console.log(max);

  let a: Vector = [0, -1];
  let bs: Vector[] = [
    [0, -1],
    [1, -1],
    [1, 0],
    [1, 1],
    [0, 1],
    [-1, 1],
    [-1, 0],
    [-1, -1],
    [-0.1, -1]
  ];
  for (let b of bs) {
    console.log(angle(a, b));
  }
}

export default solution;
