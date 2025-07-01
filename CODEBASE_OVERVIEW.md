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
- Solution search and validation (`isSafe()` and `solve()`).
- `generateUniquePuzzle(m)` ensures a single solution and limits retries to 10,000 attempts.
- `visualizePuzzle()` produces a text grid view of a puzzle.

### Browser UI (`main.js`)
- Handles puzzle state, board interaction and theme updates.
- Provides buttons for generating, resetting and checking puzzles.

### HTML & Styling
- `index.html` sets up the page and loads Tailwind CSS for styling.
- `style.css` defines light/dark themes, button styles and tile visuals.

### CLI Usage
- `puzzle_client.js` exposes `generateUniquePuzzle()` from Node.
- Can save puzzles as JSON and text via command-line flags.

### Python Prototype
- `python_variant_deprecated/` contains an earlier Python version of the algorithm for reference.

## Notes for New Contributors

1. Puzzle generation is computationally intensive for large boards, so be mindful of the 10,000 attempt limit.
2. The browser code relies solely on vanilla JavaScript and Tailwind CSS.
3. Theme colors are controlled in `style.css` and `getRegionColor()` inside `main.js`.
4. The core puzzle logic resides in `isSafe()` and `isValidSolution()`; start there when modifying the puzzle rules.

