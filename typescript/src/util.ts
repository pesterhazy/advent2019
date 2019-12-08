import { readFileSync } from "fs";
import * as R from "ramda";

function readLines(fname: string): string[] {
  const file = readFileSync("../inputs/" + fname, "utf-8");
  return R.filter((s: string) => {
    return !R.isEmpty(s);
  }, file.split(/\n/));
}

const map2 = (f: (v: any) => any, a: any[][]) => R.map(b => R.map(f, b), a);

/**
 * Returns rows of columns
 */

function readCSV(fname: string, sep: RegExp = /,/): string[][] {
  return R.map(line => line.split(sep), readLines(fname));
}

function readCSVString(str: string, sep: RegExp = /,/): string[][] {
  return R.map(line => line.split(sep), str.split(/\n/));
}

// thanks StackOverflow

function permute(permutation: any[]) {
  var length = permutation.length,
  result = [permutation.slice()],
  c = new Array(length).fill(0),
  i = 1, k, p;

  while (i < length) {
    if (c[i] < i) {
      k = i % 2 && c[i];
      p = permutation[i];
      permutation[i] = permutation[k];
      permutation[k] = p;
      ++c[i];
      i = 1;
      result.push(permutation.slice());
    } else {
      c[i] = 0;
      ++i;
    }
  }
  return result;
}

const minListBy = (f: any, xs: any[]) => {
  let a = R.reduce(
    (a: any, b: any): any => R.minBy(v => v[0], a, b),
    [Infinity, undefined],
    R.map(x => [f(x), x], xs)
  );

  if (a[0] == undefined) throw new Error("Invariant violation");
  return a[1];
};

const maxListBy = (f: any, xs: any[]) => {
  let a = R.reduce(
    (a: any, b: any): any => R.maxBy(v => v[0], a, b),
    [-Infinity, undefined],
    R.map(x => [f(x), x], xs)
  );

  if (a[0] == undefined) throw new Error("Invariant violation");
  return a[1];
};

export { readLines, readCSV, readCSVString, map2, permute,
         minListBy, maxListBy };
