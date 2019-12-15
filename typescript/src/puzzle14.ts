import * as R from "ramda";
import * as readlineSync from "readline-sync";
import * as util from "./util";

let example =
  "9 ORE => 2 A\n8 ORE => 3 B\n7 ORE => 5 C\n3 A, 4 B => 1 AB\n5 B, 7 C => 1 BC\n4 C, 1 A => 1 CA\n2 AB, 3 BC, 4 CA => 1 FUEL";

let example2 =
  "157 ORE => 5 NZVS\n165 ORE => 6 DCFZ\n44 XJWVT, 5 KHKGT, 1 QDVJ, 29 NZVS, 9 GPVTF, 48 HKGWZ => 1 FUEL\n12 HKGWZ, 1 GPVTF, 8 PSHF => 9 QDVJ\n179 ORE => 7 PSHF\n177 ORE => 5 HKGWZ\n7 DCFZ, 7 PSHF => 2 XJWVT\n165 ORE => 2 GPVTF\n3 DCFZ, 7 NZVS, 5 HKGWZ, 10 PSHF => 8 KHKGT";

let example3 =
  "2 VPVL, 7 FWMGM, 2 CXFTF, 11 MNCFX => 1 STKFG\n17 NVRVD, 3 JNWZP => 8 VPVL\n53 STKFG, 6 MNCFX, 46 VJHF, 81 HVMC, 68 CXFTF, 25 GNMV => 1 FUEL\n22 VJHF, 37 MNCFX => 5 FWMGM\n139 ORE => 4 NVRVD\n144 ORE => 7 JNWZP\n5 MNCFX, 7 RFSQX, 2 FWMGM, 2 VPVL, 19 CXFTF => 3 HVMC\n5 VJHF, 7 MNCFX, 9 VPVL, 37 CXFTF => 6 GNMV\n145 ORE => 6 MNCFX\n1 NVRVD => 8 CXFTF\n1 VJHF, 6 MNCFX => 4 RFSQX\n176 ORE => 6 VJHF";

let example4 =
  "171 ORE => 8 CNZTR\n7 ZLQW, 3 BMBT, 9 XCVML, 26 XMNCP, 1 WPTQ, 2 MZWV, 1 RJRHP => 4 PLWSL\n114 ORE => 4 BHXH\n14 VRPVC => 6 BMBT\n6 BHXH, 18 KTJDG, 12 WPTQ, 7 PLWSL, 31 FHTLT, 37 ZDVW => 1 FUEL\n6 WPTQ, 2 BMBT, 8 ZLQW, 18 KTJDG, 1 XMNCP, 6 MZWV, 1 RJRHP => 6 FHTLT\n15 XDBXC, 2 LTCX, 1 VRPVC => 6 ZLQW\n13 WPTQ, 10 LTCX, 3 RJRHP, 14 XMNCP, 2 MZWV, 1 ZLQW => 1 ZDVW\n5 BMBT => 4 WPTQ\n189 ORE => 9 KTJDG\n1 MZWV, 17 XDBXC, 3 XCVML => 2 XMNCP\n12 VRPVC, 27 CNZTR => 2 XDBXC\n15 KTJDG, 12 BHXH => 5 XCVML\n3 BHXH, 2 VRPVC => 7 MZWV\n121 ORE => 7 VRPVC\n7 XCVML => 6 RJRHP\n5 BHXH, 4 VRPVC => 5 LTCX";

let exampleOurs =
  "2 KBRD => 3 NSPQ\n1 TMTNM, 5 WMZD => 4 JVBK\n3 TMTNM => 8 JTPF\n3 NDXL => 2 BDQP\n2 VTGNT => 2 TNWR\n1 ZQRBC => 2 WGDN\n2 MJMC => 3 QZCZ\n10 MDXVB, 3 DHTB => 1 SRLP\n1 KBRD, 1 PNPW => 6 SQCB\n1 KDTRS, 4 VTGNT => 7 NDXL\n1 FZSJ => 1 CJPSR\n6 TKMKD => 8 FTND\n2 ZNBSN => 4 DNPT\n16 SKWKQ, 2 FZSJ, 3 GSQL, 1 PNRC, 4 QNKZW, 4 RHZR, 10 MTJF, 1 XHPK => 3 RJQW\n1 NHQW => 8 QNKZW\n16 JZFCN, 9 KWQSC, 1 JGTR => 7 TMTNM\n2 PNRC => 7 LCZD\n1 NLSNC, 14 SXKC, 2 DHTB => 1 ZQRBC\n1 MXGQ, 2 KWQPL => 3 FZSJ\n6 DWKLT, 1 VHNXW, 3 NSPQ => 1 BQXNW\n23 KDTRS => 1 XHPK\n1 PFBF, 3 KBLHZ => 3 MBGWZ\n5 NSPQ => 3 TPJP\n27 SRLP, 12 KWQSC, 14 ZNBSN, 33 HQTPN, 3 HWFQ, 23 QZCZ, 6 ZPDN, 32 RJQW, 3 GDXG => 1 FUEL\n2 NSPQ, 5 ZNBSN, 1 TPJP => 8 PFBF\n1 MSCRZ => 3 ZNBSN\n1 TNWR, 2 ZNBSN => 5 MDXVB\n10 SQCB => 5 MXGQ\n3 JVBK, 1 MTJF, 1 KBLHZ => 2 HQTPN\n2 MJMC => 2 KMLKR\n2 BQXNW, 1 CJPSR, 25 KWQPL => 4 PNRC\n1 VHNXW, 3 KWZKV => 4 TKMKD\n10 VTGNT, 4 JTPF => 9 KWZKV\n168 ORE => 3 JZFCN\n173 ORE => 5 KBRD\n2 TNWR, 1 MBGWZ, 3 NSPQ => 8 SKWKQ\n1 KWZKV, 2 MJMC, 14 SKWKQ => 9 NSTR\n4 JZFCN, 13 PNPW => 2 WMZD\n6 JQNGL => 6 MGFZ\n1 SQCB, 4 NLSNC => 5 DHTB\n5 MGFZ, 39 WGDN, 1 MBGWZ, 2 NSTR, 1 XKBND, 1 SXKC, 1 JVBK => 5 ZPDN\n7 NSPQ, 6 PNPW => 7 NLSNC\n3 TNWR => 9 KWQPL\n9 NLSNC, 4 NDXL, 1 MDXVB => 4 MTJF\n2 VTJC => 7 PNPW\n2 JZFCN => 8 MSCRZ\n134 ORE => 3 JGTR\n3 HQTPN => 4 GSQL\n154 ORE => 9 VTJC\n1 KWQSC, 14 KBRD => 4 JQCZ\n7 PNRC, 1 XKBND => 8 RHZR\n1 JQCZ => 4 VTGNT\n6 BDQP => 6 JQNGL\n7 FTND => 3 XKBND\n2 XHPK, 4 NHQW => 1 MJMC\n1 JQCZ => 5 KDTRS\n1 DNPT => 4 KBLHZ\n1 KMLKR, 26 ZNBSN, 1 LCZD, 11 QNKZW, 2 SQCB, 3 FTND, 24 PNRC => 4 HWFQ\n179 ORE => 6 KWQSC\n2 TKMKD, 3 FZSJ => 2 SXKC\n2 JTPF => 7 VHNXW\n1 FTND => 7 DWKLT\n13 TNWR, 2 QNKZW, 6 SQCB => 5 GDXG\n5 JTPF, 4 ZNBSN, 8 WMZD => 8 NHQW";

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

const solve = (input: Record<string, Recipe>, o: Record<string, number>) => {
  let w: Record<string, number> = {};
  while (true) {
    console.log("o");
    console.log(o);
    let done = true;
    for (const [mat, qty] of Object.entries(o)) {
      let recipe = input[mat];
      if (!recipe) continue;
      let n = Math.ceil(qty / recipe.qty);
      let remainder = qty % recipe.qty;

      if (remainder > 0) {
        let left = recipe.qty - remainder;
        w[mat] = w[mat] || 0;
        w[mat] += left;
      }

      for (const ingredient of recipe.ingredients) {
        w[ingredient.mat] = w[ingredient.mat] || 0;
        let v = ingredient.qty * n;
        let s = Math.min(w[ingredient.mat], v);
        w[ingredient.mat] -= s;
        v -= s;
        o[ingredient.mat] = o[ingredient.mat] || 0;
        o[ingredient.mat] += v;
      }
      delete o[mat];
      done = false;
      break;
    }
    if (done) break;
  }
};

function solution() {
  let input = readInput();
  console.log(solve(input, { FUEL: 1 }));
}

export default solution;
