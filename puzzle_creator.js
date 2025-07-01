// Generate a grid of m x m cells with m distinct region seeds
function generateColorRegions(m) {
    while (true) {
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

        // Validate region sizes and shapes
        const stats = Array.from({ length: m }, () => ({ rows: new Set(), cols: new Set(), count: 0 }));
        for (let r = 0; r < m; r++) {
            for (let c = 0; c < m; c++) {
                const id = grid[r][c];
                stats[id].rows.add(r);
                stats[id].cols.add(c);
                stats[id].count++;
            }
        }

        const valid = stats.every(s => s.count >= 3 && s.rows.size > 1 && s.cols.size > 1);
        if (valid) {
            return grid;
        }
        // Otherwise loop again to regenerate
    }
}

// Check if a queen can be safely placed at (row, col)
function isSafe(board, row, col, regions, columns, usedRegions, m) {
    if (columns.has(col)) return false;                  // same column
    if (usedRegions.has(regions[row][col])) return false; // same region

    // Check surrounding 8 cells for adjacency
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = row + dr;
            const nc = col + dc;
            if (nr >= 0 && nr < m && nc >= 0 && nc < m && board[nr][nc] === 'Q') {
                return false;
            }
        }
    }
    return true;
}

// Backtracking search to solve the puzzle
function solve(
    board,
    regions,
    m,
    row = 0,
    columns = new Set(),
    usedRegions = new Set(),
    queens = [],
    solutions = [],
    maxSolutions = 2
) {
    if (row === m) {
        solutions.push(queens.map(q => q.slice())); // Clone queen positions
        return;
    }
    if (solutions.length >= maxSolutions) return;

    for (let col = 0; col < m && solutions.length < maxSolutions; col++) {
        if (isSafe(board, row, col, regions, columns, usedRegions, m)) {
            board[row][col] = 'Q';
            columns.add(col);
            usedRegions.add(regions[row][col]);
            queens.push([row, col]);
            solve(board, regions, m, row + 1, columns, usedRegions, queens, solutions, maxSolutions);
            queens.pop();
            columns.delete(col);
            usedRegions.delete(regions[row][col]);
            board[row][col] = null;
        }
    }
}

// Generate a puzzle. By default a unique puzzle is produced, but when
// `requireUnique` is false the function returns the first valid solution without
// performing the expensive uniqueness checks.
function generateUniquePuzzle(m, requireUnique = true) {
    let attempts = 0;
    let testBoard = Array.from({ length: m }, () => Array(m).fill(null)); // Reuse testBoard

    while (true) {
        attempts++;
        let regions = generateColorRegions(m);
        let board = Array.from({ length: m }, () => Array(m).fill(null));
        let solutions = [];
        const maxSolutions = requireUnique ? 2 : 1;

        solve(board, regions, m, 0, new Set(), new Set(), [], solutions, maxSolutions);

        if (requireUnique ? solutions.length === 1 : solutions.length > 0) {
            let fullSolution = solutions[0];
            if (requireUnique) {
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
                    solve(testBoard, regions, m, 0, new Set(), new Set(), [], testSolutions, 2);
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

            // Fast path: return the solution without clues
            return {
                regions: regions,
                given_queens: [],
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
