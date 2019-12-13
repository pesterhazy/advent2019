import * as R from "ramda";
import * as util from "./util";

interface State {
  ip: number;
  base: number;
  mem: number[];
}

const readInput = (): number[] =>
  R.map(s => parseInt(s), util.readCSV("13.txt")[0]);

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

function run(initialState: State) {
  let state = R.clone(initialState);
  state.mem[0] = 2;
  let g = gen(state);

  let width = 0,
    height = 0;
  let m = new Map();

  while (true) {
    let v = g.next();

    if (v.done) break;

    if ((v.value as any).type == "out") {
      let x = (v.value as any).value;
      let y = (g.next().value as any).value;
      let tid = (g.next().value as any).value;

      if (x == undefined || y == undefined) {
        console.log("WARNING: invalid x,y");
        break; // FIXME
      }
      m.set(`${x},${y}`, tid);
      width = Math.max(width, x);
      height = Math.max(height, y);
    } else if ((v.value as any).type == "in") {
      for (let y = 0; y < height; y++) {
        let line = "";
        for (let x = 0; x < width; x++) {
          let ch = " ";
          switch (m.get(`${x},${y}`)) {
            case undefined:
            case 0:
              ch = " ";
              break;
            case 1:
              ch = "#";
              break;
            case 2:
              ch = "x";
              break;
            case 3:
              ch = "-";
              break;
            case 4:
              ch = "o";
              break;
            default:
              throw new Error("Invalid tile id");
          }
          line += ch;
        }
        console.log(line);
      }
      throw new Error("boom");
    } else throw new Error("Invalid generator value: " + JSON.stringify(v));
  }
}

function solution() {
  let initialState: State = { ip: 0, base: 0, mem: readInput() };

  run(initialState);
}

export default solution;
