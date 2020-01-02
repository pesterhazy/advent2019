import * as util from "./util";
import * as _ from "lodash";

type Maze = boolean[][];
type Tower = Map<number, Maze>;

const readInput = (): Maze =>
  util.readLines("24.txt").map(l => Array.from(l).map(ch => ch === "#"));

const neighbors: [number, number][] = [
  [-1, 0],
  [1, 0],
  [0, 1],
  [0, -1]
];

const peek = (maze: Maze, x: number, y: number): boolean | undefined => {
  if (x < 0 || y < 0 || x >= maze[0].length || y >= maze.length)
    return undefined;
  else return maze[y][x];
};

const step = (tower: Tower) => {
  let newTower = new Map();

  let q = [0];

  while (q.length > 0) {
    let level = q.shift()!;
    const maze: Maze | undefined = tower.get(level);
    if (maze == undefined) {
      throw "Maze not found";
    } else {
      let newMaze: Maze = _.cloneDeep(maze);

      for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[0].length; x++) {
          if (y === 2 && x === 2) continue;

          // FIXME: update peek

          let n = neighbors
            .map(([dx, dy]) => peek(maze, x + dx, y + dy))
            .reduce(
              (acc: number, b: boolean | undefined): number =>
                b ? acc + 1 : acc,
              0
            );
          if (maze[y][x]) newMaze[y][x] = n === 1;
          else newMaze[y][x] = n === 1 || n === 2;
        }
      }
    }
    // FIXME: add to newTower
    // FIXME: consider 4 outer neighbors
    // FIXME: consider inner neighbor
  }

  return newMaze;
};

const print = (maze: Maze) => {
  console.log(
    maze.map(row => row.map(b => (b ? "#" : ".")).join("")).join("\n")
  );
};

const hash = (maze: Maze) => {
  let m = 1;
  let result = 0;
  for (let y = 0; y < maze.length; y++) {
    for (let x = 0; x < maze[0].length; x++) {
      result += maze[y][x] ? m : 0;
      m *= 2;
    }
  }
  return result;
};

function solution() {
  let tower: Tower = new Map();
  tower.set(0, readInput());

  // let seen = new Set();

  // while (true) {
  //   print(maze);
  //   let h = hash(maze);
  //   console.log("=>", h);

  //   if (seen.has(h)) break;
  //   seen.add(h);

  //   maze = step(maze);
  // }
}

export default solution;
