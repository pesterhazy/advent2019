import * as R from "ramda";
import * as util from "./util";
import * as math from "mathjs";

interface Moon {
  pos: math.Matrix;
  vel: math.Matrix;
}

let example1 =
  "<x=-1, y=0, z=2>\n<x=2, y=-10, z=-7>\n<x=4, y=-8, z=8>\n<x=3, y=5, z=-1>";
let exampleOurs =
  "<x=1, y=-4, z=3>\n<x=-14, y=9, z=-4>\n<x=-4, y=-6, z=7>\n<x=6, y=-9, z=-11>";

const readInput = (): Moon[] => {
  const lines = exampleOurs.split(/\n/);
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
    s =
      s +
      JSON.stringify([
        (m.pos.valueOf() as number[])[2],
        (m.vel.valueOf() as number[])[2]
      ]);
  }
  return s;
}

function solution() {
  console.log(lcmm([161428, 231614, 116328]));
  return;
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
    let seen = new Map();
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
      let hash = ser(moons);
      if (seen.has(hash)) {
        console.log("FOUND", i, seen.get(hash));
        console.log(i, "\t", sumPot, "\t", sumKin, "\t", sumTot);
        return;
      }
      seen.set(hash, i);
    }
  }
}

function gcd(a: number, b: number) {
  // Euclidean algorithm
  var t;
  while (b != 0) {
    t = b;
    b = a % b;
    a = t;
  }
  return a;
}

function lcm(a: number, b: number) {
  return (a * b) / gcd(a, b);
}

function lcmm(args: number[]): number {
  // Recursively iterate through pairs of arguments
  // i.e. lcm(args[0], lcm(args[1], lcm(args[2], args[3])))

  if (args.length == 2) {
    return lcm(args[0], args[1]);
  } else {
    var arg0 = args[0];
    args.shift();
    return lcm(arg0, lcmm(args));
  }
}

export default solution;

// x: 161428 0
// y: 231614 0
// z: 116328 0
