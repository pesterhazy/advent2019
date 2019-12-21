import * as R from "ramda";
import * as util from "./util";
import * as _ from "lodash";

interface State {
  ip: number;
  base: number;
  mem: number[];
}

const readInput = (): number[] =>
  R.map(s => parseInt(s), util.readCSV("17.txt")[0]);

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

const getWidth = (s: string) => {
  for (let i = 0; ; i++) {
    if (s[i] == "\n") {
      return i;
    }
  }
};

const ROBOT_SIGILS: string[] = ["^", "v", "<", ">"];
const DIRECTIONS = [0, 1, 2, 3];
const turn = (from: number, to: number): string => {
  switch (`${from},${to}`) {
    case "0,2":
      return "L";
    case "0,3":
      return "R";
    case "1,2":
      return "R";
    case "1,3":
      return "L";
    case "2,0":
      return "R";
    case "2,1":
      return "L";
    case "3,0":
      return "L";
    case "3,1":
      return "R";
  }
  throw new Error("Invalid turn");
};
const INVERSE = [1, 0, 3, 2];
const DELTA: Point[] = [
  { x: 0, y: -1 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
  { x: 1, y: 0 }
];

interface Point {
  x: number;
  y: number;
}

interface Inst {
  lr: string;
  n: number;
}

function run(initialState: State): Inst[] {
  let g = gen(initialState);
  let s = Array.from(g)
    .map(o => String.fromCharCode(o.value as number))
    .join("");

  const peek = ({ x, y }: Point): string => {
    if (x < 0 || y < 0 || x >= width || y >= height) return ".";
    else return s[x + y * width];
  };

  const findInit = (): Point => {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (ROBOT_SIGILS.includes(peek({ x, y }))) return { x: x, y: y };
      }
    }
    throw new Error("Not found");
  };

  const findDirs = (start: Point): number[] => {
    let dirs = [];
    for (let dir of DIRECTIONS) {
      let p = { x: start.x + DELTA[dir].x, y: start.y + DELTA[dir].y };
      if (peek(p) === "#") dirs.push(dir);
    }
    return dirs;
  };

  const findDir = (start: Point): number => {
    let dirs = findDirs(start);
    if (dirs.length !== 1)
      throw new Error("Unepexected dirs length: " + dirs.length);
    return dirs[0];
  };

  console.log(s);

  let width = getWidth(s);
  s = s.replace(/\n/g, "");

  let height = s.length / width;

  let start = findInit();
  let initialDir = ROBOT_SIGILS.indexOf(peek(start));
  let dir = findDir(start);

  let p = start;
  let seen = new Set();
  let insts: Inst[] = [{ lr: turn(initialDir, dir), n: 0 }];
  let intersections = [];

  while (true) {
    let nx = { x: p.x + DELTA[dir].x, y: p.y + DELTA[dir].y };
    if (peek(nx) == "#") {
      // move forward
      insts[insts.length - 1].n++;
      if (seen.has(`${nx.x},${nx.y}`)) {
        intersections.push(nx);
      }
      seen.add(`${nx.x},${nx.y}`);
      p = nx;
    } else {
      let dirs = findDirs(p).filter(d => d !== INVERSE[dir]);
      if (dirs.length > 1) {
        throw new Error("Unexpected dirs length: " + dirs.length);
      } else if (dirs.length === 0) {
        // end of the line
        break;
      }
      // turn
      insts.push({ lr: turn(dir, dirs[0]), n: 0 });
      dir = dirs[0];
    }
  }

  console.log(
    intersections.map((p: Point) => p.x * p.y).reduce((a, b) => a + b)
  );
  return insts;
}

interface Chunk {
  tag: string;
  abbrev?: string;
  elements?: string[];
}

const findBest = (chunks: Chunk[]) => {
  let seqs: Record<string, number> = {};

  for (let chunk of chunks) {
    if (chunk.tag !== "elements") continue;

    let xs = chunk.elements;
    if (xs == undefined) throw new Error("Invariant");

    let kys: Set<string> = new Set();
    for (let i = 0; i < xs.length; i++) {
      for (let j = i; j < xs.length; j++) {
        let seq = xs.slice(i, j + 1);
        // FIXME?!
        if (seq.length < 2) continue;
        let s = JSON.stringify(seq);

        kys.add(s);
      }
    }
    for (let ky of kys) {
      let seq = JSON.parse(ky);
      let i = 0;
      while (i < xs.length) {
        if (_.isEqual(seq, xs.slice(i, i + seq.length))) {
          seqs[ky] = seqs[ky] || 0;
          seqs[ky]++;
          i += seq.length;
        } else i++;
      }
    }
  }

  let best;
  let maxVal = 0;
  let maxLen = 0;
  for (let key in seqs) {
    let seq = JSON.parse(key);

    let curVal = seqs[key];
    // prefer chunnks of length>1
    let curLen = seq.length + (curVal === 1 ? 0 : 100000);

    if (curLen > maxLen || (curLen === maxLen && curLen > maxLen)) {
      maxVal = curVal;
      maxLen = curLen;
      best = seq;
    }
  }
  return best;
};

const replaceSeq = (xs: string[], best: string[], abbrev: string) => {
  let ret: Chunk[] = [];
  let i = 0;
  while (i < xs.length) {
    let candidate = xs.slice(i, i + best.length);
    if (_.isEqual(best, candidate)) {
      ret.push({ tag: "abbrev", abbrev });
      i += best.length;
    } else {
      if (ret.length > 0 && ret[ret.length - 1].tag === "elements") {
        let es = ret[ret.length - 1].elements;
        if (es == undefined) {
          throw new Error("invariant");
        }
        es.push(xs[i]);
      } else {
        ret.push({ tag: "elements", elements: [xs[i]] });
      }
      i++;
    }
  }
  return ret;
};

const encodeRoutine = (xs: string[]): string => {
  let result = xs
    .map(r => {
      let matches = r.match(/([A-Z])([0-9]+)/);
      if (matches == undefined) throw new Error("Not found");
      return matches[1] + "," + matches[2];
    })
    .join(",");
  return result;
};

function compress(
  inputElements: string[]
): { main: string; routines: Record<string, string> } {
  let routines: Record<string, string> = {};
  let chunks: Chunk[] = [{ tag: "elements", elements: inputElements }];

  for (let ak of ["A", "B", "C"]) {
    let best = findBest(chunks);
    if (best == undefined) throw new Error("Did not find best");
    let newChunks: Chunk[] = [];
    for (let chunk of chunks) {
      if (chunk.tag === "abbrev") newChunks.push(chunk);
      else {
        let es = chunk.elements;
        if (es == undefined) throw new Error("invariant");
        newChunks.push(...replaceSeq(es, best, ak));
      }
    }

    routines[ak] = encodeRoutine(best);
    chunks = newChunks;
  }

  return {
    main: chunks
      .map(chunk => {
        if (chunk.tag !== "abbrev") throw new Error("Not abbrev");
        return chunk.abbrev;
      })
      .join(","),
    routines
  };
}

function solution() {
  let initialState: State = { ip: 0, base: 0, mem: readInput() };
  let insts: Inst[] = run(initialState);

  let input = insts.map(i => `${i.lr}${i.n}`);
  console.log(input.join(", "));
  // let input = _.chunk(
  //   "R,8,R,8,R,4,R,4,R,8,L,6,L,2,R,4,R,4,R,8,R,8,R,8,L,6,L,2".split(/,/),
  //   2
  // ).map(a => a.join(""));
  // let input = [1, 1, 2, 3, 2, 3, 1, 1, 4, 4, 4];
  // let input = [1, 2, 1, 2];
  let xs = input.map(n => n.toString());
  let result = compress(xs);
  console.log("%j", result);
}

export default solution;
