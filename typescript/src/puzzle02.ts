import * as R from "ramda";
import * as util from "./util";

interface State {
  ip: number;
  mem: number[];
}

const readInput = (): number[] =>
  R.map(parseInt, util.readCSV("2.txt")[0]);

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

function patch(state: State, noun: number, verb: number) {
  state.mem[1] = noun;
  state.mem[2] = verb;
}

function find() {
  var originalState: State = { ip: 0, mem: readInput() };

  for (var i = 0; i < 100; i++) {
    for (var j = 0; j < 100; j++) {
      var state = R.clone(originalState);
      patch(state, i, j);
      run(state);
      if (state.mem[0] === 19690720) {
        console.log(i * 100 + j);
        return;
      }
    }
  }
}

export default find;
