import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  totalScore: number;
  roomPoints: number;
  remainingMines: number;
  elapsed: number;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function ScoreDisplay({ totalScore, roomPoints, remainingMines, elapsed }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.item}>
        <Text style={styles.label}>SCORE</Text>
        <Text style={styles.value}>{totalScore + roomPoints}</Text>
      </View>
      <View style={styles.item}>
        <Text style={styles.label}>💣</Text>
        <Text style={styles.value}>{remainingMines}</Text>
      </View>
      <View style={styles.item}>
        <Text style={styles.label}>TIME</Text>
        <Text style={styles.value}>{formatTime(elapsed)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  item: {
    alignItems: 'center',
  },
  label: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    letterSpacing: 1,
  },
  value: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '800',
  },
});
