export type CellState = {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
};

export type Board = CellState[][];

// Room 1 → 4×7, each room adds 1 col + 1 row
export function getBoardDimensions(roomNumber: number): { cols: number; rows: number; mineCount: number } {
  const cols = 3 + roomNumber;
  const rows = 6 + roomNumber;
  const mineCount = Math.max(1, Math.round(cols * rows * 0.20));
  return { cols, rows, mineCount };
}

export function createEmptyBoard(cols: number, rows: number): Board {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      adjacentMines: 0,
    }))
  );
}

export function placeMines(board: Board, firstRow: number, firstCol: number, mineCount: number): Board {
  const rows = board.length;
  const cols = board[0].length;
  const next = board.map(row => row.map(cell => ({ ...cell })));

  const forbidden = new Set<string>();
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const r = firstRow + dr, c = firstCol + dc;
      if (r >= 0 && r < rows && c >= 0 && c < cols) forbidden.add(`${r},${c}`);
    }
  }

  let placed = 0;
  while (placed < mineCount) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    const key = `${r},${c}`;
    if (!forbidden.has(key) && !next[r][c].isMine) {
      next[r][c].isMine = true;
      placed++;
    }
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!next[r][c].isMine) next[r][c].adjacentMines = countAdjacentMines(next, r, c);
    }
  }
  return next;
}

function countAdjacentMines(board: Board, row: number, col: number): number {
  const rows = board.length, cols = board[0].length;
  let count = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const r = row + dr, c = col + dc;
      if (r >= 0 && r < rows && c >= 0 && c < cols && board[r][c].isMine) count++;
    }
  }
  return count;
}

export function revealCell(board: Board, row: number, col: number): { board: Board; revealed: number } {
  if (board[row][col].isRevealed || board[row][col].isFlagged) return { board, revealed: 0 };

  const rows = board.length, cols = board[0].length;
  const next = board.map(r => r.map(c => ({ ...c })));
  let revealed = 0;

  function flood(r: number, c: number) {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return;
    if (next[r][c].isRevealed || next[r][c].isFlagged || next[r][c].isMine) return;
    next[r][c].isRevealed = true;
    revealed++;
    if (next[r][c].adjacentMines === 0) {
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++)
          if (dr !== 0 || dc !== 0) flood(r + dr, c + dc);
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
    row.map(cell => ({ ...cell, isRevealed: cell.isMine ? true : cell.isRevealed }))
  );
}

export function isBoardCleared(board: Board): boolean {
  for (const row of board)
    for (const cell of row)
      if (!cell.isMine && !cell.isRevealed) return false;
  return true;
}

export function getRemainingMines(board: Board, mineCount: number): number {
  let flags = 0;
  for (const row of board) for (const cell of row) if (cell.isFlagged) flags++;
  return mineCount - flags;
}
