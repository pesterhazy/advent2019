import * as R from "ramda";
import * as util from "./util";
import * as math from "mathjs";

interface Moon {
  pos: math.Matrix;
  vel: math.Matrix;
}

let example =
  "<x=-1, y=0, z=2>\n<x=2, y=-10, z=-7>\n<x=4, y=-8, z=8>\n<x=3, y=5, z=-1>";

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

function solution() {
  let moons: Moon[] = readInput();
  for (let i = 0; i < 10; i++) {
    console.log("step", i);
    applyGravity(moons[0], [moons[1], moons[2], moons[3]]);
    applyGravity(moons[1], [moons[0], moons[2], moons[3]]);
    applyGravity(moons[2], [moons[0], moons[1], moons[3]]);
    applyGravity(moons[3], [moons[0], moons[1], moons[2]]);
    for (let moon of moons) {
      applyVelocity(moon);
      console.log("pos", moon.pos.valueOf());
      console.log("vel", moon.vel.valueOf());
    }
  }
}

export default solution;
