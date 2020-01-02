import * as util from "./util";
import * as _ from "lodash";

type Maze = boolean[][];

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

const step = (maze: Maze) => {
  let newMaze: Maze = _.cloneDeep(maze);

  for (let y = 0; y < maze.length; y++) {
    for (let x = 0; x < maze[0].length; x++) {
      let n = neighbors
        .map(([dx, dy]) => peek(maze, x + dx, y + dy))
        .reduce(
          (acc: number, b: boolean | undefined): number => (b ? acc + 1 : acc),
          0
        );
      if (maze[y][x]) newMaze[y][x] = n === 1;
      else newMaze[y][x] = n === 1 || n === 2;
    }
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
  let maze = readInput();
  let seen = new Set();

  while (true) {
    print(maze);
    let h = hash(maze);
    console.log("=>", h);

    if (seen.has(h)) break;
    seen.add(h);

    maze = step(maze);
  }
}

export default solution;
