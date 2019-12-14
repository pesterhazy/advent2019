import * as R from "ramda";
import * as readlineSync from "readline-sync";
import * as util from "./util";

let example =
  "9 ORE => 2 A\n8 ORE => 3 B\n7 ORE => 5 C\n3 A, 4 B => 1 AB\n5 B, 7 C => 1 BC\n4 C, 1 A => 1 CA\n2 AB, 3 BC, 4 CA => 1 FUEL";

interface Recipe {
  qty: number;
  ingredients: any[];
}

const readInput = (): Record<string, Recipe> => {
  const lines = example.split(/\n/);
  if (!lines) throw new Error("Not found");
  return R.fromPairs(
    R.map((line: string) => {
      let matches = line.match(/(-?\d+|[A-Za-z]+)/g);
      if (!matches) throw new Error("Not found");
      let xs: string[][] = R.splitEvery(2, matches);
      let ingredients = R.map(
        ([qty, mat]): any => ({ qty: parseInt(qty), mat: mat }),
        R.init(xs)
      );
      let [qty, mat] = R.last(xs) as [string, string];
      return [mat, { qty: parseInt(qty), ingredients: ingredients }];
    }, lines)
  );
};

function solution() {
  let input = readInput();
  console.log(JSON.stringify(input, null, 4));
}

export default solution;
