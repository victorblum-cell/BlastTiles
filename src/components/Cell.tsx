import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CellState } from '../lib/gameLogic';

// Neon arcade colors matching the reference image
const NUMBER_COLORS: Record<number, string> = {
  1: '#00E5FF',
  2: '#69FF47',
  3: '#FF5252',
  4: '#EA80FC',
  5: '#FFAB40',
  6: '#18FFFF',
  7: '#FF4081',
  8: '#FFFFFF',
};

interface Props {
  cell: CellState;
  onPress: () => void;
}

export function Cell({ cell, onPress }: Props) {
  const scaleAnim  = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const flagScale  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!cell.isRevealed) return;

    if (cell.isMine) {
      Animated.sequence([
        Animated.spring(scaleAnim, { toValue: 1.7, tension: 500, friction: 4, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1.0, tension: 200, friction: 6, useNativeDriver: true }),
      ]).start();
    } else {
      scaleAnim.setValue(0.45);
      rotateAnim.setValue(-0.1);
      opacityAnim.setValue(0);
      Animated.parallel([
        Animated.spring(scaleAnim,   { toValue: 1, tension: 340, friction: 9,  useNativeDriver: true }),
        Animated.spring(rotateAnim,  { toValue: 0, tension: 200, friction: 8,  useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 90,               useNativeDriver: true }),
      ]).start();
    }
  }, [cell.isRevealed]);

  useEffect(() => {
    if (cell.isFlagged) {
      flagScale.setValue(0);
      Animated.spring(flagScale, { toValue: 1, tension: 380, friction: 7, useNativeDriver: true }).start();
    } else {
      Animated.timing(flagScale, { toValue: 0, duration: 100, useNativeDriver: true }).start();
    }
  }, [cell.isFlagged]);

  const rotate = rotateAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-60deg', '60deg'],
  });

  const isHidden   = !cell.isRevealed;
  const isFlagged  = cell.isFlagged && !cell.isRevealed;
  const isRevealed = cell.isRevealed && !cell.isMine;
  const isMine     = cell.isRevealed && cell.isMine;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      disabled={cell.isRevealed && !cell.isMine}
    >
      <Animated.View
        style={[
          styles.cell,
          isHidden  && styles.hidden,
          isRevealed && styles.revealed,
          isMine    && styles.mine,
          { opacity: opacityAnim, transform: [{ scale: scaleAnim }, { rotate }] },
        ]}
      >
        {/* Glossy top sheen on hidden cells */}
        {isHidden && <View style={styles.gloss} />}

        {/* "?" on unrevealed unflagged cells */}
        {isHidden && !isFlagged && (
          <Text style={styles.question}>?</Text>
        )}

        {/* Flag */}
        {isFlagged && (
          <Animated.Text style={[styles.cellText, { transform: [{ scale: flagScale }] }]}>
            🚩
          </Animated.Text>
        )}

        {/* Mine */}
        {isMine && <Text style={styles.cellText}>💣</Text>}

        {/* Number */}
        {isRevealed && cell.adjacentMines > 0 && (
          <Text style={[styles.number, { color: NUMBER_COLORS[cell.adjacentMines] ?? '#fff' }]}>
            {cell.adjacentMines}
          </Text>
        )}
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
    overflow: 'hidden',
  },
  hidden: {
    backgroundColor: '#3D4EC8',
    borderBottomWidth: 3,
    borderBottomColor: '#1E2A80',
    borderRightWidth: 2,
    borderRightColor: '#1E2A80',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
  revealed: {
    backgroundColor: '#0A1245',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  mine: {
    backgroundColor: '#FF3B30',
    elevation: 8,
    shadowColor: '#FF3B30',
    shadowOpacity: 0.9,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  gloss: {
    position: 'absolute',
    top: 2,
    left: 3,
    right: 3,
    height: '40%',
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  question: {
    fontSize: 18,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.55)',
  },
  number: {
    fontSize: 18,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cellText: {
    fontSize: 16,
    fontWeight: '800',
  },
});
