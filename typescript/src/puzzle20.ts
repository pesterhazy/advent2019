import * as util from "./util";
import * as _ from "lodash";

type Portal = [Point, Point];

interface Dungeon {
  lines: string[];
  width: number;
  height: number;
  start: Point;
  end: Point;
  portals: Portal[];
  teleports: Record<number, Record<number, Point>>;
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
  let lines = util.readLines("20-1.txt");
  let labels: Record<string, Point[]> = {};
  let portals: Portal[] = [];
  let teleports: Record<number, Record<number, Point>> = {};

  let d: Dungeon = {
    lines,
    width: lines[0].length,
    height: lines.length,
    start: { x: -1, y: -1 },
    end: { x: -1, y: -1 },
    teleports: {},
    portals: []
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
        labels[l].push(r2.p);
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

    portals.push([a, b]);
    portals.push([b, a]);

    teleports[a.x] = teleports[a.x] || {};
    teleports[a.x][a.y] = b;
    teleports[b.x] = teleports[b.x] || {};
    teleports[b.x][b.y] = a;
  }
  d.teleports = teleports;
  d.portals = portals;

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

const findDistances = (d: Dungeon, src: Point): Record<number, number> => {
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
    if (
      d.teleports[pos.x] != undefined &&
      d.teleports[pos.x][pos.y] != undefined
    ) {
      options.push(d.teleports[pos.x][pos.y]);
    }
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
  let m: Record<number, number> = {};
  for (let [idx, [a, b]] of d.portals.entries()) {
    if (a.x === src.x && a.y === src.y) continue;
    let dist = findLoc(locMap, a);
    if (dist != undefined) {
      m[idx] = dist;
    }
  }

  {
    let dist = findLoc(locMap, d.end);
    if (dist != undefined) {
      m[-1] = dist;
    }
  }
  return m;
};

type DistMap = Record<number, Record<number, number>>;

// -2: start
// -1: end

const shortest = (
  distances: DistMap,
  src: number,
  dest: number,
  seen: number[],
  dists: number[]
): number => {
  let options = distances[src];

  const results = Object.entries(options).map(([hopStr, dist]) => {
    let hop = parseInt(hopStr);
    if (hop === -1) {
      // console.log("->", [...seen, hop], [...dists, dist]);
      return dist;
    }
    if (seen.includes(hop)) return Infinity;
    return (
      dist + shortest(distances, hop, dest, [...seen, hop], [...dists, dist])
    );
  });
  // console.log(results);
  return Math.min(...results);
};

function solve(d: Dungeon) {
  let distances: DistMap = {};
  for (let idx of [-2, ..._.range(d.portals.length)]) {
    let p;
    if (idx === -2) p = d.start;
    else p = d.portals[idx][0];

    distances[idx] = findDistances(d, p);
  }

  let dist = shortest(distances, -2, -1, [], []);

  console.log("dist", dist);
}

function solution() {
  let d = readInput();
  console.log(d);
  console.log("%j", d.portals);
  solve(d);
}

export default solution;
