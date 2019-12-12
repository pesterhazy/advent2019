import * as R from "ramda";
import * as util from "./util";
import * as math from "mathjs";

interface Moon {
  pos: math.Matrix;
  vel: math.Matrix;
}

// let example = "<x=-1, y=0, z=2>\n<x=2, y=-10, z=-7>\n<x=4, y=-8, z=8>\n<x=3, y=5, z=-1>";
let example =
  "<x=1, y=-4, z=3>\n<x=-14, y=9, z=-4>\n<x=-4, y=-6, z=7>\n<x=6, y=-9, z=-11>";

const readInput = (): Moon[] => {
  const lines = example.split(/\n/);
  if (!lines) throw new Error("Not found");
  return R.map((line: string) => {
    let matches = line.match(/-?\d+/g);
    if (!matches) throw new Error("Not found");
    return {
      vel: math.matrix([0, 0, 0]),
      pos: math.matrix(R.map((s: string) => parseInt(s), matches))
    };
  }, lines);
};

function applyGravity(m: Moon, others: Moon[]) {
  // m: moon 1
  // o: moon 2
  for (let o of others) {
    if (math.subset(m.pos, math.index(0)) < math.subset(o.pos, math.index(0))) {
      m.vel = math.add(m.vel, [1, 0, 0]) as math.Matrix;
    } else if (
      math.subset(m.pos, math.index(0)) > math.subset(o.pos, math.index(0))
    ) {
      m.vel = math.add(m.vel, [-1, 0, 0]) as math.Matrix;
    }
    if (math.subset(m.pos, math.index(1)) < math.subset(o.pos, math.index(1))) {
      m.vel = math.add(m.vel, [0, 1, 0]) as math.Matrix;
    } else if (
      math.subset(m.pos, math.index(1)) > math.subset(o.pos, math.index(1))
    ) {
      m.vel = math.add(m.vel, [0, -1, 0]) as math.Matrix;
    }
    if (math.subset(m.pos, math.index(2)) < math.subset(o.pos, math.index(2))) {
      m.vel = math.add(m.vel, [0, 0, 1]) as math.Matrix;
    } else if (
      math.subset(m.pos, math.index(2)) > math.subset(o.pos, math.index(2))
    ) {
      m.vel = math.add(m.vel, [0, 0, -1]) as math.Matrix;
    }
  }
}

function applyVelocity(m: Moon) {
  m.pos = math.add(m.pos, m.vel) as math.Matrix;
}

function energy(m: Moon) {
  let pot = R.reduce(
    (a: number, b: number) => a + b,
    0,
    R.map(n => Math.abs(n), m.pos.valueOf() as number[])
  );

  let kin = R.reduce(
    (a: number, b: number) => a + b,
    0,
    R.map(n => Math.abs(n), m.vel.valueOf() as number[])
  );

  return [pot, kin];
}

function ser(moons: Moon[]) {
  let s = "";
  for (let m of moons) {
    s = s + JSON.stringify([m.pos.valueOf(), m.vel.valueOf()]);
  }
  return s;
}

function solution() {
  let moons: Moon[] = readInput();
  {
    let total = 0;
    for (let moon of moons) {
      applyVelocity(moon);
      let [pot, kin] = energy(moon);
      let tot = pot * kin;
      total += tot;
    }
    console.log("start", "\t", total);
  }
  {
    let seen = new Set();
    for (let i = 0; true; i++) {
      applyGravity(moons[0], [moons[1], moons[2], moons[3]]);
      applyGravity(moons[1], [moons[0], moons[2], moons[3]]);
      applyGravity(moons[2], [moons[0], moons[1], moons[3]]);
      applyGravity(moons[3], [moons[0], moons[1], moons[2]]);
      let sumPot = 0;
      let sumKin = 0;
      let sumTot = 0;
      for (let moon of moons) {
        applyVelocity(moon);
        let [pot, kin] = energy(moon);
        let tot = pot * kin;
        sumPot += pot;
        sumKin += kin;
        sumTot += tot;
      }
      if (0 === i % 1000) {
        console.log(i, "\t", sumPot, "\t", sumKin, "\t", sumTot);
      }
      if (seen.has(ser(moons))) {
        console.log("FOUND", i, sumTot);
        console.log(i, "\t", sumPot, "\t", sumKin, "\t", sumTot);
        return;
      }
      seen.add(sumTot);
    }
  }
}

export default solution;
