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
import { submitTimeScore } from '../lib/supabase';
import {
  getPersonalBestTime,
  getSavedPlayerName,
  saveLocalTimeScore,
  savePlayerName,
  TimeScore,
  recordPlay,
} from '../lib/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'TimeComplete'>;

function formatTime(ms: number): string {
  const totalSecs = ms / 1000;
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  if (mins > 0) return `${String(mins).padStart(2, '0')}:${secs.toFixed(2).padStart(5, '0')}`;
  return `${secs.toFixed(2)}s`;
}

export function TimeCompleteScreen({ navigation }: Props) {
  const game = useGame();
  const play = useSounds();
  const finalTime = game.timeMs;

  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null);
  const [inputName, setInputName] = useState('');
  const [savedName, setSavedName] = useState('');
  const [personalBest, setPersonalBest] = useState<TimeScore | null>(null);
  const [newRecord, setNewRecord] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fadeAnim    = useRef(new Animated.Value(0)).current;
  const cardAnim    = useRef(new Animated.Value(0)).current;
  const btnAnim     = useRef(new Animated.Value(0)).current;
  const badgeAnim   = useRef(new Animated.Value(0)).current;
  const timerPulse  = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    play('clear');
    recordPlay();

    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();

    // Pulse the timer value
    Animated.sequence([
      Animated.spring(timerPulse, { toValue: 1.15, tension: 260, friction: 6, useNativeDriver: true }),
      Animated.spring(timerPulse, { toValue: 1.0,  tension: 200, friction: 8, useNativeDriver: true }),
    ]).start();

    async function init() {
      const [name, best] = await Promise.all([getSavedPlayerName(), getPersonalBestTime()]);
      setSavedName(name);
      setPersonalBest(best);
      const firstTime = !name;
      setIsFirstTime(firstTime);

      if (!firstTime) {
        const isNew = !best || finalTime < best.time_ms;
        setNewRecord(isNew);

        if (isNew) {
          await saveLocalTimeScore({ player_name: name, time_ms: finalTime });
          await submitTimeScore({ player_name: name, time_ms: finalTime });
          play('highscore');
        }

        Animated.stagger(80, [
          Animated.spring(cardAnim, { toValue: 1, tension: 160, friction: 12, useNativeDriver: true }),
          Animated.spring(btnAnim,  { toValue: 1, tension: 160, friction: 12, useNativeDriver: true }),
        ]).start();

        if (isNew) {
          setTimeout(() => {
            Animated.spring(badgeAnim, { toValue: 1, tension: 260, friction: 8, useNativeDriver: true }).start();
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
    await savePlayerName(trimmed);
    await saveLocalTimeScore({ player_name: trimmed, time_ms: finalTime });
    await submitTimeScore({ player_name: trimmed, time_ms: finalTime });
    setSubmitting(false);
    navigation.navigate('Leaderboard', { highlightName: trimmed, mode: 'time' });
  }

  function handlePlayAgain() {
    game.restartGame();
    navigation.pop();
  }

  if (isFirstTime === null) {
    return (
      <LinearGradient colors={['#004D40', '#00695C', '#00897B']} style={styles.container}>
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
    <LinearGradient colors={['#004D40', '#00695C', '#1A237E']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.inner}>

        {/* Header */}
        <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
          <Text style={styles.emoji}>⏱️</Text>
          <Text style={styles.title}>CLEARED!</Text>
          <Text style={styles.subtitle}>9 × 14 board</Text>
        </Animated.View>

        {/* Big timer */}
        <Animated.View style={{ transform: [{ scale: timerPulse }], alignItems: 'center', marginVertical: 12 }}>
          <Text style={styles.timerLabel}>YOUR TIME</Text>
          <Text style={styles.timerValue}>{formatTime(finalTime)}</Text>
        </Animated.View>

        {isFirstTime ? (
          <>
            <Animated.View style={[styles.nameSection, btnSlide]}>
              <Text style={styles.nameLabel}>Enter your name to save your time</Text>
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
                  ? <ActivityIndicator color="#004D40" />
                  : <Text style={styles.submitText}>SAVE TIME 🏆</Text>
                }
              </TouchableOpacity>
            </Animated.View>
          </>
        ) : (
          <>
            {newRecord && (
              <Animated.View style={[styles.recordBadge, { transform: [{ scale: badgeAnim }] }]}>
                <Text style={styles.recordText}>✨ NEW RECORD!</Text>
              </Animated.View>
            )}

            <Animated.View style={[styles.compareCard, cardSlide]}>
              <View style={styles.compareCol}>
                <Text style={styles.compareLabel}>THIS RUN</Text>
                <Text style={[styles.compareTime, newRecord && styles.newTime]}>
                  {formatTime(finalTime)}
                </Text>
              </View>
              <View style={styles.compareDivider} />
              <View style={styles.compareCol}>
                <Text style={styles.compareLabel}>BEST</Text>
                <Text style={styles.compareTime}>
                  {personalBest && !newRecord
                    ? formatTime(personalBest.time_ms)
                    : newRecord
                      ? formatTime(finalTime)
                      : '—'}
                </Text>
              </View>
            </Animated.View>

            <Animated.View style={[styles.btnRow, btnSlide]}>
              <TouchableOpacity style={styles.playAgainBtn} onPress={handlePlayAgain}>
                <Text style={styles.playAgainText}>PLAY AGAIN</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.lbBtn}
                onPress={() => navigation.navigate('Leaderboard', { highlightName: savedName, mode: 'time' })}
              >
                <Text style={styles.lbText}>🏆 SCORES</Text>
              </TouchableOpacity>
            </Animated.View>
          </>
        )}
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  emoji:    { fontSize: 56, textAlign: 'center' },
  title:    { fontSize: 48, fontWeight: '900', color: '#69FF47', textAlign: 'center', letterSpacing: 4,
              textShadowColor: '#69FF47', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: 4 },

  timerLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 3,
    marginBottom: 2,
  },
  timerValue: {
    fontSize: 56,
    fontWeight: '900',
    color: '#FFD600',
    letterSpacing: 2,
    textShadowColor: '#FFD600',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },

  recordBadge: {
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
  recordText: { fontSize: 16, fontWeight: '900', color: '#3E2723', letterSpacing: 2 },

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
  compareTime:    { fontSize: 28, fontWeight: '900', color: '#fff' },
  newTime:        { color: '#FFD600', textShadowColor: '#FFD600', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8 },
  compareDivider: { width: 1, height: 70, backgroundColor: 'rgba(255,255,255,0.2)' },

  btnRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  playAgainBtn: {
    borderWidth: 2.5,
    borderColor: '#FFD600',
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 32,
    backgroundColor: 'rgba(255,214,0,0.12)',
    elevation: 8,
    shadowColor: '#FFD600',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
  },
  playAgainText: { color: '#FFD600', fontWeight: '900', fontSize: 16, letterSpacing: 2 },

  lbBtn: {
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  lbText: { color: '#fff', fontWeight: '700', fontSize: 14, letterSpacing: 1 },

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
});
