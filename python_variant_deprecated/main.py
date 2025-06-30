import random
from collections import deque
import json
import time

# -----------------------------
# Configuration
# -----------------------------
m = 8 # Grid size (m x m)
output_file = "queen_puzzle.json"
result_file = "queen_puzzle_result.txt"

# -----------------------------
# Constants
# -----------------------------
DIRECTIONS = [(-1,0), (1,0), (0,-1), (0,1)]  # Orthogonal only
ALL_DIRECTIONS = [(-1,-1), (-1,0), (-1,1), (0,-1), (0,1), (1,-1), (1,0), (1,1)]

# -----------------------------
# Step 1: Generate color regions
# -----------------------------
def generate_color_regions(m):
    grid = [[None for _ in range(m)] for _ in range(m)]
    seeds = set()
    while len(seeds) < m:
        seeds.add((random.randint(0, m - 1), random.randint(0, m - 1)))
    seeds = list(seeds)

    queue = deque()
    for region_id, (r, c) in enumerate(seeds):
        grid[r][c] = region_id
        queue.append((r, c, region_id))

    while queue:
        r, c, region_id = queue.popleft()
        for dr, dc in random.sample(DIRECTIONS, len(DIRECTIONS)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < m and 0 <= nc < m and grid[nr][nc] is None:
                grid[nr][nc] = region_id
                queue.append((nr, nc, region_id))

    return grid

# -----------------------------
# Step 2: Queen placement validation
# -----------------------------
def is_safe(board, row, col, regions, queens, m):
    if any(qr == row for qr, _ in queens):
        return False
    if any(qc == col for _, qc in queens):
        return False
    if any(regions[qr][qc] == regions[row][col] for qr, qc in queens):
        return False
    if any(abs(qr - row) <= 1 and abs(qc - col) <= 1 for qr, qc in queens):
        return False
    return True

# -----------------------------
# Step 3: Recursive queen solver
# -----------------------------
def solve(board, regions, m, row=0, queens=[], solutions=[], max_solutions=2):
    if len(queens) == m:
        solutions.append(queens.copy())
        return
    if len(solutions) >= max_solutions:
        return

    for col in range(m):
        if is_safe(board, row, col, regions, queens, m):
            board[row][col] = 'Q'
            queens.append((row, col))
            solve(board, regions, m, row + 1, queens, solutions, max_solutions)
            queens.pop()
            board[row][col] = None

# -----------------------------
# Step 4: Unique puzzle generator
# -----------------------------
def generate_unique_puzzle(m):
    while True:
        regions = generate_color_regions(m)
        board = [[None for _ in range(m)] for _ in range(m)]
        solutions = []
        solve(board, regions, m, 0, [], solutions, 2)
        if len(solutions) == 1:
            full_solution = solutions[0]
            clues = full_solution.copy()
            random.shuffle(clues)
            for q in clues[:]:
                test_board = [[None for _ in range(m)] for _ in range(m)]
                for qr, qc in clues:
                    if (qr, qc) != q:
                        test_board[qr][qc] = 'Q'
                test_solutions = []
                solve(test_board, regions, m, 0, [], test_solutions, 2)
                if len(test_solutions) == 1:
                    clues.remove(q)
            return {
                'regions': regions,
                'given_queens': clues,
                'solution': full_solution
            }

# -----------------------------
# Step 5: Visualize puzzle text
# -----------------------------
def visualize_puzzle(data):
    regions = data["regions"]
    solution = set((r, c) for r, c in data["solution"])
    m = len(regions)

    output_lines = []
    for r in range(m):
        row_str = ""
        for c in range(m):
            region = regions[r][c]
            if (r, c) in solution:
                row_str += f"Q{region} "
            else:
                row_str += f" .{region} "
        output_lines.append(row_str.strip())

    return "\n".join(output_lines)

# -----------------------------
# Step 6: Run and save
# -----------------------------
if __name__ == "__main__":
    start_time = time.time()
    puzzle = generate_unique_puzzle(m)
    end_time = time.time()
    elapsed_time = end_time - start_time

    # Save JSON
    with open(output_file, 'w') as f:
        json.dump(puzzle, f, indent=2)

    # Save visualization
    parsed_data = json.loads(json.dumps(puzzle))
    result_text = visualize_puzzle(parsed_data)
    with open(result_file, 'w') as f:
        f.write(f"Time taken: {elapsed_time:.2f} seconds\n\n")
        f.write(result_text)

    # Console output
    print(f"Time taken: {elapsed_time:.2f} seconds")
    print(result_text)
