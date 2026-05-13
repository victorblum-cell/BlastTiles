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
import { useSounds } from '../hooks/useSounds';
import { submitScore } from '../lib/supabase';
import {
  getPersonalBest,
  getSavedPlayerName,
  LocalScore,
  saveLocalScore,
  savePlayerName,
} from '../lib/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'GameOver'>;

export function GameOverScreen({ navigation }: Props) {
  const game = useGame();
  const play = useSounds();
  const { totalScore, roomNumber, multiplier } = game;
  const roomsCleared = roomNumber - 1;

  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null);
  const [inputName, setInputName] = useState('');
  const [savedName, setSavedName] = useState('');
  const [personalBest, setPersonalBest] = useState<LocalScore | null>(null);
  const [newHighscore, setNewHighscore] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const shakeAnim   = useRef(new Animated.Value(0)).current;
  const fadeAnim    = useRef(new Animated.Value(0)).current;
  const hsBadgeAnim = useRef(new Animated.Value(0)).current;
  const cardAnim    = useRef(new Animated.Value(0)).current;
  const btnAnim     = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animations
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6,   duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 60, useNativeDriver: true }),
    ]).start();

    async function init() {
      const [name, best] = await Promise.all([getSavedPlayerName(), getPersonalBest()]);
      setSavedName(name);
      setPersonalBest(best);
      const firstTime = !name;
      setIsFirstTime(firstTime);

      if (!firstTime) {
        const isNew = !best || totalScore > best.total_score;
        setNewHighscore(isNew);
        if (isNew) {
          const entry = { player_name: name, total_score: totalScore, rooms_cleared: roomsCleared, max_multiplier: multiplier };
          await saveLocalScore(entry);
          await submitScore(entry);
          play('highscore');
        }
        // Stagger card + button + optional hs badge
        Animated.stagger(80, [
          Animated.spring(cardAnim, { toValue: 1, tension: 160, friction: 12, useNativeDriver: true }),
          Animated.spring(btnAnim,  { toValue: 1, tension: 160, friction: 12, useNativeDriver: true }),
        ]).start();
        if (isNew) {
          setTimeout(() => {
            Animated.spring(hsBadgeAnim, { toValue: 1, tension: 260, friction: 8, useNativeDriver: true }).start();
          }, 400);
        }
      } else {
        Animated.stagger(80, [
          Animated.spring(cardAnim, { toValue: 1, tension: 160, friction: 12, useNativeDriver: true }),
          Animated.spring(btnAnim,  { toValue: 1, tension: 160, friction: 12, useNativeDriver: true }),
        ]).start();
      }
    }

    init();
  }, []);

  async function handleFirstTimeSubmit() {
    if (!inputName.trim()) return;
    setSubmitting(true);
    const trimmed = inputName.trim();
    const entry = { player_name: trimmed, total_score: totalScore, rooms_cleared: roomsCleared, max_multiplier: multiplier };
    await savePlayerName(trimmed);
    await saveLocalScore(entry);
    await submitScore(entry);
    setSubmitting(false);
    navigation.navigate('Leaderboard', { highlightName: trimmed });
  }

  function handlePlayAgain() {
    game.restartGame();
    navigation.pop();
  }

  if (isFirstTime === null) {
    return (
      <LinearGradient colors={['#B71C1C', '#880E4F', '#311B92']} style={styles.container}>
        <ActivityIndicator color="#FFD600" size="large" />
      </LinearGradient>
    );
  }

  const cardSlide = {
    opacity: cardAnim,
    transform: [{ translateY: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
  };
  const btnSlide = {
    opacity: btnAnim,
    transform: [{ translateY: btnAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
  };

  return (
    <LinearGradient colors={['#B71C1C', '#880E4F', '#311B92']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.inner}>
        {/* Header */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: shakeAnim }] }}>
          <Text style={styles.emoji}>💣</Text>
          <Text style={styles.title}>BOOM!</Text>
          <Text style={styles.subtitle}>You hit a mine</Text>
        </Animated.View>

        {isFirstTime ? (
          /* ── First-time flow: name input ── */
          <>
            <Animated.View style={[styles.statsCard, cardSlide]}>
              <Stat label="Final Score"    value={totalScore.toLocaleString()} big />
              <Stat label="Rooms Cleared"  value={String(roomsCleared)} />
              <Stat label="Max Multiplier" value={`${multiplier.toFixed(1)}×`} />
            </Animated.View>

            <Animated.View style={[styles.nameSection, btnSlide]}>
              <Text style={styles.nameLabel}>Enter your name to save score</Text>
              <TextInput
                style={styles.nameInput}
                value={inputName}
                onChangeText={setInputName}
                placeholder="Player"
                placeholderTextColor="rgba(255,255,255,0.4)"
                maxLength={20}
                autoCapitalize="words"
              />
              <TouchableOpacity
                style={[styles.submitBtn, !inputName.trim() && styles.disabledBtn]}
                onPress={handleFirstTimeSubmit}
                disabled={submitting || !inputName.trim()}
              >
                {submitting
                  ? <ActivityIndicator color="#3E2723" />
                  : <Text style={styles.submitText}>SUBMIT SCORE 🏆</Text>
                }
              </TouchableOpacity>
            </Animated.View>
          </>
        ) : (
          /* ── Returning player: comparison view ── */
          <>
            {newHighscore && (
              <Animated.View style={[styles.hsBadge, { transform: [{ scale: hsBadgeAnim }] }]}>
                <Text style={styles.hsText}>✨ NEW HIGHSCORE!</Text>
              </Animated.View>
            )}

            <Animated.View style={[styles.compareCard, cardSlide]}>
              {/* This run */}
              <View style={styles.compareCol}>
                <Text style={styles.compareLabel}>THIS RUN</Text>
                <Text style={[styles.compareScore, newHighscore && styles.newScore]}>
                  {totalScore.toLocaleString()}
                </Text>
                <Text style={styles.compareRooms}>{roomsCleared} room{roomsCleared !== 1 ? 's' : ''}</Text>
              </View>

              <View style={styles.compareDivider} />

              {/* Personal best */}
              <View style={styles.compareCol}>
                <Text style={styles.compareLabel}>BEST</Text>
                <Text style={styles.compareScore}>
                  {personalBest && !newHighscore
                    ? personalBest.total_score.toLocaleString()
                    : newHighscore
                      ? totalScore.toLocaleString()
                      : '—'}
                </Text>
                <Text style={styles.compareRooms}>
                  {personalBest && !newHighscore
                    ? `${personalBest.rooms_cleared} room${personalBest.rooms_cleared !== 1 ? 's' : ''}`
                    : newHighscore
                      ? `${roomsCleared} room${roomsCleared !== 1 ? 's' : ''}`
                      : ''}
                </Text>
              </View>
            </Animated.View>

            <Animated.View style={btnSlide}>
              <TouchableOpacity style={styles.playAgainBtn} onPress={handlePlayAgain}>
                <Text style={styles.playAgainText}>PLAY AGAIN</Text>
              </TouchableOpacity>
            </Animated.View>
          </>
        )}
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
  emoji:    { fontSize: 64, textAlign: 'center' },
  title:    { fontSize: 52, fontWeight: '900', color: '#FF5252', textAlign: 'center', letterSpacing: 4 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginBottom: 24 },

  /* First-time stats card */
  statsCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    gap: 8,
    marginBottom: 20,
  },
  statRow:   { flexDirection: 'row', justifyContent: 'space-between' },
  statLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 14 },
  statValue: { color: '#fff', fontSize: 18, fontWeight: '700' },
  bigStat:   { fontSize: 26, fontWeight: '900', color: '#FFD600' },

  /* Name input */
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
  submitBtn:   { backgroundColor: '#FFD600', borderRadius: 20, paddingVertical: 14, paddingHorizontal: 32, width: '100%', alignItems: 'center' },
  disabledBtn: { opacity: 0.5 },
  submitText:  { fontSize: 16, fontWeight: '900', color: '#3E2723', letterSpacing: 1 },

  /* New highscore badge */
  hsBadge: {
    backgroundColor: '#FFD600',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 24,
    marginBottom: 16,
    elevation: 8,
    shadowColor: '#FFD600',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 12,
  },
  hsText: { fontSize: 16, fontWeight: '900', color: '#3E2723', letterSpacing: 2 },

  /* Comparison card */
  compareCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  compareCol:     { flex: 1, alignItems: 'center', gap: 6 },
  compareLabel:   { fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.6)', letterSpacing: 2 },
  compareScore:   { fontSize: 32, fontWeight: '900', color: '#fff' },
  newScore:       { color: '#FFD600', textShadowColor: '#FFD600', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8 },
  compareRooms:   { fontSize: 13, color: 'rgba(255,255,255,0.55)' },
  compareDivider: { width: 1, height: 70, backgroundColor: 'rgba(255,255,255,0.2)' },

  /* Play again button */
  playAgainBtn: {
    borderWidth: 2.5,
    borderColor: '#FFD600',
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 60,
    backgroundColor: 'rgba(255,214,0,0.12)',
    elevation: 8,
    shadowColor: '#FFD600',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
  },
  playAgainText: { color: '#FFD600', fontWeight: '900', fontSize: 20, letterSpacing: 3 },
});
