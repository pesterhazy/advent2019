import * as R from "ramda";
import * as util from "./util";

interface State {
  ip: bigint;
  base: bigint;
  mem: bigint[];
}

const readInput = (): bigint[] =>
  R.map(s => BigInt(s), util.readCSV("9.txt")[0]);

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
        case 0n:
          r = mem[Number(regval)];
          break;
        case 1n:
          r = regval;
          break;
        case 2n:
          r = mem[Number(state.base + regval)];
          break;
        default:
          throw new Error("Invalid mode");
      }
      if (r == undefined) return 0n;
      else return r;
    };

    const setv = (pn: bigint, v: bigint) => {
      // pn starts from 0
      let regval = mem[Number(ip + pn + 1n)];
      mem[Number(regval)] = v;
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
        let input = yield;
        if (input == undefined) throw new Error("Invalid input: " + input);

        setv(0n, input);
        state.ip += 2n;
        break;
      case 4n: // outp
        yield getv(0n);

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

function run(g: any, inputs: bigint[]): bigint[] {
  let results = inputs.map(input => g.next(input).value);
  return [...results, ...Array.from(g)];
}

function solution() {
  let initialState: State = { ip: 0n, base: 0n, mem: readInput() };
  let g = gen(initialState);
  g.next();

  console.log(run(g, [1n]));
}

export default solution;
