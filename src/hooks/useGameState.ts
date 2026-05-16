import { useCallback, useRef, useState } from 'react';
import {
  Board,
  createEmptyBoard,
  getBoardDimensions,
  isBoardCleared,
  placeMines,
  revealAllMines,
  revealCell,
  toggleFlag,
  getRemainingMines,
} from '../lib/gameLogic';
import {
  applyMultiplier,
  computeMultiplier,
  getComboBonus,
  POINTS_PER_CELL,
  ROOM_CLEAR_BONUS,
} from '../lib/scoring';
import { useCombo } from './useCombo';

export type GamePhase = 'playing' | 'cleared' | 'dead';
export type GameMode  = 'infinite' | 'time';

export interface RoomResult {
  roomPoints: number;
  multiplier: number;
  bonusPoints: number;
  totalAfterRoom: number;
}

const TIME_COLS = 9;
const TIME_ROWS = 14;
const TIME_MINE_COUNT = Math.round(TIME_COLS * TIME_ROWS * 0.2); // 25

function freshBoard(roomNumber: number, mode: GameMode) {
  if (mode === 'time') return createEmptyBoard(TIME_COLS, TIME_ROWS);
  const { cols, rows } = getBoardDimensions(roomNumber);
  return createEmptyBoard(cols, rows);
}

export function useGameState() {
  const initBoard = freshBoard(1, 'infinite');
  const [board, setBoard] = useState<Board>(initBoard);
  const [phase, setPhase] = useState<GamePhase>('playing');
  const [roomNumber, setRoomNumber] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const [roomPoints, setRoomPoints] = useState(0);
  const [roomResult, setRoomResult] = useState<RoomResult | null>(null);
  const [revealCount, setRevealCount] = useState(0);
  const [roomTheme, setRoomTheme] = useState<number>(() => Math.floor(Math.random() * 8));
  const [gameMode, setGameModeState] = useState<GameMode>('infinite');

  // Timer state for Time Mode
  const [timeMs, setTimeMs] = useState(0);
  const timerRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerStartRef = useRef<number | null>(null);

  const boardRef       = useRef<Board>(initBoard);
  const minesPlaced    = useRef(false);
  const roomPointsRef  = useRef(0);
  const totalScoreRef  = useRef(0);
  const roomNumberRef  = useRef(1);
  const mineCountRef   = useRef(getBoardDimensions(1).mineCount);
  const revealCountRef = useRef(0);
  const gameModeRef    = useRef<GameMode>('infinite');

  const { streak, registerReveal, resetCombo } = useCombo();

  const multiplier = computeMultiplier(roomNumber - 1);

  // ── Timer helpers ────────────────────────────────────────────────────────
  function startTimer() {
    if (timerRef.current !== null) return;
    timerStartRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setTimeMs(Date.now() - timerStartRef.current!);
    }, 33);
  }

  function stopTimer() {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function resetTimer() {
    stopTimer();
    timerStartRef.current = null;
    setTimeMs(0);
  }

  // ── Reveal ───────────────────────────────────────────────────────────────
  const handleReveal = useCallback((row: number, col: number) => {
    if (phase !== 'playing') return;

    let current = boardRef.current;
    const isTime = gameModeRef.current === 'time';

    if (!minesPlaced.current) {
      const mc = isTime ? TIME_MINE_COUNT : mineCountRef.current;
      current = placeMines(current, row, col, mc);
      minesPlaced.current = true;
      if (isTime) startTimer();
    }

    if (current[row][col].isRevealed || current[row][col].isFlagged) return;

    if (current[row][col].isMine) {
      const dead = revealAllMines(current);
      boardRef.current = dead;
      setBoard(dead);
      stopTimer();
      setPhase('dead');
      return;
    }

    const { board: next, revealed } = revealCell(current, row, col);
    boardRef.current = next;

    if (!isTime) {
      const newStreak  = registerReveal();
      const comboBonus = revealed === 1 ? getComboBonus(newStreak) : 0;
      const pts        = revealed * POINTS_PER_CELL + comboBonus;
      const newRoomPts = roomPointsRef.current + pts;
      roomPointsRef.current = newRoomPts;
      setRoomPoints(newRoomPts);
    }

    revealCountRef.current += 1;
    setRevealCount(revealCountRef.current);
    setBoard(next);

    if (isBoardCleared(next)) {
      stopTimer();
      if (isTime) {
        setPhase('cleared');
      } else {
        const bonus     = ROOM_CLEAR_BONUS;
        const roomTotal = roomPointsRef.current + bonus;
        const m         = computeMultiplier(roomNumberRef.current - 1);
        const finalRoom = applyMultiplier(roomTotal, m);
        const newTotal  = totalScoreRef.current + finalRoom;
        totalScoreRef.current = newTotal;
        setTotalScore(newTotal);
        setRoomResult({ roomPoints: roomTotal, multiplier: m, bonusPoints: bonus, totalAfterRoom: newTotal });
        setPhase('cleared');
      }
    }
  }, [phase, registerReveal]);

  // ── Flag ─────────────────────────────────────────────────────────────────
  const handleFlag = useCallback((row: number, col: number) => {
    if (phase !== 'playing') return;
    const next = toggleFlag(boardRef.current, row, col);
    boardRef.current = next;
    setBoard(next);
  }, [phase]);

  // ── Next room (Infinite only) ────────────────────────────────────────────
  const startNextRoom = useCallback(() => {
    const nextRoom = roomNumberRef.current + 1;
    roomNumberRef.current = nextRoom;
    roomPointsRef.current = 0;
    const { mineCount } = getBoardDimensions(nextRoom);
    mineCountRef.current = mineCount;
    const fresh = freshBoard(nextRoom, 'infinite');
    boardRef.current = fresh;
    minesPlaced.current = false;
    setBoard(fresh);
    setRoomPoints(0);
    setRoomResult(null);
    setPhase('playing');
    setRoomNumber(nextRoom);
    setRoomTheme(Math.floor(Math.random() * 8));
    resetCombo();
  }, [resetCombo]);

  // ── Restart ──────────────────────────────────────────────────────────────
  const restartGame = useCallback(() => {
    const mode = gameModeRef.current;
    resetTimer();
    roomNumberRef.current  = 1;
    roomPointsRef.current  = 0;
    totalScoreRef.current  = 0;
    mineCountRef.current   = getBoardDimensions(1).mineCount;
    revealCountRef.current = 0;
    const fresh = freshBoard(1, mode);
    boardRef.current = fresh;
    minesPlaced.current = false;
    setBoard(fresh);
    setPhase('playing');
    setRoomNumber(1);
    setTotalScore(0);
    setRoomPoints(0);
    setRoomResult(null);
    setRevealCount(0);
    setRoomTheme(Math.floor(Math.random() * 8));
    resetCombo();
  }, [resetCombo]);

  // ── Set mode (called from StartScreen before navigating) ─────────────────
  const setGameMode = useCallback((mode: GameMode) => {
    gameModeRef.current = mode;
    setGameModeState(mode);
    resetTimer();
    roomNumberRef.current  = 1;
    roomPointsRef.current  = 0;
    totalScoreRef.current  = 0;
    mineCountRef.current   = getBoardDimensions(1).mineCount;
    revealCountRef.current = 0;
    const fresh = freshBoard(1, mode);
    boardRef.current = fresh;
    minesPlaced.current = false;
    setBoard(fresh);
    setPhase('playing');
    setRoomNumber(1);
    setTotalScore(0);
    setRoomPoints(0);
    setRoomResult(null);
    setRevealCount(0);
    setRoomTheme(Math.floor(Math.random() * 8));
    resetCombo();
  }, [resetCombo]);

  return {
    board,
    phase,
    roomNumber,
    totalScore,
    roomPoints,
    roomResult,
    multiplier,
    streak,
    revealCount,
    roomTheme,
    gameMode,
    timeMs,
    handleReveal,
    handleFlag,
    startNextRoom,
    restartGame,
    setGameMode,
    remainingMines: getRemainingMines(board, gameModeRef.current === 'time' ? TIME_MINE_COUNT : mineCountRef.current),
  };
}
