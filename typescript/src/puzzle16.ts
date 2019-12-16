import * as R from "ramda";

const example = "12345678";
const example2 = "80871224585914546619083218645595";

const readInput = (): number[] => R.map(s => parseInt(s), Array.from(example));
const basePattern = [0, 1, 0, -1];

function solution() {
  let input = readInput();

  let pattern = basePattern.slice();

  let vs = input;
  let i = 3;
  let newVs = [];
  for (let i = 0; i < input.length; i++) {
    let sum = 0;
    for (let j = 0; j < input.length; j++) {
      sum += vs[j] * pattern[Math.floor((j + 1) / (i + 1)) % pattern.length];
    }
    newVs.push(Math.abs(sum) % 10);
  }
  vs = newVs;
  console.log(vs.join(""));
}

export default solution;
