import React, { useCallback } from 'react';
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

function MinesweeperGridComponent({ board, onReveal, onFlag, mode, cellSize, roomTheme = 0 }: Props) {
  const handlePress = useCallback((r: number, c: number) => {
    if (mode === 'reveal') onReveal(r, c);
    else onFlag(r, c);
  }, [mode, onReveal, onFlag]);

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
              onPress={() => handlePress(r, c)}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

export const MinesweeperGrid = React.memo(MinesweeperGridComponent);

const styles = StyleSheet.create({
  grid: { alignSelf: 'center' },
  row:  { flexDirection: 'row' },
});
