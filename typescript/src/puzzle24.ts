import * as util from "./util";
import * as _ from "lodash";

type Maze = boolean[][];
type Tower = Map<number, Maze>;

const readInput = (): Maze =>
  util.readLines("24-1.txt").map(l => Array.from(l).map(ch => ch === "#"));

const neighbors: [number, number][] = [
  [-1, 0],
  [1, 0],
  [0, 1],
  [0, -1]
];

interface Coord {
  x: number;
  y: number;
  level: number;
}

const SIZE = 5;
const CENTER = 2;

const findNeighbors = ({ x, y, level }: Coord): Coord[] =>
  neighbors.flatMap(([dx, dy]) => {
    let nx = x + dx;
    let ny = y + dy;

    if (nx >= SIZE) return [{ level: level - 1, x: CENTER + 1, y: CENTER }];
    if (ny >= SIZE) return [{ level: level - 1, x: CENTER, y: CENTER + 1 }];
    if (nx < 0) return [{ level: level - 1, x: CENTER - 1, y: CENTER }];
    if (ny < 0) return [{ level: level - 1, x: CENTER, y: CENTER - 1 }];

    if (nx === CENTER && ny === CENTER) {
      return _.range(SIZE).map(i => {
        if (dx > 0) return { level: level + 1, x: 0, y: i };
        if (dx < 0) return { level: level + 1, x: SIZE - 1, y: i };
        if (dy > 0) return { level: level + 1, x: i, y: 0 };
        if (dy < 0) return { level: level + 1, x: i, y: SIZE - 1 };
        throw "unreachable";
      });
    }
    return [{ x: x + dx, y: y + dy, level }];
  });

const peek = (tower: Tower, { x, y, level }: Coord): boolean => {
  let maze = tower.get(level);
  if (!maze) {
    return false;
  }
  if (x < 0 || y < 0 || x >= maze[0].length || y >= maze.length)
    throw "Out of bounds";
  if (x === 2 && y === 2) throw "Out of bounds: center";
  return maze[y][x];
};

const step = (tower: Tower) => {
  let newTower = new Map();

  let levels = Array.from(tower.keys());
  let minLevel = Math.min(...levels) - 1;
  let maxLevel = Math.max(...levels) + 1;

  for (let level = minLevel; level <= maxLevel; level++) {
    let newMaze: Maze = new Array(SIZE)
      .fill(false)
      .map(() => new Array(SIZE).fill(false));

    let isEmpty = true;
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        if (y === 2 && x === 2) continue; // FIXME

        let n = findNeighbors({ x, y, level })
          .map((coord: Coord) => {
            return peek(tower, coord);
          })
          .reduce(
            (acc: number, b: boolean | undefined): number =>
              b ? acc + 1 : acc,
            0
          );
        let newv: boolean;
        if (peek(tower, { x, y, level })) newv = n === 1;
        else newv = n === 1 || n === 2;
        newMaze[y][x] = newv;

        if (newv) isEmpty = false;
      }
    }
    if (!isEmpty) newTower.set(level, newMaze);
  }

  return newTower;
};

const print = (maze: Maze) => {
  console.log(
    maze.map(row => row.map(b => (b ? "#" : ".")).join("")).join("\n")
  );
};

const count = (tower: Tower) => {
  let result = 0;
  for (let maze of tower.values()) {
    for (let y = 0; y < maze.length; y++) {
      for (let x = 0; x < maze[0].length; x++) {
        result += maze[y][x] ? 1 : 0;
      }
    }
  }
  return result;
};

const NUM_ITERATIONS = 10;

function solution() {
  let tower: Tower = new Map();
  tower.set(0, readInput());

  for (let i = 0; i < NUM_ITERATIONS; i++) {
    console.log("levels:", Array.from(tower.keys()));
    let n = count(tower);
    console.log("count:", n);

    tower = step(tower);
  }
}

export default solution;
