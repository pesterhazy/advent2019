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

const SKIPY = 700;
const SIZEY = SKIPY + 1100;
const SKIPX = 300;
const SIZEX = 1500;
const SQUARE_SIZE = 100;

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
  const print = () => {
    for (let y = SKIPY; y < SIZEY; y++) {
      let s = "";
      for (let x = SKIPX; x < SIZEX; x++) {
        if (m[y] && m[y][x] === 1) {
          s += "#";
        } else {
          s += ".";
        }
      }
      console.log(s);
    }
  };
  let m: Record<number, Record<number, number>> = {};

  let count = 0;
  for (let y = SKIPY; y < SIZEY; y++) {
    for (let x = SKIPX; x < SIZEX; x++) {
      let px = peek({ x, y });
      m[y] = m[y] || {};
      m[y][x] = px;
      count += px;
    }
  }

  calc(SKIPY);
  calc(SIZEY - 1);

  function calc(y: number) {
    {
      let count = 0;
      for (let x = SKIPX; x < SIZEX; x++) {
        if (m[y][x] === 1) count++;
      }
      console.log("count", count);
    }
  }

  // print();

  // ***

  console.log("Finding...");
  let best = findSquare();
  console.log(best, best.x * 10000 + best.y);

  function findSquare() {
    let min = Infinity;
    let best;
    for (let y = SKIPY; y < SIZEY; y++) {
      for (let x = SKIPX; x < SIZEX; x++) {
        if (
          m[y] &&
          m[y + SQUARE_SIZE - 1] &&
          m[y][x] === 1 &&
          m[y + SQUARE_SIZE - 1][x] === 1 &&
          m[y][x + SQUARE_SIZE - 1] === 1 &&
          m[y + SQUARE_SIZE - 1][x + SQUARE_SIZE - 1] === 1
        ) {
          let dest = Math.sqrt(x * x + y * y);
          if (dest < min) {
            dest = min;
            best = { x, y };
          }
        }
      }
    }
    if (best == undefined) throw "not found";
    return best;
  }
}

function solution() {
  let initialState: State = { ip: 0, base: 0, mem: readInput() };
  run(initialState);
}

export default solution;
