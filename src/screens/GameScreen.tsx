import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { ComboText } from '../components/ComboText';
import { MinesweeperGrid } from '../components/MinesweeperGrid';
import { MultiplierBadge } from '../components/MultiplierBadge';
import { ScoreDisplay } from '../components/ScoreDisplay';
import { useGame } from '../context/GameContext';
import { useTimer } from '../hooks/useTimer';

type Props = NativeStackScreenProps<RootStackParamList, 'Game'>;

export function GameScreen({ navigation }: Props) {
  const game = useGame();
  const { elapsed, reset: resetTimer } = useTimer(game.phase === 'playing');
  const prevPhase = useRef(game.phase);

  useEffect(() => {
    if (prevPhase.current === game.phase) return;
    prevPhase.current = game.phase;

    if (game.phase === 'cleared') {
      navigation.navigate('RoomClear');
    }
    if (game.phase === 'dead') {
      navigation.navigate('GameOver');
    }
  }, [game.phase]);

  // Reset timer when returning to playing phase (new room started)
  useEffect(() => {
    if (game.phase === 'playing') {
      resetTimer();
    }
  }, [game.roomNumber]);

  return (
    <LinearGradient colors={['#3D5AFE', '#6C63FF', '#9C27B0']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.roomLabel}>ROOM {game.roomNumber}</Text>
        <MultiplierBadge multiplier={game.multiplier} />
      </View>

      <ScoreDisplay
        totalScore={game.totalScore}
        roomPoints={game.roomPoints}
        remainingMines={game.remainingMines}
        elapsed={elapsed}
      />

      <View style={styles.gridWrapper}>
        <MinesweeperGrid
          board={game.board}
          onReveal={game.handleReveal}
          onFlag={game.handleFlag}
          isGameOver={game.phase === 'dead'}
        />
        <ComboText streak={game.streak} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 56,
    paddingHorizontal: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  roomLabel: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2,
  },
  gridWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
