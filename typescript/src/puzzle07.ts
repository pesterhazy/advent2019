import * as R from "ramda";
import * as util from "./util";

interface State {
  ip: number;
  mem: number[];
}

const readInput = (): number[] => R.map(parseInt, util.readCSV("7.txt")[0]);

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
    // console.log("%j", state);

    let { ip, mem } = state;
    let [opcode, ...modes] = parseOp(mem[ip]);
    const getv = (pn: number) => {
      // pn starts from 0
      let regval = mem[ip + pn + 1];
      if (modes[pn]) return regval;
      // immediate
      else return mem[regval];
    };

    const setv = (pn: number, v: number) => {
      // pn starts from 0
      let regval = mem[ip + pn + 1];
      mem[regval] = v;
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
        let input = yield;
        if (input == undefined) throw new Error("Invalid input: " + input);

        setv(0, input);
        state.ip += 2;
        break;
      case 4: // outp
        let v = getv(0);
        let r = yield v;

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
      case 99:
        return;
      default:
        throw Error("Invalid opcode: " + opcode);
    }
  }
}

const compute = (initialState: State, input: number, phases: number[]) =>
  R.reduce(
    (acc: number, phase: number): number => {
      let g = gen(initialState);
      g.next(); // start machine
      g.next(phase);
      return g.next(acc).value as number;
    },
    0,
    phases
  );

const compute2 = (initialState: State, input: number, phases: number[]) => {
  let amps = R.map(phase => {
    let g = gen(initialState);
    g.next(); // start machine
    g.next(phase); // initialize with phase
    return g;
  }, phases);

  let i = 0;
  let v = input;
  while (true) {
    let result = amps[i].next(v); // input value

    if (result.done) return v;

    if (typeof result.value !== "number")
      throw new Error("Unexpceted value: " + result.value);

    v = result.value as number;

    amps[i].next(); // move to next input

    // next amp
    i = (i + 1) % amps.length;
  }
};

function solution() {
  let state: State = { ip: 0, mem: readInput() };

  {
    let max = Number.NEGATIVE_INFINITY;
    for (let phases of util.permute([0, 1, 2, 3, 4])) {
      let result = compute(state, 0, phases);
      if (result > max) max = result;
    }

    console.log("solution 1", max);
  }

  {
    let max = Number.NEGATIVE_INFINITY;
    for (let phases of util.permute([5, 6, 7, 8, 9])) {
      let result = compute2(state, 0, phases);
      if (result > max) max = result;
    }

    console.log("solution 2", max);
  }
}

export default solution;
