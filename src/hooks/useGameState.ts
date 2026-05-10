import { useCallback, useRef, useState } from 'react';
import {
  Board,
  createEmptyBoard,
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

export interface RoomResult {
  roomPoints: number;
  multiplier: number;
  bonusPoints: number;
  totalAfterRoom: number;
}

export function useGameState() {
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [phase, setPhase] = useState<GamePhase>('playing');
  const [roomNumber, setRoomNumber] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const [roomPoints, setRoomPoints] = useState(0);
  const [roomResult, setRoomResult] = useState<RoomResult | null>(null);

  // Mutable refs so closures in handleReveal always see latest values
  const boardRef = useRef<Board>(createEmptyBoard());
  const minesPlaced = useRef(false);
  const roomPointsRef = useRef(0);
  const totalScoreRef = useRef(0);
  const roomNumberRef = useRef(1);

  const { streak, registerReveal, resetCombo } = useCombo();

  const multiplier = computeMultiplier(roomNumber - 1);

  const handleReveal = useCallback((row: number, col: number) => {
    if (phase !== 'playing') return;

    let current = boardRef.current;

    if (!minesPlaced.current) {
      current = placeMines(current, row, col);
      minesPlaced.current = true;
    }

    if (current[row][col].isRevealed || current[row][col].isFlagged) return;

    if (current[row][col].isMine) {
      const dead = revealAllMines(current);
      boardRef.current = dead;
      setBoard(dead);
      setPhase('dead');
      return;
    }

    const { board: next, revealed } = revealCell(current, row, col);
    boardRef.current = next;

    // registerReveal must run outside setBoard to avoid double-invocation in Strict Mode
    const newStreak = registerReveal();
    const comboBonus = revealed === 1 ? getComboBonus(newStreak) : 0;
    const pts = revealed * POINTS_PER_CELL + comboBonus;

    const newRoomPts = roomPointsRef.current + pts;
    roomPointsRef.current = newRoomPts;

    setBoard(next);
    setRoomPoints(newRoomPts);

    if (isBoardCleared(next)) {
      const bonus = ROOM_CLEAR_BONUS;
      const roomTotal = newRoomPts + bonus;
      const m = computeMultiplier(roomNumberRef.current - 1);
      const finalRoom = applyMultiplier(roomTotal, m);
      const newTotal = totalScoreRef.current + finalRoom;
      totalScoreRef.current = newTotal;

      setTotalScore(newTotal);
      setRoomResult({
        roomPoints: roomTotal,
        multiplier: m,
        bonusPoints: bonus,
        totalAfterRoom: newTotal,
      });
      setPhase('cleared');
    }
  }, [phase, registerReveal]);

  const handleFlag = useCallback((row: number, col: number) => {
    if (phase !== 'playing') return;
    const next = toggleFlag(boardRef.current, row, col);
    boardRef.current = next;
    setBoard(next);
  }, [phase]);

  const startNextRoom = useCallback(() => {
    const nextRoom = roomNumberRef.current + 1;
    roomNumberRef.current = nextRoom;
    roomPointsRef.current = 0;
    const fresh = createEmptyBoard();
    boardRef.current = fresh;
    minesPlaced.current = false;
    setBoard(fresh);
    setRoomPoints(0);
    setRoomResult(null);
    setPhase('playing');
    setRoomNumber(nextRoom);
    resetCombo();
  }, [resetCombo]);

  const restartGame = useCallback(() => {
    roomNumberRef.current = 1;
    roomPointsRef.current = 0;
    totalScoreRef.current = 0;
    const fresh = createEmptyBoard();
    boardRef.current = fresh;
    minesPlaced.current = false;
    setBoard(fresh);
    setPhase('playing');
    setRoomNumber(1);
    setTotalScore(0);
    setRoomPoints(0);
    setRoomResult(null);
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
    handleReveal,
    handleFlag,
    startNextRoom,
    restartGame,
    remainingMines: getRemainingMines(board),
  };
}
