import * as R from "ramda";
import * as readlineSync from "readline-sync";
import * as util from "./util";
import * as _ from "lodash";

interface State {
  ip: number;
  base: number;
  mem: number[];
}

const readInput = (): number[] =>
  R.map(s => parseInt(s), util.readCSV("21.txt")[0]);

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

// const program = `
// // set T to true
// NOT T T
// AND A T
// AND B T
// AND C T
// NOT T T
// // set T to true if safe to jump
// AND D T
// // copy T to J
// OR T J
// // AND H J
// RUN
// `;

// max 15 instructions
const program = `
NOT B T
NOT F J
OR T J
NOT E T
NOT T T
OR H T
AND T J
AND D J
NOT A T
OR T J
RUN
`;

function run(initialState: State) {
  let g = gen(initialState);
  let outBuf = "";
  let inBuf = program.replace(/^\n*/, "").replace(/\/\/.*\n/g, "");

  console.log(inBuf);

  let r = g.next();
  let i = 0;
  const flush = () => {
    if (outBuf.length > 0) {
      console.log(outBuf);
      outBuf = "";
    }
  };
  while (true) {
    if (r.done) break;

    if (r.value.type === "out") {
      let n = r.value.value as number;

      if (n > 255) {
        console.log("Damage:", n);
      } else {
        outBuf += String.fromCharCode(n);
      }
      r = g.next();
    } else if (r.value.type === "in") {
      flush();
      if (i >= inBuf.length) throw "inBuf empty";

      r = g.next(inBuf.charCodeAt(i));
      i++;
    }
  }
  flush();
}

function solution() {
  let initialState: State = { ip: 0, base: 0, mem: readInput() };
  run(initialState);
}

export default solution;
