import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useGame } from '../context/GameContext';
import { getBoardDimensions } from '../lib/gameLogic';
import { useSounds } from '../hooks/useSounds';
import { recordPlay } from '../lib/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'RoomClear'>;

export function RoomClearScreen({ navigation }: Props) {
  const game = useGame();
  const play = useSounds();
  const roomResult = game.roomResult;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    play('clear');
    recordPlay();
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 120, friction: 8 }),
    ]).start();
  }, []);

  if (!roomResult) return null;

  function handleNext() {
    game.startNextRoom();
    navigation.goBack();
  }

  return (
    <LinearGradient colors={['#00C853', '#1DE9B6', '#00B0FF']} style={styles.container}>
      <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Text style={styles.emoji}>🎉</Text>
        <Text style={styles.title}>ROOM {game.roomNumber} CLEARED!</Text>

        <View style={styles.breakdown}>
          <Row label="Safe cells" value={`+${roomResult.roomPoints - roomResult.bonusPoints}`} />
          <Row label="Clear bonus" value={`+${roomResult.bonusPoints}`} />
          <View style={styles.divider} />
          <Row label="Room total" value={roomResult.roomPoints.toString()} big />
          <Row label="Multiplier" value={`× ${roomResult.multiplier.toFixed(1)}`} accent />
          <View style={styles.divider} />
          <Row label="Running total" value={roomResult.totalAfterRoom.toLocaleString()} big />
        </View>

        {(() => {
          const next = getBoardDimensions(game.roomNumber + 1);
          return (
            <Text style={styles.nextHint}>
              Next: Room {game.roomNumber + 1} · {next.cols}×{next.rows} · {next.mineCount} mines · {(roomResult.multiplier + 0.2).toFixed(1)}x
            </Text>
          );
        })()}

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextText}>NEXT ROOM →</Text>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
}

function Row({ label, value, big, accent }: { label: string; value: string; big?: boolean; accent?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, big && styles.bigValue, accent && styles.accentValue]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    alignItems: 'center',
  },
  emoji: { fontSize: 52, marginBottom: 8 },
  title: { fontSize: 26, fontWeight: '900', color: '#fff', letterSpacing: 2, marginBottom: 24 },
  breakdown: { width: '100%', gap: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { fontSize: 15, color: 'rgba(255,255,255,0.8)' },
  rowValue: { fontSize: 15, fontWeight: '700', color: '#fff' },
  bigValue: { fontSize: 22, fontWeight: '900' },
  accentValue: { color: '#FFD600', fontSize: 20, fontWeight: '900' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 6 },
  nextHint: { marginTop: 20, fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  nextButton: {
    marginTop: 20,
    backgroundColor: '#FFD600',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 40,
  },
  nextText: { fontSize: 18, fontWeight: '900', color: '#3E2723', letterSpacing: 2 },
});
