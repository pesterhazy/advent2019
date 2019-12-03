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

function readCSV(fname: string): string[][] {
  return R.map(line => line.split(/,/), readLines(fname));
}

export { readLines, readCSV, map2 };
