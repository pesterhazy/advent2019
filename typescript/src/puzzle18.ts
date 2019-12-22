import * as util from "./util";
import * as _ from "lodash";

interface Dungeon {
  lines: string[];
  width: number;
  height: number;
  keys: Record<string, Point>;
  doors: Record<string, Point>;
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

const readInput = (): Dungeon => {
  let lines = util.readLines("18-2.txt");
  let doors: Record<string, Point> = {};
  let keys: Record<string, Point> = {};
  for (let y = 0; y < lines.length; y++) {
    for (let x = 0; x < lines[0].length; x++) {
      if (lines[y][x].match(/[a-z]/)) {
        keys[lines[y][x]] = { x, y };
      } else if (lines[y][x].match(/[A-Z]/)) {
        doors[lines[y][x]] = { x, y };
      }
    }
  }
  return { lines, width: lines[0].length, height: lines.length, keys, doors };
};

const peek = (d: Dungeon, { x, y }: Point): string => {
  if (x < 0 || y < 0 || x >= d.width || y >= d.height)
    throw new Error("Out of bounds");
  else return d.lines[y][x];
};

const findInit = (d: Dungeon): Point => {
  for (let y = 0; y < d.height; y++) {
    for (let x = 0; x < d.width; x++) {
      if (["@"].includes(peek(d, { x, y }))) return { x, y };
    }
  }
  throw new Error("Not found");
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

const fill = (d: Dungeon, init: Point, collected: Set<string>) => {
  let pos = init;
  let locMap: LocMap = {};
  let path: Point[] = [];

  while (true) {
    let done = true;
    for (let dir of DIRECTIONS) {
      let next = { x: pos.x + DELTA[dir].x, y: pos.y + DELTA[dir].y };

      let loc = findLoc(locMap, next);
      if (loc != undefined && path.length + 1 >= loc) {
        continue;
      }

      let v = peek(d, next);
      if (v === "#" || (v.match(/[A-Z]/) && !collected.has(v.toLowerCase()))) {
        continue;
      }

      // go there
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
  return locMap;
};

const solve = (
  d: Dungeon,
  pos: Point,
  travelled: number,
  collected: Set<string>
): number => {
  let locMap = fill(d, pos, collected);

  let todo = Object.entries(d.keys).filter(([name, _]) => !collected.has(name));
  console.log("TODO", todo);
  if (todo.length === 0) {
    console.log("FOUND", travelled);
    return travelled;
  }

  let candidates = todo.filter(([_name, p]) => findLoc(locMap, p) != undefined);

  if (candidates.length === 0) throw new Error("Unreachable keys");

  let results = [];
  for (let [name, p] of candidates) {
    let newCollected = new Set(collected);
    newCollected.add(name);
    let distance = findLoc(locMap, p);
    if (distance == undefined) throw new Error("Impossible");
    console.log("trying %j, distance %j", name, distance);
    results.push(solve(d, pos, travelled + distance, newCollected));
  }
  return Math.min(...results);
};

function solution() {
  let d = readInput();
  console.log(d);
  for (let l of d.lines) console.log(l);

  let travelled = solve(d, findInit(d), 0, new Set());

  console.log("travelled", travelled);
}

export default solution;
