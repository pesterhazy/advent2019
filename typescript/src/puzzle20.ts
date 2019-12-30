import * as util from "./util";
import * as _ from "lodash";

interface Dungeon {
  lines: string[];
  width: number;
  height: number;
  start: Point;
  end: Point;
  up: [string, string][];
  down: [string, string][];
  where: Record<string, Point>;
}

interface Point {
  x: number;
  y: number;
}

const DIRECTIONS = [0, 1, 2, 3]; // up, down, left, right
const DELTA: Point[] = [
  { x: 0, y: -1 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
  { x: 1, y: 0 }
];

const MAX_LEVEL = 30;

const padd = (a: Point, b: Point): Point => ({ x: a.x + b.x, y: a.y + b.y });

const findNext = (d: Dungeon, p: Point): { ch: string; p: Point } => {
  let candidates;

  candidates = DIRECTIONS.map((dir: number) => {
    let np = padd(p, DELTA[dir]);

    let ch;
    if (np.x < 0 || np.y < 0 || np.x >= d.width || np.y >= d.height)
      ch = undefined;
    else ch = peek(d, np);
    return { ch, p: np };
  }).filter(c => {
    if (c.ch == undefined) return false;
    if (!c.ch.match(/[A-Z.]/)) return false;
    return true;
  });
  let result: any =
    _.find(candidates, c => c.ch == ".") ||
    _.find(candidates, c => c.ch && c.ch.match(/[A-Z]/));
  if (result == undefined) throw "Not found";
  return result;
};

const label = (
  a: { ch: string; p: Point },
  b: { ch: string; p: Point }
): string => {
  if (a.p.x < b.p.x || a.p.y < b.p.y) return a.ch + b.ch;
  else return b.ch + a.ch;
};

const readInput = (): Dungeon => {
  let lines = util.readLines("20.txt");
  let labels: Record<string, Point[]> = {};
  let where: Record<string, Point> = {};
  let up: [string, string][] = [];
  let down: [string, string][] = [];

  let d: Dungeon = {
    lines,
    width: lines[0].length,
    height: lines.length,
    start: { x: -1, y: -1 },
    end: { x: -1, y: -1 },
    up: [],
    down: [],
    where: {}
  };

  for (let y = 0; y < lines.length; y++) {
    for (let x = 0; x < lines[0].length; x++) {
      let ch = lines[y][x];
      if (ch.match(/[A-Z]/)) {
        let r = findNext(d, { x, y });

        if (r.ch === ".") continue;

        let r2 = findNext(d, r.p);

        if (r2.ch !== ".") throw "Expected . got " + r2.ch;

        let l = label(r, { ch: ch, p: { x, y } });
        labels[l] = labels[l] || [];

        let outer =
          x < 2 || y < 2 || x >= lines[0].length - 2 || y >= lines.length - 2;
        if (outer) labels[l][0] = r2.p;
        else labels[l][1] = r2.p;
      }
    }
  }

  for (let [l, ar] of Object.entries(labels)) {
    if (l === "AA") {
      d.start = ar[0];
      continue;
    }

    if (l === "ZZ") {
      d.end = ar[0];
      continue;
    }
    if (ar.length !== 2) throw "oops length: " + ar.length;

    let [a, b]: [Point, Point] = ar as [Point, Point];
    where[l + "_UP"] = a;
    where[l + "_DOWN"] = b;
    down.push([l + "_DOWN", l + "_UP"]);
    up.push([l + "_UP", l + "_DOWN"]);
  }
  d.up = up;
  d.down = down;
  d.where = where;

  return d;
};

const peek = (d: Dungeon, { x, y }: Point): string => {
  if (x < 0 || y < 0 || x >= d.width || y >= d.height)
    throw new Error("Out of bounds");
  else return d.lines[y][x];
};

type LocMap = Record<number, Record<number, number>>;

const findLoc = (locMap: LocMap, p: Point) => {
  if (!(p.x in locMap)) return undefined;
  return locMap[p.x][p.y];
};

const setLoc = (locMap: LocMap, p: Point, n: number) => {
  if (!(p.x in locMap)) locMap[p.x] = {};
  locMap[p.x][p.y] = n;
};

const findDistances = (
  d: Dungeon,
  src: Point,
  dests: Record<string, Point>
): Record<string, number> => {
  let pos = src;
  let locMap: LocMap = {};
  let path: Point[] = [];

  while (true) {
    let done = true;
    let options: Point[] = [
      ...DIRECTIONS.map(dir => ({
        x: pos.x + DELTA[dir].x,
        y: pos.y + DELTA[dir].y
      }))
    ];
    for (let next of options) {
      let loc = findLoc(locMap, next);
      if (loc != undefined && path.length + 1 >= loc) {
        continue;
      }

      let v = peek(d, next);
      if (v !== ".") {
        continue;
      }

      path.push(pos);
      pos = next;
      setLoc(locMap, pos, path.length);
      done = false;
    }
    if (done) {
      if (path.length === 0) break;

      // backtrack

      pos = path.pop() as Point;
    }
  }
  let m: Record<string, number> = {};
  for (let [name, pos] of Object.entries(dests)) {
    let dist;
    if (pos.x === src.x && pos.y === src.y) dist = 0;
    else dist = findLoc(locMap, pos);
    if (dist != undefined) {
      m[name] = dist;
    }
  }
  return m;
};

type DistMap = Record<string, Record<string, number>>;

// -2: start
// -1: end

interface Context {
  best: Record<string, number>;
}

const shortest = (
  edges: Record<string, Edge[]>,
  src: Node,
  seen: string[],
  cost: number,
  ctx: Context
): number => {
  let hash = stringify(src);
  let options = edges[hash];

  if (options == undefined) throw "Edge not found: " + hash;

  const results = options.map(e => {
    let newCost = cost + e.cost;
    if (e.node.label == "ZZ") {
      return newCost;
    }
    let nodeHash = stringify(e.node);
    if (seen.includes(nodeHash)) return Infinity;

    if (newCost >= ctx.best[nodeHash]) return Infinity;

    ctx.best[nodeHash] = newCost;
    return shortest(edges, e.node, [...seen, nodeHash], newCost, ctx);
  });
  // console.log(results);
  return Math.min(...results);
};

interface Node {
  label: string;
  level: number;
}

interface Edge {
  node: Node;
  cost: number;
}

const stringify = (node: Node): string => `${node.label}:${node.level}`;

function solve(d: Dungeon) {
  let edges: Record<string, Edge[]> = {};

  let todo: Node[] = [{ label: "AA", level: 0 }];

  let where = _.cloneDeep(d.where);
  where["AA"] = d.start;
  where["ZZ"] = d.end;
  let distances: Record<string, Record<string, number>> = {};

  for (let [label, pos] of Object.entries(where)) {
    let dests: Record<string, Point> = {};
    for (let [label2, pos2] of Object.entries(where)) {
      if (label === label2) continue;

      dests[label2] = pos2;
    }
    distances[label] = findDistances(d, pos, dests);
  }

  while (todo.length > 0) {
    let node = todo.pop() as Node;
    let hash = stringify(node);
    if (edges[hash] != undefined) continue;
    let { label, level } = node;
    let es: Edge[] = [];
    if (level + 1 <= MAX_LEVEL) {
      for (let [src, dest] of d.down) {
        let cost = distances[label][src];
        if (cost != undefined) {
          let next = { label: dest, level: level + 1 };
          es.push({ node: next, cost: cost + 1 });
          todo.push(next);
        }
      }
    }
    if (level - 1 >= 0) {
      for (let [src, dest] of d.up) {
        let cost = distances[label][src];
        if (cost != undefined) {
          let next = { label: dest, level: level - 1 };
          es.push({ node: next, cost: cost + 1 });
          todo.push(next);
        }
      }
    }

    if (level === 0) {
      let cost = distances[label]["ZZ"];
      if (cost != undefined) {
        // unreachable
        let next = { label: "ZZ", level: 0 };
        es.push({ node: next, cost });
      }
    }

    edges[hash] = es;
  }
  // console.log(JSON.stringify(distances));
  // console.log(JSON.stringify(edges, null, 2));
  let result = shortest(edges, { label: "AA", level: 0 }, [], 0, { best: {} });
  console.log("result", result);
}

function solution() {
  let d = readInput();
  // console.log(d);
  solve(d);
}

export default solution;
