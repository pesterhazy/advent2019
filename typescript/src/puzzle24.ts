import * as util from "./util";
import * as _ from "lodash";

type Maze = boolean[][];

const readInput = (): Maze =>
  util.readLines("24.txt").map(l => Array.from(l).map(ch => ch === "#"));

const step = (maze: Maze) => {
  let newMaze: Maze = _.cloneDeep(maze);

  for (let y = 0; y < maze.length; y++) {
    for (let x = 0; x < maze[0].length; x++) {
      newMaze[y][x] = maze[y][x];
    }
  }
  return newMaze;
};

const print = (maze: Maze) => {
  console.log(
    maze.map(row => row.map(b => (b ? "#" : ".")).join("")).join("\n")
  );
};

function solution() {
  let maze = readInput();
  print(maze);

  console.log();

  maze = step(maze);
  print(maze);
}

export default solution;
