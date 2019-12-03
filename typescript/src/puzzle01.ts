import * as R from "ramda";
import * as util from "./util";

const fuel = (mass: number) => Math.floor(mass / 3.0) - 2;

const fuelPlus = (mass: number): number => {
  let result = Math.floor(mass / 3.0) - 2;
  if (result <= 0) return result;
  else return result + fuelPlus(result);
};

function solution() {
  let ns = R.map(parseInt, util.readLines("1.txt"));

  let result = R.reduce((x: number, y: number) => x + y, 0, R.map(fuel, ns));
  console.log("solution1:", result);

  let result2 = R.reduce(
    (x: number, y: number) => x + y,
    0,
    R.map(fuelPlus, ns)
  );
  console.log("solution2:", result2);
}

export default solution;
