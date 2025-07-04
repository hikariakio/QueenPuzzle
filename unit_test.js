const assert = require('assert');
const {
  generateColorRegionsNormalBFS,
  generateColorRegionsDistributedBFS
} = require('./puzzle_creator');

const ITERATIONS = 100;
const SIZE = 10;

function measure(fn) {
  const start = Date.now();
  for (let i = 0; i < ITERATIONS; i++) {
    const grid = fn(SIZE);
    assert(grid.length === SIZE);
  }
  return Date.now() - start;
}

const normal = measure(generateColorRegionsNormalBFS);
const distributed = measure(generateColorRegionsDistributedBFS);

console.log(`Normal BFS total time: ${normal}ms`);
console.log(`Distributed BFS total time: ${distributed}ms`);

