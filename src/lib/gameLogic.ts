export const COLS = 7;
export const ROWS = 12;
export const MINE_COUNT = 18;

export type CellState = {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
};

export type Board = CellState[][];

export function createEmptyBoard(): Board {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      adjacentMines: 0,
    }))
  );
}

export function placeMines(board: Board, firstRow: number, firstCol: number): Board {
  const next = board.map(row => row.map(cell => ({ ...cell })));
  const forbidden = new Set<string>();
  // protect first cell and its neighbors
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const r = firstRow + dr;
      const c = firstCol + dc;
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
        forbidden.add(`${r},${c}`);
      }
    }
  }

  let placed = 0;
  while (placed < MINE_COUNT) {
    const r = Math.floor(Math.random() * ROWS);
    const c = Math.floor(Math.random() * COLS);
    const key = `${r},${c}`;
    if (!forbidden.has(key) && !next[r][c].isMine) {
      next[r][c].isMine = true;
      placed++;
    }
  }

  // calculate adjacentMines
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!next[r][c].isMine) {
        next[r][c].adjacentMines = countAdjacentMines(next, r, c);
      }
    }
  }
  return next;
}

function countAdjacentMines(board: Board, row: number, col: number): number {
  let count = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const r = row + dr;
      const c = col + dc;
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c].isMine) {
        count++;
      }
    }
  }
  return count;
}

export function revealCell(board: Board, row: number, col: number): { board: Board; revealed: number } {
  if (board[row][col].isRevealed || board[row][col].isFlagged) {
    return { board, revealed: 0 };
  }

  const next = board.map(r => r.map(c => ({ ...c })));
  let revealed = 0;

  function flood(r: number, c: number) {
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
    if (next[r][c].isRevealed || next[r][c].isFlagged || next[r][c].isMine) return;
    next[r][c].isRevealed = true;
    revealed++;
    if (next[r][c].adjacentMines === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr !== 0 || dc !== 0) flood(r + dr, c + dc);
        }
      }
    }
  }

  flood(row, col);
  return { board: next, revealed };
}

export function toggleFlag(board: Board, row: number, col: number): Board {
  if (board[row][col].isRevealed) return board;
  const next = board.map(r => r.map(c => ({ ...c })));
  next[row][col].isFlagged = !next[row][col].isFlagged;
  return next;
}

export function revealAllMines(board: Board): Board {
  return board.map(row =>
    row.map(cell => ({
      ...cell,
      isRevealed: cell.isMine ? true : cell.isRevealed,
    }))
  );
}

export function isBoardCleared(board: Board): boolean {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!board[r][c].isMine && !board[r][c].isRevealed) return false;
    }
  }
  return true;
}

export function getRemainingMines(board: Board): number {
  let flags = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c].isFlagged) flags++;
    }
  }
  return MINE_COUNT - flags;
}
