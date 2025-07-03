# The Queen's Puzzle
A special variant of N-Queen Puzzle. You can play the live version here:
<https://yginnovatory.com/queenpuzzle/>

## How to Play

1. Place exactly one queen in each row of the grid.
2. Place exactly one queen in each column.
3. Each colored region must contain exactly one queen.
4. No two queens may touch each other, even diagonally.

Tap once on a tile to mark it with an `X`. Tap again to place a queen, and a third tap clears the tile.

# Codebase Overview

This repository implements a web-based puzzle generator and game for a custom N-Queens variant. Below is a high-level summary of the main pieces of the project.

## Project Layout

```
├── index.html                  # Web page entry point
├── style.css                   # CSS rules (theme + tile styles)
├── main.js                     # Browser logic (UI + validation)
├── puzzle_creator.js           # Puzzle generation algorithm
├── puzzle_client.js            # CLI wrapper around puzzle generation
├── python_variant_deprecated/  # Old Python version of algorithm
└── README.md
```

### README
The repository is briefly described as "A special variant of N-Queen Puzzle." For a more detailed explanation, see this document.

## Key Components

### Puzzle Generation (`puzzle_creator.js`)
- Region generation using `generateColorRegions(m)`.
- The BFS ensures every region contains at least three tiles and spans
  more than one row and column.
- Solution search and validation (`isSafe()` and `solve()`).
  The solver now tracks used columns and regions with `Set`s and only checks
  the 3×3 neighborhood for adjacency, significantly speeding up searches.
- `generateUniquePuzzle(m, requireUnique = true)` generates a puzzle. When `requireUnique` is `false` it skips uniqueness checks for faster generation.
- `visualizePuzzle()` produces a text grid view of a puzzle.

### Browser UI (`main.js`)
- Handles puzzle state, board interaction and theme updates.
- Provides buttons for generating, resetting and checking puzzles.

### HTML & Styling
- `index.html` sets up the page and loads Tailwind CSS for styling.
- `style.css` defines light/dark themes, button styles and tile visuals.

### CLI Usage
- `puzzle_client.js` exposes `generateUniquePuzzle()` from Node.
- Call `node puzzle_client.js [grid_size] [save] [fast]` where the optional `fast` flag skips the uniqueness check.
- Can save puzzles as JSON and text via command-line flags.

### Python Prototype
- `python_variant_deprecated/` contains an earlier Python version of the algorithm for reference.

## Notes for New Contributors

1. Puzzle generation is computationally intensive for large boards, so be mindful of the 10,000 attempt limit.
2. The browser code relies solely on vanilla JavaScript and Tailwind CSS.
3. Theme colors are controlled in `style.css` and `getRegionColor()` inside `main.js`.
4. The grid outline colors can be customized via the CSS variables
   `--region-border-color` and `--grid-line-color` in `style.css`.
5. The core puzzle logic resides in `isSafe()` and `isValidSolution()`; start there when modifying the puzzle rules.

