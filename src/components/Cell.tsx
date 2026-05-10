import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, Vibration } from 'react-native';
import { CellState } from '../lib/gameLogic';

const NUMBER_COLORS: Record<number, string> = {
  1: '#1565C0',
  2: '#2E7D32',
  3: '#C62828',
  4: '#4527A0',
  5: '#6D4C41',
  6: '#00838F',
  7: '#000000',
  8: '#757575',
};

interface Props {
  cell: CellState;
  onPress: () => void;
  onLongPress: () => void;
  isGameOver?: boolean;
}

export function Cell({ cell, onPress, onLongPress, isGameOver }: Props) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (cell.isRevealed && !cell.isMine) {
      scaleAnim.setValue(0.7);
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 200,
        friction: 8,
      }).start();
    }
    if (cell.isRevealed && cell.isMine) {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.4, duration: 120, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [cell.isRevealed]);

  function getCellStyle() {
    if (cell.isRevealed && cell.isMine) return [styles.cell, styles.mineCell];
    if (cell.isRevealed) return [styles.cell, styles.revealedCell];
    if (cell.isFlagged) return [styles.cell, styles.flaggedCell];
    return [styles.cell, styles.hiddenCell];
  }

  function getCellText() {
    if (cell.isFlagged && !cell.isRevealed) return '🚩';
    if (cell.isRevealed && cell.isMine) return '💣';
    if (cell.isRevealed && cell.adjacentMines > 0) return String(cell.adjacentMines);
    return '';
  }

  const textColor = cell.isRevealed && !cell.isMine && cell.adjacentMines > 0
    ? NUMBER_COLORS[cell.adjacentMines] ?? '#000'
    : undefined;

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={() => { Vibration.vibrate(30); onLongPress(); }}
      delayLongPress={350}
      activeOpacity={0.7}
      disabled={cell.isRevealed && !cell.isMine}
    >
      <Animated.View style={[getCellStyle(), { transform: [{ scale: scaleAnim }] }]}>
        <Text style={[styles.cellText, textColor ? { color: textColor } : {}]}>
          {getCellText()}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cell: {
    width: 40,
    height: 40,
    margin: 2,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  hiddenCell: {
    backgroundColor: '#7C83FD',
  },
  revealedCell: {
    backgroundColor: '#FFF3E0',
    elevation: 0,
    shadowOpacity: 0,
  },
  mineCell: {
    backgroundColor: '#FF3B30',
  },
  flaggedCell: {
    backgroundColor: '#9C27B0',
  },
  cellText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
});
