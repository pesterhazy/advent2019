import * as R from "ramda";
import * as util from "./util";

interface State {
  ip: number;
  mem: number[];
}

const readInput = (): number[] =>
  R.map(parseInt, util.readCSV("5.txt")[0]);

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

function run(state: State, input: number) {
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
        setv(2, input);
        state.ip += 2;
        break;
      case 4: // outp
        console.log("Output:", getv(0));
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
        console.log("halt");
        return;
      default:
        throw Error("Invalid opcode: " + opcode);
    }
  }
}

function solution() {
  let state: State = { ip: 0, mem: readInput() };

  run(R.clone(state), 1);
  run(R.clone(state), 5);
}

export default solution;
