import * as R from "ramda";
import * as readlineSync from "readline-sync";
import * as util from "./util";

let example =
  "9 ORE => 2 A\n8 ORE => 3 B\n7 ORE => 5 C\n3 A, 4 B => 1 AB\n5 B, 7 C => 1 BC\n4 C, 1 A => 1 CA\n2 AB, 3 BC, 4 CA => 1 FUEL";

interface Recipe {
  qty: number;
  ingredients: any[];
}

interface Term {
  qty: number;
  mat: string;
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

function simplify(terms: Term[]) {
  let materials: Record<string, number> = {};
  for (let term of terms) {
    materials[term.mat] = (materials[term.mat] || 0) + term.qty;
  }
  let result: Term[] = [];
  for (let mat in materials) result.push({ mat: mat, qty: materials[mat] });
  return result;
}

function expand(input: Record<string, Recipe>, terms: Term[]) {
  let done = false;
  while (true) {
    done = true;
    terms = simplify(terms);
    // console.log(terms);
    let newTerms: Term[] = [];
    for (let term of terms) {
      let resource = input[term.mat];

      if (resource) {
        let ratio = Math.floor(term.qty / resource.qty);
        let remainder = term.qty % resource.qty;
        if (remainder !== 0) {
          newTerms.push({ qty: remainder, mat: term.mat });
        }

        if (ratio >= 1) {
          for (let ingredient of resource.ingredients) {
            newTerms.push({ qty: ingredient.qty * ratio, mat: ingredient.mat });
          }
          done = false;
        }
      } else {
        newTerms.push(term);
      }
    }
    terms = newTerms;
    if (done) return terms;
  }
}

function solution() {
  let input = readInput();
  console.log(JSON.stringify(input, null, 4));
  // FUEL
  // => ORE

  let terms = [{ qty: 1, mat: "FUEL" }];

  terms = expand(input, terms);
  console.log(terms);
  let newTerms = [];
  for (let term of terms) {
    let resource = input[term.mat];
    if (!resource) {
      newTerms.push(term);
    } else {
      let ratio = Math.ceil(term.qty / resource.qty);
      for (let ingredient of resource.ingredients) {
        newTerms.push({ qty: ingredient.qty * ratio, mat: ingredient.mat });
      }
    }
  }
  terms = newTerms;
  terms = simplify(terms);

  console.log(terms);
}

export default solution;
