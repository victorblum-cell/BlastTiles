import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useGame } from '../context/GameContext';
import { submitScore } from '../lib/supabase';
import { getSavedPlayerName, saveLocalScore, savePlayerName } from '../lib/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'GameOver'>;

export function GameOverScreen({ navigation }: Props) {
  const game = useGame();
  const { totalScore, roomNumber, multiplier } = game;
  const roomsCleared = roomNumber - 1;

  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    getSavedPlayerName().then(n => { if (n) setName(n); });
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }, []);

  async function handleSubmit() {
    if (!name.trim()) return;
    setSubmitting(true);
    const entry = {
      player_name: name.trim(),
      total_score: totalScore,
      rooms_cleared: roomsCleared,
      max_multiplier: multiplier,
    };
    await savePlayerName(name.trim());
    await saveLocalScore(entry);
    await submitScore(entry);
    setSubmitting(false);
    setSubmitted(true);
    navigation.navigate('Leaderboard', { highlightName: name.trim() });
  }

  function handleRestart() {
    game.restartGame();
    navigation.popToTop();
  }

  return (
    <LinearGradient colors={['#B71C1C', '#880E4F', '#311B92']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.inner}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: shakeAnim }] }}>
          <Text style={styles.emoji}>💣</Text>
          <Text style={styles.title}>BOOM!</Text>
          <Text style={styles.subtitle}>You hit a mine</Text>
        </Animated.View>

        <View style={styles.statsCard}>
          <Stat label="Final Score" value={totalScore.toLocaleString()} big />
          <Stat label="Rooms Cleared" value={String(roomsCleared)} />
          <Stat label="Max Multiplier" value={`${multiplier.toFixed(1)}x`} />
        </View>

        {!submitted && (
          <View style={styles.nameSection}>
            <Text style={styles.nameLabel}>Enter your name</Text>
            <TextInput
              style={styles.nameInput}
              value={name}
              onChangeText={setName}
              placeholder="Player"
              placeholderTextColor="rgba(255,255,255,0.4)"
              maxLength={20}
              autoCapitalize="words"
            />
            <TouchableOpacity
              style={[styles.submitBtn, !name.trim() && styles.disabledBtn]}
              onPress={handleSubmit}
              disabled={submitting || !name.trim()}
            >
              {submitting ? (
                <ActivityIndicator color="#3E2723" />
              ) : (
                <Text style={styles.submitText}>SUBMIT SCORE 🏆</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.restartBtn} onPress={handleRestart}>
          <Text style={styles.restartText}>PLAY AGAIN</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

function Stat({ label, value, big }: { label: string; value: string; big?: boolean }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, big && styles.bigStat]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  emoji: { fontSize: 64, textAlign: 'center' },
  title: { fontSize: 52, fontWeight: '900', color: '#FF5252', textAlign: 'center', letterSpacing: 4 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginBottom: 28 },
  statsCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    gap: 8,
    marginBottom: 24,
  },
  statRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 14 },
  statValue: { color: '#fff', fontSize: 18, fontWeight: '700' },
  bigStat: { fontSize: 26, fontWeight: '900', color: '#FFD600' },
  nameSection: { width: '100%', alignItems: 'center', marginBottom: 16 },
  nameLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 8 },
  nameInput: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 18,
    width: '100%',
    marginBottom: 12,
    textAlign: 'center',
  },
  submitBtn: {
    backgroundColor: '#FFD600',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
  },
  disabledBtn: { opacity: 0.5 },
  submitText: { fontSize: 16, fontWeight: '900', color: '#3E2723', letterSpacing: 1 },
  restartBtn: {
    marginTop: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 40,
  },
  restartText: { color: '#fff', fontWeight: '700', fontSize: 15, letterSpacing: 1 },
});
