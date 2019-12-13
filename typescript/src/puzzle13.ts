import * as R from "ramda";
import * as util from "./util";

interface State {
  ip: bigint;
  base: bigint;
  mem: bigint[];
}

// const readInput = (): bigint[] =>
//   R.map(s => BigInt(s), util.readCSV("9.txt")[0]);

const readInput = (): bigint[] =>
  R.map(s => BigInt(s), util.readCSV("13.txt")[0]);

const parseOp = (i: bigint): [bigint, bigint, bigint, bigint] => {
  let ret = [];

  ret.push(i % 100n);
  i = i / 100n;
  ret.push(i % 10n);
  i = i / 10n;
  ret.push(i % 10n);
  i = i / 10n;
  ret.push(i % 10n);
  i = i / 10n;

  return ret as [bigint, bigint, bigint, bigint];
};

function* gen(initialState: State) {
  let state = R.clone(initialState);

  // console.log("inputs", inputs);

  while (true) {
    let { ip, mem } = state;
    let [opcode, ...modes] = parseOp(mem[Number(ip)]);

    // console.log(opcode, state);

    let r;
    const getv = (pn: bigint): bigint => {
      // pn starts from 0
      let regval = mem[Number(ip + pn + 1n)];
      switch (modes[Number(pn)]) {
        case 0n: // positional
          r = mem[Number(regval)];
          break;
        case 1n: // immediate
          r = regval;
          break;
        case 2n: // relative
          r = mem[Number(state.base + regval)];
          break;
        default:
          throw new Error("Invalid mode");
      }
      if (r == undefined) return 0n;
      else return r;
    };

    const setv = (pn: bigint, v: bigint) => {
      let regval = mem[Number(ip + pn + 1n)];
      switch (modes[Number(pn)]) {
        case 0n: // positional
          mem[Number(regval)] = v;
          break;
        case 2n: // relative
          mem[Number(state.base + regval)] = v;
          break;
        default:
          throw new Error("Invalid set mode: " + modes[Number(pn)]);
      }
    };
    switch (opcode) {
      case 1n: // add
        setv(2n, getv(0n) + getv(1n));
        state.ip += 4n;
        break;
      case 2n: // mult
        setv(2n, getv(0n) * getv(1n));
        state.ip += 4n;
        break;
      case 3n: // inp
        let input = yield { type: "in" };
        if (typeof input !== "bigint")
          throw new Error("Invalid input: " + input);

        setv(0n, input);
        state.ip += 2n;
        break;
      case 4n: // outp
        let ret = yield { type: "out", value: getv(0n) };
        if (ret != undefined) throw new Error("Unexpected yield value" + ret);

        state.ip += 2n;
        break;
      case 5n: // jump-if-true
        if (getv(0n) !== 0n) state.ip = getv(1n);
        else state.ip += 3n;
        break;
      case 6n: // jump-if-false
        if (getv(0n) === 0n) state.ip = getv(1n);
        else state.ip += 3n;
        break;
      case 7n: // lt
        setv(2n, getv(0n) < getv(1n) ? 1n : 0n);
        state.ip += 4n;
        break;
      case 8n: // eq
        setv(2n, getv(0n) === getv(1n) ? 1n : 0n);
        state.ip += 4n;
        break;
      case 9n: // setbase
        state.base += getv(0n);
        state.ip += 2n;
        break;
      case 99n:
        return;
      default:
        throw Error("Invalid opcode: " + opcode);
    }
  }
}

function run(initialState: State) {
  let g = gen(initialState);

  let seen = new Set();

  let triples = R.splitEvery(
    3,
    R.map(v => v.value, Array.from(g))
  );
  for (let [x, y, tid] of triples) {
    if (tid === 2n) seen.add(`${x},${y}`);
    if (tid === 0n) seen.delete(`${x},${y}`);
  }
  return seen.size;
}

function solution() {
  let initialState: State = { ip: 0n, base: 0n, mem: readInput() };

  console.log(run(initialState));
}

export default solution;
