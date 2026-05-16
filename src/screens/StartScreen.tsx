import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, GameMode } from '../../App';
import { getPersonalBest, getPersonalBestTime, getStreak, LocalScore, TimeScore, StreakData } from '../lib/storage';
import { useSounds } from '../hooks/useSounds';
import { useGame } from '../context/GameContext';
import { StreakBadge } from '../components/StreakBadge';

type Props = NativeStackScreenProps<RootStackParamList, 'Start'>;

const { width: W, height: H } = Dimensions.get('window');

const SHAPES = [
  { x: 6,  y: 8,  size: 54, color: '#00E5FF', rot: 20 },
  { x: 74, y: 4,  size: 80, color: '#7C4DFF', rot: -15 },
  { x: 82, y: 30, size: 44, color: '#FF4081', rot: 45 },
  { x: 2,  y: 44, size: 38, color: '#00E5FF', rot: 10 },
  { x: 68, y: 54, size: 60, color: '#7C4DFF', rot: 30 },
  { x: 18, y: 62, size: 30, color: '#FF4081', rot: -20 },
];

function FloatingShape({
  x, y, size, color, rot, index,
}: { x: number; y: number; size: number; color: string; rot: number; index: number }) {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const rotAnim   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const duration = 2600 + index * 550;
    const fa = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    const ra = Animated.loop(
      Animated.timing(rotAnim, { toValue: 1, duration: 9000 + index * 1200, easing: Easing.linear, useNativeDriver: true })
    );
    const t = setTimeout(() => { fa.start(); ra.start(); }, index * 380);
    return () => { clearTimeout(t); fa.stop(); ra.stop(); };
  }, []);

  const translateY = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -18] });
  const rotate     = rotAnim.interpolate({ inputRange: [0, 1], outputRange: [`${rot}deg`, `${rot + 360}deg`] });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        borderWidth: 2,
        borderColor: color,
        borderRadius: index % 2 === 0 ? 6 : 0,
        opacity: 0.35,
        transform: [{ translateY }, { rotate }],
      }}
    />
  );
}

function PerspectiveFloor() {
  const COLS = 9;
  const ROWS = 8;
  return (
    <View style={styles.floorOuter} pointerEvents="none">
      <View style={styles.floorPerspective}>
        {Array.from({ length: ROWS + 1 }).map((_, i) => (
          <View key={`h${i}`} style={[styles.hLine, { top: `${(i / ROWS) * 100}%` }]} />
        ))}
        {Array.from({ length: COLS + 1 }).map((_, i) => (
          <View key={`v${i}`} style={[styles.vLine, { left: `${(i / COLS) * 100}%` }]} />
        ))}
      </View>
      <LinearGradient
        colors={['#060D30', 'transparent']}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
    </View>
  );
}

function formatTime(ms: number): string {
  const totalSecs = ms / 1000;
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  if (mins > 0) return `${mins}:${secs.toFixed(1).padStart(4, '0')}`;
  return `${secs.toFixed(1)}s`;
}

export function StartScreen({ navigation }: Props) {
  const game = useGame();
  const btnScale  = useRef(new Animated.Value(1)).current;
  const timeBtnScale = useRef(new Animated.Value(1)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const btnAnim   = useRef(new Animated.Value(0)).current;
  const [personalBest, setPersonalBest] = useState<LocalScore | null>(null);
  const [personalBestTime, setPersonalBestTime] = useState<TimeScore | null>(null);
  const [streak, setStreak] = useState<StreakData>({ currentStreak: 0, lastPlayedDate: '', longestStreak: 0 });
  const play = useSounds();

  useFocusEffect(
    React.useCallback(() => {
      getPersonalBest().then(setPersonalBest);
      getPersonalBestTime().then(setPersonalBestTime);
      getStreak().then(setStreak);
    }, [])
  );

  useEffect(() => {
    Animated.stagger(120, [
      Animated.spring(titleAnim, { toValue: 1, tension: 160, friction: 10, useNativeDriver: true }),
      Animated.spring(btnAnim,   { toValue: 1, tension: 160, friction: 12, useNativeDriver: true }),
    ]).start();
  }, []);

  function handlePlay(mode: GameMode, scaleAnim: Animated.Value) {
    play('click');
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1,    duration: 80, useNativeDriver: true }),
    ]).start(() => {
      game.setGameMode(mode);
      navigation.navigate('Game');
    });
  }

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#060D30', '#0E1858', '#1A2580']} style={StyleSheet.absoluteFill} />

      {SHAPES.map((s, i) => <FloatingShape key={i} {...s} index={i} />)}
      <PerspectiveFloor />
      <View style={styles.horizonGlow} pointerEvents="none" />

      {/* Streak badge — top right corner */}
      {streak.currentStreak > 0 && (
        <View style={styles.streakCorner} pointerEvents="none">
          <StreakBadge streak={streak.currentStreak} />
        </View>
      )}

      {/* Title */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: titleAnim,
            transform: [{ translateY: titleAnim.interpolate({ inputRange: [0,1], outputRange: [-30, 0] }) }],
          },
        ]}
      >
        <View style={styles.titleBox}>
          <Text style={[styles.titleWord, { color: '#00CFFF' }]}>TRIGGER</Text>
          <View style={styles.titleRow}>
            <Text style={styles.bombEmoji}>💣</Text>
            <Text style={[styles.titleWord, { color: '#FF5252' }]}>FIELD</Text>
          </View>
          <Text style={styles.tagline}>One life · No mercy</Text>
        </View>
      </Animated.View>

      {/* Buttons */}
      <Animated.View
        style={[
          styles.buttons,
          {
            opacity: btnAnim,
            transform: [{ translateY: btnAnim.interpolate({ inputRange: [0,1], outputRange: [40, 0] }) }],
          },
        ]}
      >
        {/* INFINITE MODE */}
        <Animated.View style={{ transform: [{ scale: btnScale }] }}>
          <TouchableOpacity
            style={styles.playBtn}
            onPress={() => handlePlay('infinite', btnScale)}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['rgba(0,200,255,0.25)', 'rgba(0,100,200,0.15)']}
              style={styles.playBtnGradient}
            >
              <Text style={styles.modeBtnLabel}>INFINITE MODE</Text>
              <Text style={styles.modeBtnSub}>4×7 → ∞  ·  Score attack</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* TIME MODE */}
        <Animated.View style={{ transform: [{ scale: timeBtnScale }] }}>
          <TouchableOpacity
            style={[styles.playBtn, styles.timeBtn]}
            onPress={() => handlePlay('time', timeBtnScale)}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['rgba(255,180,0,0.22)', 'rgba(200,100,0,0.12)']}
              style={styles.playBtnGradient}
            >
              <Text style={[styles.modeBtnLabel, styles.timeBtnLabel]}>TIME MODE</Text>
              <Text style={styles.modeBtnSub}>9×14  ·  Fastest clear wins</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Leaderboard */}
        <View style={styles.links}>
          <TouchableOpacity onPress={() => navigation.navigate('Leaderboard')}>
            <Text style={styles.linkText}>🏆  LEADERBOARD</Text>
          </TouchableOpacity>
        </View>

        {/* Personal bests */}
        <View style={styles.pbRow}>
          {personalBest && (
            <View style={styles.personalBest}>
              <Text style={styles.pbLabel}>INFINITE BEST</Text>
              <Text style={styles.pbScore}>{personalBest.total_score.toLocaleString()}</Text>
              <Text style={styles.pbMeta}>{personalBest.rooms_cleared} room{personalBest.rooms_cleared !== 1 ? 's' : ''} · {personalBest.player_name}</Text>
            </View>
          )}
          {personalBestTime && (
            <View style={[styles.personalBest, styles.timeBest]}>
              <Text style={[styles.pbLabel, { color: 'rgba(255,180,0,0.7)' }]}>TIME BEST</Text>
              <Text style={[styles.pbScore, { color: '#FFB300' }]}>{formatTime(personalBestTime.time_ms)}</Text>
              <Text style={styles.pbMeta}>{personalBestTime.player_name}</Text>
            </View>
          )}
          {streak.longestStreak > 0 && (
            <View style={[styles.personalBest, styles.streakBest]}>
              <Text style={[styles.pbLabel, { color: 'rgba(255,107,0,0.7)' }]}>BEST STREAK</Text>
              <Text style={[styles.pbScore, { color: '#FF6B00' }]}>{streak.longestStreak} 🔥</Text>
              <Text style={styles.pbMeta}>days</Text>
            </View>
          )}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#060D30',
  },
  floorOuter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: H * 0.38,
    overflow: 'hidden',
  },
  floorPerspective: {
    ...StyleSheet.absoluteFillObject,
    transform: [{ perspective: 500 }, { rotateX: '55deg' }, { translateY: -60 }],
  },
  hLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(180,80,255,0.45)',
  },
  vLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(180,80,255,0.45)',
  },
  horizonGlow: {
    position: 'absolute',
    bottom: H * 0.37,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#CC44FF',
    shadowColor: '#CC44FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 10,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  titleBox: {
    alignItems: 'center',
  },
  titleWord: {
    fontSize: 68,
    fontWeight: '900',
    letterSpacing: 4,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 2, height: 3 },
    textShadowRadius: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: -12,
  },
  bombEmoji: {
    fontSize: 52,
    marginTop: -4,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 2,
    marginTop: 8,
    fontWeight: '600',
  },
  buttons: {
    alignItems: 'center',
    paddingBottom: H * 0.4,
    gap: 12,
  },
  playBtn: {
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#00CFFF',
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#00CFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 16,
  },
  timeBtn: {
    borderColor: '#FFB300',
    shadowColor: '#FFB300',
  },
  playBtnGradient: {
    paddingVertical: 14,
    paddingHorizontal: 48,
    alignItems: 'center',
  },
  modeBtnLabel: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 3,
    textShadowColor: '#00CFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  timeBtnLabel: {
    textShadowColor: '#FFB300',
  },
  modeBtnSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 1,
    marginTop: 3,
    fontWeight: '600',
  },
  links: {
    alignItems: 'center',
    marginTop: 4,
  },
  linkText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  pbRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  personalBest: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,214,0,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,214,0,0.3)',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  timeBest: {
    backgroundColor: 'rgba(255,180,0,0.08)',
    borderColor: 'rgba(255,180,0,0.3)',
  },
  pbLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: 'rgba(255,214,0,0.6)',
    letterSpacing: 2,
    marginBottom: 2,
  },
  pbScore: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFD600',
    letterSpacing: 1,
    textShadowColor: '#FFD600',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  pbMeta: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.45)',
    marginTop: 2,
  },
  streakBest: {
    backgroundColor: 'rgba(255,107,0,0.08)',
    borderColor: 'rgba(255,107,0,0.3)',
  },
  streakCorner: {
    position: 'absolute',
    top: 52,
    right: 16,
    zIndex: 10,
  },
});
