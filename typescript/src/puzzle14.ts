import * as R from "ramda";
import * as readlineSync from "readline-sync";
import * as util from "./util";

let example =
  "9 ORE => 2 A\n8 ORE => 3 B\n7 ORE => 5 C\n3 A, 4 B => 1 AB\n5 B, 7 C => 1 BC\n4 C, 1 A => 1 CA\n2 AB, 3 BC, 4 CA => 1 FUEL";

let example2 =
  "157 ORE => 5 NZVS\n165 ORE => 6 DCFZ\n44 XJWVT, 5 KHKGT, 1 QDVJ, 29 NZVS, 9 GPVTF, 48 HKGWZ => 1 FUEL\n12 HKGWZ, 1 GPVTF, 8 PSHF => 9 QDVJ\n179 ORE => 7 PSHF\n177 ORE => 5 HKGWZ\n7 DCFZ, 7 PSHF => 2 XJWVT\n165 ORE => 2 GPVTF\n3 DCFZ, 7 NZVS, 5 HKGWZ, 10 PSHF => 8 KHKGT";

let example3 =
  "171 ORE => 8 CNZTR\n7 ZLQW, 3 BMBT, 9 XCVML, 26 XMNCP, 1 WPTQ, 2 MZWV, 1 RJRHP => 4 PLWSL\n114 ORE => 4 BHXH\n14 VRPVC => 6 BMBT\n6 BHXH, 18 KTJDG, 12 WPTQ, 7 PLWSL, 31 FHTLT, 37 ZDVW => 1 FUEL\n6 WPTQ, 2 BMBT, 8 ZLQW, 18 KTJDG, 1 XMNCP, 6 MZWV, 1 RJRHP => 6 FHTLT\n15 XDBXC, 2 LTCX, 1 VRPVC => 6 ZLQW\n13 WPTQ, 10 LTCX, 3 RJRHP, 14 XMNCP, 2 MZWV, 1 ZLQW => 1 ZDVW\n5 BMBT => 4 WPTQ\n189 ORE => 9 KTJDG\n1 MZWV, 17 XDBXC, 3 XCVML => 2 XMNCP\n12 VRPVC, 27 CNZTR => 2 XDBXC\n15 KTJDG, 12 BHXH => 5 XCVML\n3 BHXH, 2 VRPVC => 7 MZWV\n121 ORE => 7 VRPVC\n7 XCVML => 6 RJRHP\n5 BHXH, 4 VRPVC => 5 LTCX";

interface Recipe {
  qty: number;
  ingredients: any[];
}

interface Term {
  qty: number;
  mat: string;
}

const readInput = (): Record<string, Recipe> => {
  const lines = example3.split(/\n/);
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

interface Ctx {
  min: number;
}

function solve(input: Record<string, Recipe>, terms: Term[], ctx: Ctx): number {
  terms = expand(input, terms);
  let candidates = [];
  for (let [idx, term] of terms.entries()) {
    let resource = input[term.mat];
    if (!resource) {
      continue;
    }
    // new Terms without current one
    let newTerms = terms.slice(0, idx).concat(terms.slice(idx + 1));

    let ratio = Math.ceil(term.qty / resource.qty);
    for (let ingredient of resource.ingredients) {
      newTerms.push({ qty: ingredient.qty * ratio, mat: ingredient.mat });
    }
    candidates.push(simplify(newTerms));
  }
  if (candidates.length === 0) {
    // Nothing left to expand
    if (terms.length !== 1) throw new Error("Expected single entry");

    return terms[0].qty;
  }

  let min = Infinity;

  for (let candidate of candidates) {
    let v = solve(input, candidate, ctx);

    if (v < min) {
      min = v;
      if (v < ctx.min) {
        console.log("New minimum", v);
        ctx.min = v;
      }
    }
  }
  return min;
}

function solution() {
  let input = readInput();
  console.log(solve(input, [{ qty: 1, mat: "FUEL" }], { min: Infinity }));
}

export default solution;
