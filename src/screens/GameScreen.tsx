import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { ComboText } from '../components/ComboText';
import { MinesweeperGrid } from '../components/MinesweeperGrid';
import { ModeToggle, CellMode } from '../components/ModeToggle';
import { MultiplierBadge } from '../components/MultiplierBadge';
import { ScoreDisplay } from '../components/ScoreDisplay';
import { TutorialOverlay } from '../components/TutorialOverlay';
import { useGame } from '../context/GameContext';
import { useTimer } from '../hooks/useTimer';
import { useTutorial } from '../hooks/useTutorial';

type Props = NativeStackScreenProps<RootStackParamList, 'Game'>;

export function GameScreen({ navigation }: Props) {
  const game = useGame();
  const { elapsed, reset: resetTimer } = useTimer(game.phase === 'playing');
  const prevPhase = useRef(game.phase);
  const tutorial = useTutorial();
  const [mode, setMode] = useState<CellMode>('reveal');

  // Entrance animations (native driver — transform + opacity only)
  const headerAnim = useRef(new Animated.Value(0)).current;
  const scoreAnim  = useRef(new Animated.Value(0)).current;
  const gridAnim   = useRef(new Animated.Value(0)).current;
  const toggleAnim = useRef(new Animated.Value(0)).current;

  // Tutorial glow (JS driver — opacity only, isolated view)
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const glowLoop    = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    Animated.stagger(55, [
      Animated.spring(headerAnim, { toValue: 1, tension: 180, friction: 12, useNativeDriver: true }),
      Animated.spring(scoreAnim,  { toValue: 1, tension: 180, friction: 12, useNativeDriver: true }),
      Animated.spring(gridAnim,   { toValue: 1, tension: 160, friction: 14, useNativeDriver: true }),
      Animated.spring(toggleAnim, { toValue: 1, tension: 180, friction: 12, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (prevPhase.current === game.phase) return;
    prevPhase.current = game.phase;
    if (game.phase === 'cleared') navigation.navigate('RoomClear');
    if (game.phase === 'dead')    navigation.navigate('GameOver');
  }, [game.phase]);

  useEffect(() => {
    if (game.phase === 'playing') { resetTimer(); setMode('reveal'); }
  }, [game.roomNumber]);

  useEffect(() => {
    glowLoop.current?.stop();
    if (tutorial.highlight === 'none') { glowOpacity.setValue(0); return; }
    glowOpacity.setValue(0);
    glowLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, { toValue: 1, duration: 600, useNativeDriver: false }),
        Animated.timing(glowOpacity, { toValue: 0.15, duration: 600, useNativeDriver: false }),
      ])
    );
    glowLoop.current.start();
    return () => glowLoop.current?.stop();
  }, [tutorial.highlight]);

  function GlowOverlay({ area }: { area: typeof tutorial.highlight }) {
    if (tutorial.highlight !== area) return null;
    return (
      <Animated.View
        style={[styles.glowOverlay, { opacity: glowOpacity }]}
        pointerEvents="none"
      />
    );
  }

  const slide = (anim: Animated.Value, dy: number) => ({
    opacity: anim,
    transform: [{
      translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [dy, 0] }),
    }],
  });

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#060D30', '#080F3A', '#0D1550']} style={StyleSheet.absoluteFill} />

      {/* Header row */}
      <Animated.View style={[styles.header, slide(headerAnim, -20)]}>
        <Text style={styles.roomLabel}>ROOM {game.roomNumber}</Text>
        <MultiplierBadge multiplier={game.multiplier} />
        <GlowOverlay area="multiplier" />
      </Animated.View>

      {/* Score boxes */}
      <Animated.View style={slide(scoreAnim, -14)}>
        <ScoreDisplay
          totalScore={game.totalScore}
          roomPoints={game.roomPoints}
          remainingMines={game.remainingMines}
          elapsed={elapsed}
        />
        <GlowOverlay area="score" />
      </Animated.View>

      {/* Neon-bordered grid */}
      <Animated.View style={[styles.gridWrapper, slide(gridAnim, 28)]}>
        <View style={styles.gridBorder}>
          <MinesweeperGrid
            board={game.board}
            onReveal={tutorial.visible ? () => {} : game.handleReveal}
            onFlag={tutorial.visible ? () => {} : game.handleFlag}
            mode={mode}
            isGameOver={game.phase === 'dead'}
          />
          <GlowOverlay area="grid" />
        </View>
        <ComboText streak={game.streak} />
      </Animated.View>

      {/* Mode toggle */}
      <Animated.View style={slide(toggleAnim, 36)}>
        <ModeToggle mode={mode} onModeChange={setMode} />
      </Animated.View>

      <TutorialOverlay
        visible={tutorial.visible}
        step={tutorial.step}
        totalSteps={tutorial.totalSteps}
        config={tutorial.currentStep}
        onNext={tutorial.nextStep}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 52,
    paddingHorizontal: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  roomLabel: {
    fontSize: 20,
    fontWeight: '900',
    color: '#00E5FF',
    letterSpacing: 3,
    textShadowColor: '#00E5FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  gridWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
  },
  gridBorder: {
    borderWidth: 2.5,
    borderColor: '#7B2FFF',
    borderRadius: 12,
    padding: 4,
    elevation: 10,
    shadowColor: '#7B2FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    backgroundColor: '#0A1040',
  },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFD600',
    backgroundColor: 'rgba(255,214,0,0.06)',
  },
});
