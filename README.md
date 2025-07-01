# QueenPuzzle

QueenPuzzle is a web-based implementation of a custom N-Queens puzzle. Each puzzle
splits the chessboard into randomly colored regions. A valid solution places one
queen in every row, column, and region without any two queens touching
horizontally or vertically. The generator searches for boards that have a unique
solution using the minimal number of pre-placed queens.

You can play the latest version online at
[https://yginnovatory.com/queenpuzzle/](https://yginnovatory.com/queenpuzzle/).

## Repository Layout

```
├── index.html               # Web page entry point
├── style.css                # Light/dark theme and tile styles
├── main.js                  # Browser logic and validation
├── puzzle_creator.js        # Puzzle generation algorithm
├── puzzle_client.js         # Node CLI wrapper around the generator
├── python_variant_deprecated/  # Early Python prototype of the algorithm
└── README.md
```

### Browser Application
The HTML/JS/CSS files provide a lightweight user interface with no external
frameworks. Buttons allow players to generate a new puzzle, reset the board,
check their solution, and switch between light and dark themes. Board size can
also be adjusted.

### Puzzle Generator
`puzzle_creator.js` contains the main algorithm. It creates colored regions, runs
an N-Queens backtracking solver and trims clues until the puzzle has a unique
solution. Both the browser and the command line client rely on this module.

### Command Line Client
`puzzle_client.js` can be run with Node.js to generate a puzzle offline:

```bash
node puzzle_client.js [grid_size] [save]
```

Passing `true` for `save` writes the puzzle to `queen_puzzle.json` and a text
representation to `queen_puzzle_result.txt`.

### Python Prototype
The `python_variant_deprecated` directory contains a simple Python
implementation of the same idea. It served as an initial prototype and is kept
for reference.

## Contributing
Puzzles for large boards can be computationally expensive to generate due to the
uniqueness requirement. When modifying the generator logic, pay close attention
to the `isSafe` function and the backtracking solver in `puzzle_creator.js`.

Feel free to open issues or pull requests with improvements. Enjoy solving!
