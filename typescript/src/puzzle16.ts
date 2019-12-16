import * as R from "ramda";
import { performance } from "perf_hooks";

const example = "12345678";
const example2 = "80871224585914546619083218645595";
const exampleOurs =
  "59758034323742284979562302567188059299994912382665665642838883745982029056376663436508823581366924333715600017551568562558429576180672045533950505975691099771937719816036746551442321193912312169741318691856211013074397344457854784758130321667776862471401531789634126843370279186945621597012426944937230330233464053506510141241904155782847336539673866875764558260690223994721394144728780319578298145328345914839568238002359693873874318334948461885586664697152894541318898569630928429305464745641599948619110150923544454316910363268172732923554361048379061622935009089396894630658539536284162963303290768551107950942989042863293547237058600513191659935";

const readInput = (): number[] =>
  R.map(s => parseInt(s), Array.from(exampleOurs));

const transform = (vs: number[]): number[] => {
  let len = vs.length;
  let newVs = new Array(len);
  for (let i = 0; i < len; i++) {
    let idx = 0,
      n = 0;
    const next = () => {
      n++;
      if (n === i + 1) {
        n = 0;
        idx++;
        if (idx === 4) idx = 0;
      }
    };
    next(); // skip first
    let sum = 0;
    for (let j = 0; j < len; j++) {
      if (idx === 1) sum += vs[j];
      else if (idx === 3) sum -= vs[j];
      next();
    }
    newVs[i] = Math.abs(sum) % 10;
  }
  return newVs;
};

function calc(input: number[], nPhases: number, repeat: number) {
  let vs = [];
  for (let i = 0; i < repeat; i++) {
    for (let ch of input) {
      vs.push(ch);
    }
  }

  var t0 = performance.now();
  for (let phase = 0; phase < nPhases; phase++) {
    vs = transform(vs);
  }
  var t1 = performance.now();
  let result = vs.slice(0, 8).join("");
  console.log("timing", t1 - t0);
  return result;
}

function solution() {
  let input = readInput();
  let nPhases = 100;

  for (let i = 0; i < 10; i++) {
    let result = calc(input, nPhases, 1);
    if (result !== "30379585") throw new Error("Unexpected result");
  }

  calc(input, nPhases, 3);

  return;

  {
    let offset = parseInt(input.slice(0, 7).join(""));

    let vs = [];
    for (let i = 0; i < 1000; i++) {
      for (let ch of input) {
        vs.push(ch);
      }
    }

    for (let phase = 0; phase < nPhases; phase++) {
      vs = transform(vs);
      console.log(phase);
    }
    console.log(vs.slice(offset, offset + 8).join(""));
  }
}

export default solution;
