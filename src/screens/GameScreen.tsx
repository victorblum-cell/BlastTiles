import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { ComboText } from '../components/ComboText';
import { MinesweeperGrid } from '../components/MinesweeperGrid';
import { ModeToggle, CellMode } from '../components/ModeToggle';
import { MultiplierBadge } from '../components/MultiplierBadge';
import { ScoreDisplay } from '../components/ScoreDisplay';
import { TutorialOverlay } from '../components/TutorialOverlay';
import { SettingsModal } from '../components/SettingsModal';
import { TILE_SKINS } from '../components/Cell';
import { useGame } from '../context/GameContext';
import { useSounds } from '../hooks/useSounds';
import { useTutorial } from '../hooks/useTutorial';

type Props = NativeStackScreenProps<RootStackParamList, 'Game'>;

export function GameScreen({ navigation }: Props) {
  const game = useGame();
  const prevPhase = useRef(game.phase);
  const tutorial = useTutorial();
  const play = useSounds();
  const [mode, setMode] = useState<CellMode>('reveal');
  const [settingsOpen, setSettingsOpen] = useState(false);

  const prevStreak = useRef(game.streak);
  const prevMultiplier = useRef(game.multiplier);

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
    if (game.phase === 'dead') {
      // Small delay so the mine explosion sound can start before screen transition
      setTimeout(() => navigation.navigate('GameOver'), 320);
    }
  }, [game.phase]);

  useEffect(() => {
    if (game.streak > prevStreak.current && game.streak >= 2) play('combo');
    prevStreak.current = game.streak;
  }, [game.streak]);

  useEffect(() => {
    if (game.multiplier > prevMultiplier.current) play('multiplier');
    prevMultiplier.current = game.multiplier;
  }, [game.multiplier]);

  useEffect(() => {
    if (game.phase === 'playing') { setMode('reveal'); }
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

  function handleRevealWithSound(row: number, col: number) {
    const cell = game.board[row]?.[col];
    if (!cell || cell.isRevealed || cell.isFlagged) return;
    play(cell.isMine ? 'mine' : 'reveal');
    game.handleReveal(row, col);
  }

  function handleFlagWithSound(row: number, col: number) {
    const cell = game.board[row]?.[col];
    if (!cell || cell.isRevealed) return;
    play(cell.isFlagged ? 'unflag' : 'flag');
    game.handleFlag(row, col);
  }

  // Skin cycles every 5 reveals (8 skins total)
  const skinIndex = Math.floor(game.revealCount / 5) % 8;

  // Compute cell size so the grid fits the screen at every room size
  const cols = game.board[0]?.length ?? 4;
  const rows = game.board.length ?? 7;
  const { width: SW, height: SH } = Dimensions.get('window');
  const availW = SW - 64;          // container padding + border + 40px margin
  const availH = SH - 440;         // header + score + toggle + 120px bottom reserve + safe area + 40px margin
  const sizeFromW = Math.floor(availW / cols) - 4;
  const sizeFromH = Math.floor(availH / rows) - 4;
  const cellSize = Math.max(20, Math.min(52, sizeFromW, sizeFromH));

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
        <View style={styles.headerRight}>
          <MultiplierBadge multiplier={game.multiplier} />
          <TouchableOpacity
            style={styles.gearBtn}
            onPress={() => setSettingsOpen(true)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.gearIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>
        <GlowOverlay area="multiplier" />
      </Animated.View>

      {/* Score boxes */}
      <Animated.View style={slide(scoreAnim, -14)}>
        <ScoreDisplay
          totalScore={game.totalScore}
          roomPoints={game.roomPoints}
        />
        <GlowOverlay area="score" />
      </Animated.View>

      {/* Neon-bordered grid */}
      <Animated.View style={[styles.gridWrapper, slide(gridAnim, 28)]}>
        <View style={[styles.gridBorder, { borderColor: TILE_SKINS[skinIndex].borderColor, shadowColor: TILE_SKINS[skinIndex].borderColor }]}>
          <MinesweeperGrid
            board={game.board}
            onReveal={tutorial.visible ? () => {} : handleRevealWithSound}
            onFlag={tutorial.visible ? () => {} : handleFlagWithSound}
            mode={mode}
            isGameOver={game.phase === 'dead'}
            cellSize={cellSize}
            skinIndex={skinIndex}
          />
          <GlowOverlay area="grid" />
        </View>
        <ComboText streak={game.streak} />
      </Animated.View>

      {/* Mode toggle */}
      <Animated.View style={slide(toggleAnim, 36)}>
        <ModeToggle mode={mode} onModeChange={setMode} />
      </Animated.View>

      {/* 120px bottom reserve — shifts grid + toggle upward */}
      <View style={{ height: 120 }} />

      <TutorialOverlay
        visible={tutorial.visible}
        step={tutorial.step}
        totalSteps={tutorial.totalSteps}
        config={tutorial.currentStep}
        onNext={tutorial.nextStep}
      />

      <SettingsModal
        visible={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onHome={() => {
          setSettingsOpen(false);
          navigation.navigate('Start');
        }}
        onReplay={() => {
          setSettingsOpen(false);
          game.restartGame();
        }}
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  gearBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearIcon: {
    fontSize: 18,
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
