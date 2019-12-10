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
  return 360 - ((x > 0 ? x : 2 * Math.PI + x) * 360) / (2 * Math.PI);
};

function solution() {
  let input = readInput();
  let ps: Vector[] = [];

  for (let [y, line] of input.entries()) {
    for (let [x, ch] of line.entries()) {
      if (ch === "#") ps.push([x, y]);
    }
  }

  let me: Vector;
  {
    let found;
    let max = 0;
    for (let p1 of ps) {
      let n = 0;
      // try all other asteroids
      for (let p3 of ps) {
        if (eq(p1, p3)) continue;

        // is any p2 between p1 and p3?
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
      if (n > max) {
        max = n;
        found = p1;
      }
    }
    console.log("solution 1", max);
    me = found as Vector;
  }

  console.log("me: %j", me);

  {
    // remove myself

    ps = R.reject(a => eq(a, me), ps);

    let n = 0;
    let dir: Vector = [0, -1];
    while (ps.length > 0) {
      let min = Infinity;
      let search: Vector | undefined;
      for (let p of ps) {
        let degs = angle(dir, sub(p, me));

        // unless we're in the first run, plae
        // direct hit last
        if (n > 0 && degs === 0) degs = 360;

        if (
          degs < min ||
          (degs === min && search && mag(sub(p, me)) < mag(sub(search, me)))
        ) {
          search = p;
          min = degs;
        }
      }
      if (search == undefined) throw new Error("Invariant violation");
      let target = search as Vector;
      n++;
      if (n === 200) {
        console.log("solution 2", target[0] * 100 + target[1]);
        return;
      }
      // remove target
      ps = R.reject(a => a[0] === target[0] && a[1] === target[1], ps);

      dir = sub(target, me);
    }
  }
}

export default solution;
