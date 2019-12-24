import * as util from "./util";
import * as R from "ramda";
import * as _ from "lodash";

interface State {
  ip: number;
  base: number;
  mem: number[];
}

const readInput = (): number[] =>
  R.map(s => parseInt(s), util.readCSV("19.txt")[0]);

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
  let state = _.clone(initialState);

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

interface Point {
  x: number;
  y: number;
}

const SIZE = 100;

function run(initialState: State) {
  const peek = ({ x, y }: Point): number => {
    let g = gen(_.cloneDeep(initialState));
    let r: any;
    r = g.next();
    if (r.done) throw "Premature end of output";
    if (r.value.type !== "in") throw "boo: " + JSON.stringify(r);

    r = g.next(x);
    if (r.done) throw "Premature end of output";
    if (r.value.type !== "in") throw "boo: " + JSON.stringify(r);
    r = g.next(y);
    if (r.done) throw "Premature end of output";
    if (r.value.type !== "out") throw "boo: " + JSON.stringify(r);
    if (typeof r.value.value !== "number") throw "Unexpected type";
    return r.value.value;
  };

  function findStart(skipx: number, y: number) {
    // start inclusive
    let x = skipx;
    while (peek({ x, y }) === 0) {
      x++;
    }
    return x;
  }
  function findEnd(fromx: number, y: number) {
    // end exclusive
    let low = fromx,
      high = 50000;
    // look for end
    // low <= target <= high
    while (low !== high) {
      let mid = Math.floor(0.5 * (low + high));
      if (peek({ x: mid, y }) === 0) {
        high = mid;
      } else {
        low = mid;
        // this is annoying - is this the right way to do binary search?
        if (low === high - 1) low = high;
      }
    }
    return low;
  }
  const scan = (y: number, skipx: number): { start: number; end: number } => {
    if (y < 5) throw "y too low";

    let start = findStart(skipx, y);
    let end = findEnd(start, y);
    return { start, end };
  };
  function print(endx: number, endy: number) {
    for (let y = 5; y < endy; y++) {
      let s = y.toString().padStart(3) + " ";
      for (let x = 0; x < endx; x++) {
        s += peek({ x, y }) ? "#" : ".";
      }
      console.log(s);
    }
  }

  print(80, 80);

  let rows = [];
  let prevStartX = 0;
  for (let y = 5; ; y++) {
    rows[y] = scan(y, prevStartX);
    // console.log(y, rows[y]);
    prevStartX = rows[y].start;
    if (y < 5 + SIZE) continue;
    let prevy = y - SIZE + 1;
    let diff = rows[prevy].end - rows[y].start;
    // console.log(diff);
    if (diff === SIZE) {
      let tx = rows[y].start;
      let ty = prevy;
      console.log(tx, ty, 10000 * tx + ty);
      console.log(rows[prevy].start, rows[prevy].end);
      return;
    }
  }
  throw "Nothing found";
}

function solution() {
  let initialState: State = { ip: 0, base: 0, mem: readInput() };
  run(initialState);
}

export default solution;
