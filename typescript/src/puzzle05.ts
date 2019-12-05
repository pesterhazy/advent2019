import * as R from "ramda";
import * as util from "./util";

interface State {
  ip: number;
  mem: number[];
}

const readInput = (): number[] =>
  R.map(parseInt, util.readCSV("5.txt")[0]);

function run(state: State) {
  while (true) {
    let { ip, mem } = state;
    switch (mem[ip]) {
      case 1:
        mem[mem[ip + 3]] = mem[mem[ip + 1]] + mem[mem[ip + 2]];
        state.ip += 4;
        break;
      case 2:
        mem[mem[ip + 3]] = mem[mem[ip + 1]] * mem[mem[ip + 2]];
        state.ip += 4;
        break;
      case 99:
        return;
      default:
        throw Error("Invalid opcode");
    }
  }
}

function solution() {
  let state: State = { ip: 0, mem: readInput() };

  run(state);

  console.log(state);
}

export default solution;
