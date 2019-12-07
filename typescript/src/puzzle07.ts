import * as R from "ramda";
import * as util from "./util";

interface State {
  ip: number;
  mem: number[];
}

const readInput = (): number[] =>
  R.map(parseInt, util.readCSVString("3,15,3,16,1002,16,10,16,1,16,15,15,4,15,99,0,0")[0]);

const parseOp = (i: number): [number,number,number,number] => {
  let ret = [];

  ret.push(i % 100);
  i = Math.floor(i / 100);
  ret.push(i % 10);
  i = Math.floor(i / 10);
  ret.push(i % 10);
  i = Math.floor(i / 10);
  ret.push(i % 10);
  i = Math.floor(i / 10);

  return ret as [number,number,number,number];
}

function run(initialState: State, inputs: number[]): number {
  let output;
  let state = R.clone(initialState);

  console.log("inputs", inputs);

  while (true) {
    let { ip, mem } = state;
    let [opcode, ...modes] = parseOp(mem[ip]);
    const getv = (pn : number) =>{
      // pn starts from 0
      let regval = mem[ip + pn + 1];
      if ( modes[pn] )
        return regval; // immediate
      else
        return mem[regval];
    }
    const setv = (pn: number, v: number) =>{
      // pn starts from 0
      let regval = mem[ip + pn + 1];
      mem[regval] = v;
    }
    switch (opcode) {
      case 1: // add
        setv(2,getv(0) + getv(1));
        state.ip += 4;
        break;
      case 2: // mult
        setv(2,getv(0) * getv(1));
        state.ip += 4;
        break;
      case 3: // inp
        if ( inputs.length == 0 )
          throw new Error("Out of input");

        let [input, ...rest] = inputs;
        inputs = rest;

        setv(2, input);
        state.ip += 2;
        break;
      case 4: // outp
        if ( output !== undefined )
          throw new Error("Multiple outputs");

        output = getv(0);
        console.log("output",output);
        state.ip += 2;
        break;
      case 5: // jump-if-true
        if ( getv(0) !== 0 )
          state.ip = getv(1);
        else
          state.ip += 3;
        break;
      case 6: // jump-if-false
        if ( getv(0) === 0 )
          state.ip = getv(1);
        else
          state.ip += 3;
        break;
      case 7: // lt
        setv(2,getv(0)<getv(1)?1:0);
        state.ip += 4;
        break;
      case 8: // eq
        setv(2,getv(0)===getv(1)?1:0);
        state.ip += 4;
        break;
      case 99:
        if ( output === undefined )
          throw new Error("No output yet");

        if ( inputs.length !== 0 )
          throw new Error("Did not consume all input");
        return output;
      default:
        throw Error("Invalid opcode: " + opcode);
    }
  }
}

function permute(permutation: any[]) {
  var length = permutation.length,
  result = [permutation.slice()],
  c = new Array(length).fill(0),
  i = 1, k, p;

  while (i < length) {
    if (c[i] < i) {
      k = i % 2 && c[i];
      p = permutation[i];
      permutation[i] = permutation[k];
      permutation[k] = p;
      ++c[i];
      i = 1;
      result.push(permutation.slice());
    } else {
      c[i] = 0;
      ++i;
    }
  }
  return result;
}

const compute = (initialState: State, input: number, phases: number[]) =>
  R.reduce((acc:number, phase:number) => run(initialState, [phase,acc]), 0, phases)

function solution() {
  let state: State = { ip: 0, mem: readInput() };

  let max = Number.NEGATIVE_INFINITY;
  for ( let phases of /*permute([0,1,2,3,4])*/ [[4,3,2,1,0]] ) {
    console.log(phases);
    let result = compute(state, 0,phases);
    console.log(result);
    if ( result > max)
      max = result;
  }

  console.log("max", max);
}

export default solution;
