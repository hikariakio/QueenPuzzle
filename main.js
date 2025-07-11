document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const DOM = {
        root: document.documentElement,
        themeToggle: document.getElementById('theme-toggle'),
        sizeSelect: document.getElementById('size'),
        generateBtn: document.getElementById('generate'),
        resetBtn: document.getElementById('reset'),
        checkBtn: document.getElementById('check'),
        gridContainer: document.getElementById('grid'),
        messageEl: document.getElementById('message'),
        loadingOverlay: document.getElementById('loading-overlay'),
        rulesBtn: document.getElementById('show-rules'),
        rulesOverlay: document.getElementById('rules-overlay'),
    };

    // --- State ---
    let state = {
        gridSize: 8,
        regions: [],
        givenQueens: [],
        userBoard: [],
    };

    // Check for "fast" query parameter to skip uniqueness checks
    const urlParams = new URLSearchParams(window.location.search);
    const fastGeneration = urlParams.get('fast') === '1' || urlParams.get('fast') === 'true';

    // --- Theming ---
    function setTheme(mode) {
        if (mode === 'dark') {
            DOM.root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            DOM.root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
        // After changing the theme, we must update the tile colors
        if (state.regions.length > 0) {
            updateTileColors();
        }
    }

    function initializeTheme() {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (savedTheme) {
            setTheme(savedTheme);
        } else if (prefersDark) {
            setTheme('dark');
        } else {
            setTheme('light');
        }
    }

    // --- Color Palette ---
    function getRegionColor(id) {
        const lightPalette = [
            "#f87171", "#f97316", "#f59e0b", "#fde047",
            "#a3e635", "#4ade80", "#22d3ee", "#60a5fa",
            "#a78bfa", "#d8b4fe", "#fb7185", "#d946ef",
            "#06b6d4"
        ];
        const darkPalette = [
            "#ef4444", "#ea580c", "#ca8a04", "#facc15",
            "#84cc16", "#22c55e", "#06b6d4", "#3b82f6",
            "#6366f1", "#a855f7", "#e11d48", "#c026d3",
            "#0e7490"
        ];
        const palette = DOM.root.classList.contains("dark") ? darkPalette : lightPalette;
        return palette[id % palette.length];
    }

    // --- UI Updates ---
    function showLoading(isLoading) {
        DOM.loadingOverlay.classList.toggle('hidden', !isLoading);
        DOM.loadingOverlay.classList.toggle('flex', isLoading);
        DOM.generateBtn.disabled = isLoading;
        DOM.resetBtn.disabled = isLoading;
        DOM.sizeSelect.disabled = isLoading;
    }

    function toggleRules() {
        DOM.rulesOverlay.classList.toggle('hidden');
    }

    function updateCheckButtonVisibility() {
        const queenCount = state.userBoard.flat().filter(cell => cell === "queen").length;
        DOM.checkBtn.classList.toggle('hidden', queenCount !== state.gridSize);
    }

    function showMessage(text, isSuccess) {
        DOM.messageEl.textContent = text;
        DOM.messageEl.className = 'text-center text-lg mt-5 font-semibold h-8'; // Reset classes
        DOM.messageEl.classList.add('show', isSuccess ? 'success' : 'error');
    }

    function clearMessage() {
        DOM.messageEl.classList.remove('show');
    }

    // --- Board Logic ---
    function clearBoard() {
        state.regions = [];
        state.givenQueens = [];
        state.userBoard = [];
        DOM.gridContainer.innerHTML = '';
        clearMessage();
        DOM.checkBtn.classList.add('hidden');
    }

    function updateTileSize() {
        const containerWidth = DOM.gridContainer.parentElement.clientWidth;
        const tile = Math.min(48, Math.floor((containerWidth - 16) / state.gridSize));
        DOM.root.style.setProperty('--tile-size', `${tile}px`);
    }

    // Draw a fine border around each color region
    function applyRegionBorders(tile, r, c) {
        const id = state.regions[r][c];
        const lastRow = state.gridSize - 1;
        const lastCol = state.gridSize - 1;

        const outline = `var(--region-border-line-width) solid var(--region-border-color)`;
        const inner = `var(--grid-line-width) dotted var(--grid-line-color)`;

        tile.style.borderLeft = (c === 0 || state.regions[r][c - 1] !== id)
            ? outline
            : inner;
        tile.style.borderTop = (r === 0 || state.regions[r - 1][c] !== id)
            ? outline
            : inner;
        tile.style.borderRight = (c === lastCol)
            ? outline
            : inner;
        tile.style.borderBottom = (r === lastRow)
            ? outline
            : inner;
    }

    function createGrid() {
        DOM.gridContainer.innerHTML = '';
        updateTileSize();
        DOM.gridContainer.style.gridTemplateColumns = `repeat(${state.gridSize}, var(--tile-size))`;
        state.userBoard = Array.from({ length: state.gridSize }, () => Array(state.gridSize).fill(''));
        state.givenQueens.forEach(([r, c]) => { state.userBoard[r][c] = 'queen'; });

        for (let r = 0; r < state.gridSize; r++) {
            for (let c = 0; c < state.gridSize; c++) {
                const tile = document.createElement('div');
                tile.className = 'tile';
                tile.style.backgroundColor = getRegionColor(state.regions[r][c]);
                tile.dataset.row = r;
                tile.dataset.col = c;

                const isGiven = state.givenQueens.some(([qr, qc]) => qr === r && qc === c);
                if (isGiven) {
                    tile.classList.add('queen', 'given-queen');
                }

                applyRegionBorders(tile, r, c);
                tile.addEventListener('click', () => handleTileClick(tile, r, c));
                DOM.gridContainer.appendChild(tile);
            }
        }
        updateCheckButtonVisibility();
    }

    function updateTileColors() {
        const tiles = DOM.gridContainer.querySelectorAll('.tile');
        tiles.forEach(tile => {
            const r = parseInt(tile.dataset.row, 10);
            const c = parseInt(tile.dataset.col, 10);
            if (state.regions[r]?.[c] !== undefined) {
                tile.style.backgroundColor = getRegionColor(state.regions[r][c]);
            }
        });
    }

    function handleTileClick(tile, r, c) {
        if (tile.classList.contains('given-queen')) return;
        clearMessage();

        const currentState = state.userBoard[r][c];
        let nextState = '';

        // Cycle through states: '' -> 'marked' -> 'queen' -> ''
        if (currentState === '') {
            nextState = 'marked';
        } else if (currentState === 'marked') {
            nextState = 'queen';
        }

        state.userBoard[r][c] = nextState;

        // Update classes based on the new state
        tile.classList.remove('marked', 'queen');
        if (nextState) {
            tile.classList.add(nextState);
        }

        updateCheckButtonVisibility();
    }

    // --- Validation ---
    function isValidSolution() {
        const queens = [];
        for (let r = 0; r < state.gridSize; r++) {
            for (let c = 0; c < state.gridSize; c++) {
                if (state.userBoard[r][c] === 'queen') queens.push([r, c]);
            }
        }
        if ( queens.length !== state.gridSize) return false;

        // Check for one queen per row, column, and region
        const rows = new Set(), cols = new Set(), regs = new Set();
        for (const [qR, qC] of queens) {
            rows.add(qR);
            cols.add(qC);
            regs.add(state.regions[qR][qC]);
        }
        if (rows.size !== state.gridSize || cols.size !== state.gridSize || regs.size !== state.gridSize) return false;

        // Check that no two queens are adjacent (including diagonals)
        for (let i = 0; i < queens.length; i++) {
            for (let j = i + 1; j < queens.length; j++) {
                const [r1, c1] = queens[i], [r2, c2] = queens[j];
                const rowDist = Math.abs(r1 - r2);
                const colDist = Math.abs(c1 - c2);
                if (rowDist <= 1 && colDist <= 1) {
                    return false; // Found adjacent queens
                }
            }
        }
        return true;
    }

    function generateNewPuzzle() {
        clearBoard();
        showLoading(true);
        // Use setTimeout to allow the UI to update and show the loader
        setTimeout(() => {
            try {
                // This function comes from puzzle_creator.js
                const requireUnique = !(fastGeneration || state.gridSize > 10);
                const puzzle = generateUniquePuzzle(state.gridSize, requireUnique);
                state.regions = puzzle.regions;
                state.givenQueens = puzzle.given_queens;
                createGrid();
            } catch (err) {
                console.error(err);
                showMessage('Failed to generate puzzle. Please try another size.', false);
            } finally {
                showLoading(false);
            }
        }, 100);
    }

    // --- Event Listeners ---
    DOM.themeToggle.addEventListener('click', () => {
        const isDark = DOM.root.classList.contains('dark');
        setTheme(isDark ? 'light' : 'dark');
    });

    DOM.sizeSelect.addEventListener('change', (e) => {
        state.gridSize = +e.target.value;
    });

    DOM.generateBtn.addEventListener('click', generateNewPuzzle);

    DOM.rulesBtn.addEventListener('click', toggleRules);
    DOM.rulesOverlay.addEventListener('click', toggleRules);

    DOM.resetBtn.addEventListener('click', () => {
        if (state.regions.length) {
            createGrid();
            clearMessage();
        }
    });

    DOM.checkBtn.addEventListener('click', () => {
        const isValid = isValidSolution();
        showMessage(
            isValid ? '✅ Excellent! Puzzle solved!' : '❌ Not quite right. Keep trying!',
            isValid
        );
    });

    // --- Initial Load ---
    initializeTheme();
    generateNewPuzzle();

});