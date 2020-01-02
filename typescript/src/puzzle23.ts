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
  R.map(s => parseInt(s), util.readCSV("23.txt")[0]);

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

interface System {
  n: number;
  g: any;
  r: any;
  q: Point[];
  idleCount: number;
}

interface Point {
  x: number;
  y: number;
}

const N = 50;

const putVal = (s: System, v: number) => {
  // console.log("putVal", s.n, v);
  if (s.r.done) throw "Generator is done";

  if (s.r.value.type !== "in") throw "Expected in, got " + s.r.value.type;

  s.r = s.g.next(v);
  // console.log("new r", s.r);
};

const getVal = (s: System) => {
  // console.log("getVal", s.n);
  if (s.r.done) throw "Generator is done";

  if (s.r.value.type !== "out") throw "Expected out, got " + s.r.value.type;

  let v = s.r.value.value;

  s.r = s.g.next();
  return v;
};

const isWaiting = (s: System) => s.r.value.type === "in";

function run(initialState: State) {
  let systems = _.range(N).map((n: number) => {
    let g = gen(initialState);
    let system: System = { g: g, r: g.next(), n: n, q: [], idleCount: 0 };
    putVal(system, n);
    return system;
  });

  let nat = undefined;

  for (let n of _.range(100)) {
    console.log(n);
    if (_.every(systems, s => s.idleCount > 2)) {
      throw "All idle";
    }
    for (let system of systems) {
      if (isWaiting(system)) {
        if (system.q.length > 0) {
          let point: Point = system.q.shift()!;
          putVal(system, point.x);
          putVal(system, point.y);
          system.idleCount = 0;
        } else {
          putVal(system, -1); // empty queue
          system.idleCount++;
        }
      } else {
        let dest = getVal(system);
        let x = getVal(system);
        let y = getVal(system);
        if (dest === 255) {
          nat = { x, y };
          console.log("nat", nat);
        } else {
          if (dest < 0 || dest > N) {
            throw "dest out of range: " + dest;
          }
          console.log([dest, x, y]);
          systems[dest].q.push({ x, y });
        }
        system.idleCount = 0;
      }
    }
  }
}

function solution() {
  let initialState: State = { ip: 0, base: 0, mem: readInput() };
  run(initialState);
}

export default solution;
