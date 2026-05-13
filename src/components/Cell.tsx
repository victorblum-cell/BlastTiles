import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CellState } from '../lib/gameLogic';
import { FlagIcon } from './FlagIcon';

// ---------- Skin definitions ----------
export interface SkinDef {
  hiddenBg:   string;
  hiddenBot:  string;  // bottom/right shadow border
  borderColor: string;
  gloss:      string;
  exitAnim:   'gem-burst' | 'cheese-bite' | 'fabric-fade' | 'stone-shatter' | 'juicy-pop';
}

export const TILE_SKINS: SkinDef[] = [
  // 0 NEON
  { hiddenBg: '#3D4EC8', hiddenBot: '#1E2A80', borderColor: '#00E5FF', gloss: 'rgba(0,229,255,0.18)',   exitAnim: 'gem-burst'     },
  // 1 CHEESE
  { hiddenBg: '#D4960A', hiddenBot: '#8B5E04', borderColor: '#F5C842', gloss: 'rgba(245,200,66,0.25)',  exitAnim: 'cheese-bite'   },
  // 2 FABRIC
  { hiddenBg: '#4A5568', hiddenBot: '#2D3748', borderColor: '#A0AEC0', gloss: 'rgba(160,174,192,0.18)', exitAnim: 'fabric-fade'   },
  // 3 STONE
  { hiddenBg: '#5A6880', hiddenBot: '#2E3650', borderColor: '#CBD5E0', gloss: 'rgba(190,200,232,0.15)', exitAnim: 'stone-shatter' },
  // 4 CANDY
  { hiddenBg: '#C53030', hiddenBot: '#742A2A', borderColor: '#FC8181', gloss: 'rgba(252,129,129,0.22)', exitAnim: 'gem-burst'     },
  // 5 MELON
  { hiddenBg: '#2D7A50', hiddenBot: '#1A4A32', borderColor: '#68D391', gloss: 'rgba(104,211,145,0.22)', exitAnim: 'juicy-pop'     },
  // 6 EMERALD
  { hiddenBg: '#1A6B42', hiddenBot: '#0D3D25', borderColor: '#48BB78', gloss: 'rgba(72,187,120,0.22)',  exitAnim: 'gem-burst'     },
  // 7 AMETHYST
  { hiddenBg: '#553C9A', hiddenBot: '#2D1E5C', borderColor: '#B794F4', gloss: 'rgba(183,148,244,0.22)', exitAnim: 'gem-burst'     },
];

// ---------- Exit animation runner ----------
function runExit(
  anim: 'gem-burst' | 'cheese-bite' | 'fabric-fade' | 'stone-shatter' | 'juicy-pop',
  scale: Animated.Value,
  rotate: Animated.Value,
  translateY: Animated.Value,
  opacity: Animated.Value,
) {
  scale.setValue(1);
  rotate.setValue(0);
  translateY.setValue(0);
  opacity.setValue(1);

  switch (anim) {
    case 'gem-burst':
      Animated.parallel([
        Animated.timing(scale,      { toValue: 1.35, duration: 260, useNativeDriver: true }),
        Animated.timing(rotate,     { toValue: 1,    duration: 260, useNativeDriver: true }),
        Animated.timing(opacity,    { toValue: 0,    duration: 260, useNativeDriver: true }),
      ]).start();
      break;

    case 'cheese-bite':
      // Circle scales down from full to nothing
      Animated.timing(scale, { toValue: 0, duration: 300, useNativeDriver: true }).start();
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }).start();
      break;

    case 'fabric-fade':
      Animated.parallel([
        Animated.sequence([
          Animated.timing(rotate, { toValue: -0.05, duration: 80,  useNativeDriver: true }),
          Animated.timing(rotate, { toValue: 0.15,  duration: 220, useNativeDriver: true }),
        ]),
        Animated.timing(scale,   { toValue: 0.3, duration: 300, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0,   duration: 300, useNativeDriver: true }),
      ]).start();
      break;

    case 'stone-shatter':
      Animated.sequence([
        Animated.timing(scale,      { toValue: 1.06,  duration: 60,  useNativeDriver: true }),
        Animated.parallel([
          Animated.timing(scale,      { toValue: 0.6,   duration: 300, useNativeDriver: true }),
          Animated.timing(rotate,     { toValue: 0.5,   duration: 300, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 1,     duration: 300, useNativeDriver: true }),
          Animated.timing(opacity,    { toValue: 0,     duration: 280, useNativeDriver: true }),
        ]),
      ]).start();
      break;

    case 'juicy-pop':
      Animated.sequence([
        Animated.timing(scale,   { toValue: 1.3, duration: 130, useNativeDriver: true }),
        Animated.parallel([
          Animated.timing(scale,   { toValue: 0.1, duration: 200, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0,   duration: 200, useNativeDriver: true }),
        ]),
      ]).start();
      break;
  }
}

// ---------- Number colours ----------
const NUMBER_COLORS: Record<number, string> = {
  1: '#00E5FF', 2: '#69FF47', 3: '#FF5252',
  4: '#EA80FC', 5: '#FFAB40', 6: '#18FFFF',
  7: '#FF4081', 8: '#FFFFFF',
};

interface Props {
  cell:      CellState;
  onPress:   () => void;
  size?:     number;
  skinIndex?: number;
}

export function Cell({ cell, onPress, size = 40, skinIndex = 0 }: Props) {
  const scaleAnim   = useRef(new Animated.Value(1)).current;
  const rotateAnim  = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const flagScale   = useRef(new Animated.Value(0)).current;

  // Exit overlay animations
  const exitScale     = useRef(new Animated.Value(1)).current;
  const exitRotate    = useRef(new Animated.Value(0)).current;
  const exitTranslY   = useRef(new Animated.Value(0)).current;
  const exitOpacity   = useRef(new Animated.Value(0)).current;  // 0 = hidden by default
  const exitSkinRef   = useRef(0);

  // Cell reveal pop animation
  useEffect(() => {
    if (!cell.isRevealed) return;
    if (cell.isMine) {
      Animated.sequence([
        Animated.spring(scaleAnim, { toValue: 1.7, tension: 500, friction: 4, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1.0, tension: 200, friction: 6, useNativeDriver: true }),
      ]).start();
    } else {
      // Capture skin at reveal time and fire exit overlay
      exitSkinRef.current = skinIndex;
      exitOpacity.setValue(1);
      const skin = TILE_SKINS[skinIndex];
      runExit(skin.exitAnim, exitScale, exitRotate, exitTranslY, exitOpacity);

      scaleAnim.setValue(0.45);
      rotateAnim.setValue(-0.1);
      opacityAnim.setValue(0);
      Animated.parallel([
        Animated.spring(scaleAnim,   { toValue: 1, tension: 340, friction: 9, useNativeDriver: true }),
        Animated.spring(rotateAnim,  { toValue: 0, tension: 200, friction: 8, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 90,              useNativeDriver: true }),
      ]).start();
    }
  }, [cell.isRevealed]);

  // Flag bounce animation
  useEffect(() => {
    if (cell.isFlagged) {
      flagScale.setValue(0);
      Animated.spring(flagScale, { toValue: 1, tension: 380, friction: 7, useNativeDriver: true }).start();
    } else {
      Animated.timing(flagScale, { toValue: 0, duration: 100, useNativeDriver: true }).start();
    }
  }, [cell.isFlagged]);

  const rotate     = rotateAnim.interpolate({ inputRange: [-1, 1], outputRange: ['-60deg', '60deg'] });
  const exitRot    = exitRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] });
  const exitTransY = exitTranslY.interpolate({ inputRange: [0, 1], outputRange: [0, size * 3.5] });

  const skin = TILE_SKINS[skinIndex];

  const isHidden   = !cell.isRevealed;
  const isFlagged  = cell.isFlagged && !cell.isRevealed;
  const isRevealed = cell.isRevealed && !cell.isMine;
  const isMine     = cell.isRevealed && cell.isMine;

  const radius    = Math.max(4, Math.round(size * 0.20));
  const textSize  = Math.max(10, Math.round(size * 0.44));
  const emojiSize = Math.max(9,  Math.round(size * 0.38));

  // Exit overlay shape: circle for cheese-bite, rect for others
  const exitSkin        = TILE_SKINS[exitSkinRef.current];
  const isCheese        = exitSkin.exitAnim === 'cheese-bite';
  const exitBorderRadius = isCheese ? size / 2 : radius;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75} disabled={cell.isRevealed && !cell.isMine}>
      <Animated.View
        style={[
          styles.cell,
          { width: size, height: size, borderRadius: radius },
          isHidden && {
            backgroundColor: skin.hiddenBg,
            borderBottomColor: skin.hiddenBot,
            borderRightColor:  skin.hiddenBot,
            borderBottomWidth: 3,
            borderRightWidth: 2,
          },
          isRevealed && styles.revealed,
          isMine     && styles.mine,
          { opacity: opacityAnim, transform: [{ scale: scaleAnim }, { rotate }] },
        ]}
      >
        {isHidden && <View style={[styles.gloss, { borderRadius: radius - 2, backgroundColor: skin.gloss }]} />}
        {isHidden && !isFlagged && <Text style={[styles.question, { fontSize: textSize }]}>?</Text>}

        {isFlagged && (
          <Animated.View style={{ transform: [{ scale: flagScale }] }}>
            <FlagIcon size={emojiSize} poleColor="#FFFFFF" flagColor="#FF3B30" />
          </Animated.View>
        )}

        {isMine && <Text style={[styles.cellText, { fontSize: emojiSize }]}>💣</Text>}

        {isRevealed && cell.adjacentMines > 0 && (
          <Text style={[styles.number, { fontSize: textSize, color: NUMBER_COLORS[cell.adjacentMines] ?? '#fff' }]}>
            {cell.adjacentMines}
          </Text>
        )}

        {/* Exit overlay — skin flies away on reveal */}
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            {
              borderRadius: exitBorderRadius,
              backgroundColor: exitSkin.hiddenBg,
              opacity:   exitOpacity,
              transform: [
                { scale:      exitScale     },
                { rotate:     exitRot       },
                { translateY: exitTransY    },
              ],
            },
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cell: {
    margin: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
  revealed: {
    backgroundColor: '#0A1245',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  mine: {
    backgroundColor: '#FF3B30',
    elevation: 8,
    shadowColor: '#FF3B30',
    shadowOpacity: 0.9,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  gloss: {
    position: 'absolute',
    top: 2,
    left: 3,
    right: 3,
    height: '40%',
  },
  question: {
    fontWeight: '900',
    color: 'rgba(255,255,255,0.55)',
  },
  number: {
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cellText: {
    fontWeight: '800',
  },
});
