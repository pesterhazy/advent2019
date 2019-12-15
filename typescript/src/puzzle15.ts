import * as R from "ramda";
import * as readlineSync from "readline-sync";
import * as util from "./util";
import * as game from "./replay";
import * as readline from "readline";

interface State {
  ip: number;
  base: number;
  mem: number[];
}

interface Value {
  type: string;
  value?: number;
}

interface Point {
  x: number;
  y: number;
}

const readInput = (): number[] =>
  R.map(s => parseInt(s), util.readCSV("15.txt")[0]);

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

const dx = [0, 0, -1, 1];
const dy = [-1, 1, 0, 0];
const invert = [2, 1, 4, 3];

function run(initialState: State) {
  let g = gen(initialState);
  const call = (cmd: number) => {
    let v;
    v = g.next().value as Value;
    if (v.type !== "in") throw new Error("Expected in");

    v = g.next(cmd).value as Value;
    if (v.type !== "out") throw new Error("Expected out");

    return v.value;
  };

  let target;
  let wall = new Set();
  let seen = new Set();
  let pos = { x: 0, y: 0 };
  let min = { x: 0, y: 0 };
  let max = { x: 0, y: 0 };
  let history: number[] = [];
  while (true) {
    // console.log("@", pos);
    let done = true;
    for (let dir of [1, 2, 3, 4]) {
      let dest = { x: pos.x + dx[dir - 1], y: pos.y + dy[dir - 1] };

      if (wall.has(`${dest.x},${dest.y}`)) {
        continue;
      }
      if (seen.has(`${dest.x},${dest.y}`)) {
        continue;
      }

      let ret = call(dir);
      switch (ret) {
        case 0:
          wall.add(`${dest.x},${dest.y}`);
          break;
        case 2:
          target = dest;
          console.log("Found target", target, history.length + 1);
        // fall thru
        case 1:
          pos = dest;
          max.x = Math.max(max.x, pos.x);
          max.y = Math.max(max.y, pos.x);
          min.x = Math.min(min.x, pos.x);
          min.y = Math.min(min.y, pos.x);
          seen.add(`${pos.x},${pos.y}`);
          history.push(dir);
          break;
        default:
          throw new Error("Unexpected ret");
      }
      done = false;
      break;
    }
    if (done) {
      if (history.length === 0) break;
      let originalDir = history.pop() as number;
      let dir = invert[originalDir - 1];
      let ret = call(dir);
      if (ret !== 1) throw new Error("Unexpected ret while backtracking");
      let dest = { x: pos.x + dx[dir - 1], y: pos.y + dy[dir - 1] };
      pos = dest;
    }
  }
  console.log(min, max);

  if (target == undefined) throw new Error("No target found");
  for (let y = min.y; y <= max.y; y++) {
    let line = "";
    for (let x = min.x; x <= max.x; x++) {
      let ch;
      if (wall.has(`${x},${y}`)) ch = "#";
      else if (target.x === x && target.y === y) ch = "O";
      else if (0 === x && 0 === y) ch = "@";
      else if (seen.has(`${x},${y}`)) ch = ".";
      else ch = " ";

      line += ch;
    }
    console.log(line);
  }
}

function solution() {
  let initialState: State = { ip: 0, base: 0, mem: readInput() };

  run(initialState);
}

export default solution;
