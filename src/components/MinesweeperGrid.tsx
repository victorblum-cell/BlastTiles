import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Board } from '../lib/gameLogic';
import { CellMode } from './ModeToggle';
import { Cell } from './Cell';
import { RoomTheme } from './TileBackground';

interface Props {
  board:      Board;
  onReveal:   (row: number, col: number) => void;
  onFlag:     (row: number, col: number) => void;
  mode:       CellMode;
  isGameOver?: boolean;
  cellSize?:  number;
  roomTheme?: RoomTheme;
}

export function MinesweeperGrid({ board, onReveal, onFlag, mode, cellSize, roomTheme = 0 }: Props) {
  return (
    <View style={styles.grid}>
      {board.map((row, r) => (
        <View key={r} style={styles.row}>
          {row.map((cell, c) => (
            <Cell
              key={c}
              cell={cell}
              size={cellSize}
              roomTheme={roomTheme}
              cellVariant={(r * 5 + c * 3) % 4}
              onPress={() => (mode === 'reveal' ? onReveal(r, c) : onFlag(r, c))}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { alignSelf: 'center' },
  row:  { flexDirection: 'row' },
});
