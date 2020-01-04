import * as R from "ramda";
import * as util from "./util";
import * as _ from "lodash";
import * as readline from "readline";

interface State {
  ip: number;
  base: number;
  mem: number[];
}

const readInput = (): number[] =>
  R.map(s => parseInt(s), util.readCSV("25.txt")[0]);

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

interface System {
  g: any;
  r: any;
}

const putVal = (s: System, v: number) => {
  if (s.r.done) throw "Generator is done";

  if (s.r.value.type !== "in") throw "Expected in, got " + s.r.value.type;

  s.r = s.g.next(v);
};

const getVal = (s: System) => {
  if (s.r.done) throw "Generator is done";

  if (s.r.value.type !== "out") throw "Expected out, got " + s.r.value.type;

  let v = s.r.value.value;

  s.r = s.g.next();
  return v;
};

const isWaiting = (s: System) => s.r.value.type === "in";

const DIR: Record<string, [number, number]> = {
  north: [0, -1],
  south: [0, 1],
  west: [-1, 0],
  east: [1, 0]
};

async function run(initialState: State) {
  let g = gen(initialState);
  let system: System = { g: g, r: g.next() };
  let m: Map<number, Map<number, string>> = new Map();
  let pos: [number, number] = [0, 0];

  const flush = () => {
    console.log(inBuf);
    inBuf = "";
  };

  const updateMap = ([x, y]: [number, number]) => {
    let mm = m.get(y);
    if (!mm) {
      mm = new Map();
      m.set(y, mm);
    }
    mm.set(x, ".");
  };

  const printMap = () => {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (let [y, row] of m.entries()) {
      for (let x of row.keys()) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
      }
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }

    for (let y = minY; y <= maxY; y++) {
      let line = "";
      let mm = m.get(y);
      for (let x = minX; x <= maxX; x++) {
        let ch: string;
        if (x === pos[0] && y === pos[1]) ch = "@";
        else if (mm) {
          let r = mm.get(x);
          if (r == undefined) ch = " ";
          else ch = r;
        } else ch = " ";
        line += ch;
      }
      console.log(line);
    }
  };

  const rl = readline.createInterface({
    input: process.stdin
  });

  let it = rl[Symbol.asyncIterator]();
  let inBuf = "";
  while (true) {
    if (system.r.done) break;

    if (isWaiting(system)) {
      let line = await it.next();

      for (let ch of line.value + "\n") {
        putVal(system, ch.charCodeAt(0));
      }
      if (DIR[line.value]) {
        pos[0] += DIR[line.value][0];
        pos[1] += DIR[line.value][1];
        updateMap(pos);
        printMap();
      }
    } else {
      let ch = String.fromCharCode(getVal(system));
      if (ch === "\n") {
        flush();
      } else {
        inBuf += ch;
      }
    }
  }
}

function solution() {
  let initialState: State = { ip: 0, base: 0, mem: readInput() };
  run(initialState);
}

export default solution;
