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

const between = (p1: Vector, p2: Vector, p3: Vector): boolean => {
  let a = sub(p2, p1);
  let b = sub(p3, p1);

  return mag(b) > mag(a) && approxeq(dop(a, b), 1);
};

function solution() {
  let result = readInput();
  let width = result[0].length;
  let height = result.length;
  console.log(result);
  console.log(width, height);
}

export default solution;
