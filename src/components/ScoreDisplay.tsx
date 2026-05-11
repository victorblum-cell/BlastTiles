import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  totalScore: number;
  roomPoints: number;
  remainingMines: number;
  elapsed: number;
}

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

function formatTime(s: number) {
  return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
}

function ScoreBox({
  icon, label, value, valueColor,
}: { icon: string; label: string; value: string; valueColor: string }) {
  return (
    <View style={styles.box}>
      <Text style={styles.boxLabel}>{icon} {label}</Text>
      <Text style={[styles.boxValue, { color: valueColor }]}>{value}</Text>
    </View>
  );
}

export function ScoreDisplay({ totalScore, roomPoints, remainingMines, elapsed }: Props) {
  return (
    <View style={styles.row}>
      <ScoreBox
        icon="⭐"
        label="SCORE"
        value={(totalScore + roomPoints).toLocaleString()}
        valueColor="#FFD600"
      />
      <ScoreBox
        icon="💣"
        label="MINES"
        value={pad(remainingMines)}
        valueColor="#FF5252"
      />
      <ScoreBox
        icon="⏱"
        label="TIME"
        value={formatTime(elapsed)}
        valueColor="#00E5FF"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  box: {
    flex: 1,
    backgroundColor: 'rgba(0,150,255,0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(0,180,255,0.4)',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  boxLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  boxValue: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
