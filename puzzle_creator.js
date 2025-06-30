// Generate a grid of m x m cells with m distinct region seeds
function generateColorRegions(m) {
    let grid = Array.from({ length: m }, () => Array(m).fill(null));
    let seeds = [];
    let used = new Set();
    // Randomly generate unique seed positions
    while (seeds.length < m) {
        let r = Math.floor(Math.random() * m);
        let c = Math.floor(Math.random() * m);
        let key = `${r},${c}`;
        if (!used.has(key)) {
            used.add(key);
            seeds.push([r, c]);
        }
    }

    let queue = [];
    for (let region_id = 0; region_id < seeds.length; region_id++) {
        let [r, c] = seeds[region_id];
        grid[r][c] = region_id; // Assign region to seed
        queue.push([r, c, region_id]);
    }

    const DIRECTIONS = [
        [-1, 0], // up
        [1, 0],  // down
        [0, -1], // left
        [0, 1],  // right
    ];

    // Spread each region to fill the grid using BFS
    while (queue.length > 0) {
        let [r, c, region_id] = queue.shift();

        // Randomize direction order
        let dirs = [...DIRECTIONS];
        for (let i = dirs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [dirs[i], dirs[j]] = [dirs[j], dirs[i]];
        }

        // Expand region to valid neighboring cells
        for (const [dr, dc] of dirs) {
            let nr = r + dr, nc = c + dc;
            if (
                nr >= 0 && nr < m &&
                nc >= 0 && nc < m &&
                grid[nr][nc] === null
            ) {
                grid[nr][nc] = region_id;
                queue.push([nr, nc, region_id]);
            }
        }
    }

    return grid;
}

// Check if a queen can be safely placed at (row, col)
function isSafe(board, row, col, regions, queens, m) {
    for (const [qr, qc] of queens) {
        if (qr === row) return false;                    // same row
        if (qc === col) return false;                    // same column
        if (regions[qr][qc] === regions[row][col]) return false; // same region
        if (Math.abs(qr - row) <= 1 && Math.abs(qc - col) <= 1) return false; // adjacent cell
    }
    return true;
}

// Backtracking search to solve the puzzle
function solve(board, regions, m, row = 0, queens = [], solutions = [], maxSolutions = 2) {
    if (queens.length === m) {
        solutions.push(queens.map(q => q.slice())); // Clone queen positions more efficiently
        return;
    }
    if (solutions.length >= maxSolutions) return;

    for (let col = 0; col < m; col++) {
        if (isSafe(board, row, col, regions, queens, m)) {
            board[row][col] = 'Q';
            queens.push([row, col]);
            solve(board, regions, m, row + 1, queens, solutions, maxSolutions);
            queens.pop();
            board[row][col] = null;
        }
    }
}

// Generate a unique puzzle with exactly one solution
function generateUniquePuzzle(m) {
    let attempts = 0;
    let testBoard = Array.from({ length: m }, () => Array(m).fill(null)); // Reuse testBoard

    while (true) {
        attempts++;
        let regions = generateColorRegions(m);
        let board = Array.from({ length: m }, () => Array(m).fill(null));
        let solutions = [];

        solve(board, regions, m, 0, [], solutions, 2);

        if (solutions.length === 1) {
            let fullSolution = solutions[0];
            let clues = fullSolution.slice(); // Clone the solution

            // Shuffle the clues randomly
            for (let i = clues.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [clues[i], clues[j]] = [clues[j], clues[i]];
            }

            // Minimize clues while preserving uniqueness
            for (let idx = clues.length - 1; idx >= 0; idx--) {
                let testClues = clues.slice();
                testClues.splice(idx, 1);

                for (let r = 0; r < m; r++) {
                    for (let c = 0; c < m; c++) {
                        testBoard[r][c] = null;
                    }
                }

                for (const [qr, qc] of testClues) {
                    testBoard[qr][qc] = 'Q';
                }

                let testSolutions = [];
                solve(testBoard, regions, m, 0, [], testSolutions, 2);
                if (testSolutions.length === 1) {
                    clues.splice(idx, 1); // Remove the clue if still unique
                }
            }

            return {
                regions: regions,
                given_queens: clues,
                solution: fullSolution,
            };
        }

        if (attempts > 10000) {
            throw new Error("Failed to generate puzzle after 10000 attempts");
        }
    }
}

// Convert puzzle to human-readable string grid
function visualizePuzzle(data) {
    const regions = data.regions;
    const solution = new Set(data.solution.map(([r, c]) => `${r},${c}`));
    const m = regions.length;
    let output = [];

    for (let r = 0; r < m; r++) {
        let row = [];
        for (let c = 0; c < m; c++) {
            const region = regions[r][c];
            if (solution.has(`${r},${c}`)) {
                row.push(`Q${region}`); // Queen cell
            } else {
                row.push(`.${region}`); // Empty cell
            }
        }
        output.push(row.join(' '));
    }

    return output.join('\n');
}

module.exports = {
    generateUniquePuzzle,
    visualizePuzzle,
};
