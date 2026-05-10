import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Board, COLS, ROWS } from '../lib/gameLogic';
import { Cell } from './Cell';

interface Props {
  board: Board;
  onReveal: (row: number, col: number) => void;
  onFlag: (row: number, col: number) => void;
  isGameOver?: boolean;
}

export function MinesweeperGrid({ board, onReveal, onFlag, isGameOver }: Props) {
  return (
    <View style={styles.grid}>
      {board.map((row, r) => (
        <View key={r} style={styles.row}>
          {row.map((cell, c) => (
            <Cell
              key={c}
              cell={cell}
              onPress={() => onReveal(r, c)}
              onLongPress={() => onFlag(r, c)}
              isGameOver={isGameOver}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
  },
});
