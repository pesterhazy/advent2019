import * as R from "ramda";
import * as util from "./util";

interface State {
  ip: number;
  base: number;
  mem: number[];
}

const readInput = (): number[] =>
  R.map(s => parseInt(s), util.readCSV("17.txt")[0]);

const parseOp = (i: number): [number, number, number, number] => {
  let ret = [];

  ret.push(i % 100);
  i = Math.floor(i / 100);
  ret.push(i % 10);
  i = Math.floor(i / 10);
  ret.push(i % 10);
  i = Math.floor(i / 10);
  ret.push(i % 10);
  i = Math.floor(i / 10);

  return ret as [number, number, number, number];
};

function* gen(initialState: State) {
  let state = R.clone(initialState);

  // console.log("inputs", inputs);

  while (true) {
    let { ip, mem } = state;
    let [opcode, ...modes] = parseOp(mem[ip]);

    // console.log(opcode, state);

    let r;
    const getv = (pn: number): number => {
      // pn starts from 0
      let regval = mem[ip + pn + 1];
      let mode = modes[pn];
      switch (mode) {
        case 0: // positional
          r = mem[regval];
          break;
        case 1: // immediate
          r = regval;
          break;
        case 2: // relative
          r = mem[state.base + regval];
          break;
        default:
          throw new Error("Invalid mode: " + mode);
      }
      if (r == undefined) return 0;
      else return r;
    };

    const setv = (pn: number, v: number) => {
      let regval = mem[ip + pn + 1];
      switch (modes[pn]) {
        case 0: // positional
          mem[regval] = v;
          break;
        case 2: // relative
          mem[state.base + regval] = v;
          break;
        default:
          throw new Error("Invalid set mode: " + modes[pn]);
      }
    };
    switch (opcode) {
      case 1: // add
        setv(2, getv(0) + getv(1));
        state.ip += 4;
        break;
      case 2: // mult
        setv(2, getv(0) * getv(1));
        state.ip += 4;
        break;
      case 3: // inp
        let input = yield { type: "in" };
        if (typeof input !== "number") {
          console.log("PREMATURE END OF INPUT");
          return;
        }
        setv(0, input);
        state.ip += 2;
        break;
      case 4: // outp
        let ret = yield { type: "out", value: getv(0) };
        if (ret != undefined) throw new Error("Unexpected yield value" + ret);

        state.ip += 2;
        break;
      case 5: // jump-if-true
        if (getv(0) !== 0) state.ip = getv(1);
        else state.ip += 3;
        break;
      case 6: // jump-if-false
        if (getv(0) === 0) state.ip = getv(1);
        else state.ip += 3;
        break;
      case 7: // lt
        setv(2, getv(0) < getv(1) ? 1 : 0);
        state.ip += 4;
        break;
      case 8: // eq
        setv(2, getv(0) === getv(1) ? 1 : 0);
        state.ip += 4;
        break;
      case 9: // setbase
        state.base += getv(0);
        state.ip += 2;
        break;
      case 99:
        return;
      default:
        throw Error("Invalid opcode: " + opcode);
    }
  }
}

const getWidth = (s: string) => {
  for (let i = 0; ; i++) {
    if (s[i] == "\n") {
      return i;
    }
  }
};

const ROBOT_SIGILS: string[] = ["^", "v", "<", ">"];
const DIRECTIONS = [0, 1, 2, 3];
const INVERSE = [1, 0, 3, 2];
const DELTA: Point[] = [
  { x: 0, y: -1 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
  { x: 1, y: 0 }
];

interface Point {
  x: number;
  y: number;
}

function run(initialState: State) {
  let g = gen(initialState);
  let s = Array.from(g)
    .map(o => String.fromCharCode(o.value as number))
    .join("");

  const peek = ({ x, y }: Point): string => {
    if (x < 0 || y < 0 || x >= width || y >= height) return ".";
    else return s[x + y * width];
  };

  const findInit = (): Point => {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (ROBOT_SIGILS.includes(peek({ x, y }))) return { x: x, y: y };
      }
    }
    throw new Error("Not found");
  };

  const findDirs = (start: Point): number[] => {
    let dirs = [];
    for (let dir of DIRECTIONS) {
      let p = { x: start.x + DELTA[dir].x, y: start.y + DELTA[dir].y };
      if (peek(p) === "#") dirs.push(dir);
    }
    return dirs;
  };

  const findDir = (start: Point): number => {
    let dirs = findDirs(start);
    if (dirs.length !== 1)
      throw new Error("Unepexected dirs length: " + dirs.length);
    return dirs[0];
  };

  console.log(s);

  let width = getWidth(s);
  s = s.replace(/\n/g, "");

  let height = s.length / width;

  let start = findInit();
  let dir = findDir(start);

  let p = start;
  let seen = new Set();
  let path = [start];
  let intersections = [];

  while (true) {
    let nx = { x: p.x + DELTA[dir].x, y: p.y + DELTA[dir].y };
    if (peek(nx) == "#") {
      // move forward
      path.push(nx);
      if (seen.has(`${nx.x},${nx.y}`)) {
        intersections.push(nx);
      }
      seen.add(`${nx.x},${nx.y}`);
      p = nx;
    } else {
      let dirs = findDirs(p).filter(d => d !== INVERSE[dir]);
      if (dirs.length > 1) {
        throw new Error("Unexpected dirs length: " + dirs.length);
      } else if (dirs.length === 0) {
        // end of the line
        break;
      }
      // turn
      dir = dirs[0];
    }
  }

  console.log(
    intersections.map((p: Point) => p.x * p.y).reduce((a, b) => a + b)
  );
}

function solution() {
  let initialState: State = { ip: 0, base: 0, mem: readInput() };

  run(initialState);
}

export default solution;
