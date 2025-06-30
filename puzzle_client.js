// queen_cli.js
// Usage: node queen_cli.js [grid_size] [save]

const fs = require('fs');
const { generateUniquePuzzle, visualizePuzzle } = require('./puzzle_creator');

const m = parseInt(process.argv[2]) || 8;
const shouldSave = process.argv[3] === 'true';

const outputFile = 'queen_puzzle.json';
const resultFile = 'queen_puzzle_result.txt';
const startTime = Date.now();

try {
    const puzzle = generateUniquePuzzle(m);
    const elapsed = (Date.now() - startTime) / 1000;

    const viz = `Time taken: ${elapsed.toFixed(2)} seconds\n\n` + visualizePuzzle(puzzle);

    if (shouldSave) {
        fs.writeFileSync(outputFile, JSON.stringify(puzzle, null, 2));
        fs.writeFileSync(resultFile, viz);
        console.log(`Saved to ${outputFile} and ${resultFile}`);
    }

    console.log(viz);
} catch (err) {
    console.error("Error:", err.message);
}
