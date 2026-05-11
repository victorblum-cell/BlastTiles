import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Board } from '../lib/gameLogic';
import { CellMode } from './ModeToggle';
import { Cell } from './Cell';

interface Props {
  board: Board;
  onReveal: (row: number, col: number) => void;
  onFlag: (row: number, col: number) => void;
  mode: CellMode;
  isGameOver?: boolean;
}

export function MinesweeperGrid({ board, onReveal, onFlag, mode }: Props) {
  return (
    <View style={styles.grid}>
      {board.map((row, r) => (
        <View key={r} style={styles.row}>
          {row.map((cell, c) => (
            <Cell
              key={c}
              cell={cell}
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
  row: { flexDirection: 'row' },
});
