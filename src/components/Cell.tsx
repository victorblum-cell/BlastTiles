import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CellState } from '../lib/gameLogic';
import { FlagIcon } from './FlagIcon';
import { TileBackground, THEME_CONFIG, RoomTheme } from './TileBackground';

type ExitAnim = 'gem-burst' | 'cheese-bite' | 'fabric-fade' | 'stone-shatter' | 'juicy-pop';

function runExit(
  anim: ExitAnim,
  scale: Animated.Value, rotate: Animated.Value,
  translateY: Animated.Value, opacity: Animated.Value,
) {
  scale.setValue(1); rotate.setValue(0); translateY.setValue(0); opacity.setValue(1);

  switch (anim) {
    case 'gem-burst':
      Animated.parallel([
        Animated.timing(scale,     { toValue: 1.35, duration: 240, useNativeDriver: true }),
        Animated.timing(rotate,    { toValue: 1,    duration: 240, useNativeDriver: true }),
        Animated.timing(opacity,   { toValue: 0,    duration: 240, useNativeDriver: true }),
      ]).start(); break;

    case 'cheese-bite':
      Animated.parallel([
        Animated.timing(scale,   { toValue: 0,   duration: 280, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0,   duration: 280, useNativeDriver: true }),
      ]).start(); break;

    case 'fabric-fade':
      Animated.parallel([
        Animated.sequence([
          Animated.timing(rotate, { toValue: -0.05, duration: 75,  useNativeDriver: true }),
          Animated.timing(rotate, { toValue:  0.15, duration: 225, useNativeDriver: true }),
        ]),
        Animated.timing(scale,   { toValue: 0.3, duration: 300, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0,   duration: 300, useNativeDriver: true }),
      ]).start(); break;

    case 'stone-shatter':
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.06, duration: 55, useNativeDriver: true }),
        Animated.parallel([
          Animated.timing(scale,     { toValue: 0.55, duration: 290, useNativeDriver: true }),
          Animated.timing(rotate,    { toValue: 0.5,  duration: 290, useNativeDriver: true }),
          Animated.timing(translateY,{ toValue: 1,    duration: 290, useNativeDriver: true }),
          Animated.timing(opacity,   { toValue: 0,    duration: 270, useNativeDriver: true }),
        ]),
      ]).start(); break;

    case 'juicy-pop':
      Animated.sequence([
        Animated.timing(scale,   { toValue: 1.3, duration: 120, useNativeDriver: true }),
        Animated.parallel([
          Animated.timing(scale,   { toValue: 0.1, duration: 190, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0,   duration: 190, useNativeDriver: true }),
        ]),
      ]).start(); break;
  }
}

const NUMBER_COLORS: Record<number, string> = {
  1: '#00E5FF', 2: '#69FF47', 3: '#FF5252',
  4: '#EA80FC', 5: '#FFAB40', 6: '#18FFFF',
  7: '#FF4081', 8: '#FFFFFF',
};

interface Props {
  cell:        CellState;
  onPress:     () => void;
  size?:       number;
  roomTheme?:  RoomTheme;
  cellVariant?: number;
}

export function Cell({ cell, onPress, size = 40, roomTheme = 0, cellVariant = 0 }: Props) {
  const scaleAnim   = useRef(new Animated.Value(1)).current;
  const rotateAnim  = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const flagScale   = useRef(new Animated.Value(0)).current;

  const exitScale   = useRef(new Animated.Value(1)).current;
  const exitRotate  = useRef(new Animated.Value(0)).current;
  const exitTranslY = useRef(new Animated.Value(0)).current;
  const exitOpacity = useRef(new Animated.Value(0)).current;
  const exitThemeRef = useRef<RoomTheme>(roomTheme);

  // ── Reveal animation ────────────────────────────────────────────────────
  useEffect(() => {
    if (!cell.isRevealed) return;
    if (cell.isMine) {
      Animated.sequence([
        Animated.spring(scaleAnim, { toValue: 1.7, tension: 500, friction: 4, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1.0, tension: 200, friction: 6, useNativeDriver: true }),
      ]).start();
      return;
    }
    // Capture theme at reveal time for the exit overlay
    exitThemeRef.current = roomTheme;
    const cfg = THEME_CONFIG[roomTheme];
    exitOpacity.setValue(1);
    runExit(cfg.exitAnim, exitScale, exitRotate, exitTranslY, exitOpacity);

    scaleAnim.setValue(0.45);
    rotateAnim.setValue(-0.1);
    opacityAnim.setValue(0);
    Animated.parallel([
      Animated.spring(scaleAnim,   { toValue: 1, tension: 340, friction: 9, useNativeDriver: true }),
      Animated.spring(rotateAnim,  { toValue: 0, tension: 200, friction: 8, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 90, useNativeDriver: true }),
    ]).start();
  }, [cell.isRevealed]);

  // ── Flag animation ──────────────────────────────────────────────────────
  useEffect(() => {
    if (cell.isFlagged) {
      flagScale.setValue(0);
      Animated.spring(flagScale, { toValue: 1, tension: 380, friction: 7, useNativeDriver: true }).start();
    } else {
      Animated.timing(flagScale, { toValue: 0, duration: 100, useNativeDriver: true }).start();
    }
  }, [cell.isFlagged]);

  const cfg = THEME_CONFIG[roomTheme];
  const rotate     = rotateAnim.interpolate({ inputRange: [-1, 1], outputRange: ['-60deg', '60deg'] });
  const exitRot    = exitRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] });
  const exitTransY = exitTranslY.interpolate({ inputRange: [0, 1], outputRange: [0, size * 3.5] });

  const isHidden   = !cell.isRevealed;
  const isFlagged  = cell.isFlagged && !cell.isRevealed;
  const isRevealed = cell.isRevealed && !cell.isMine;
  const isMine     = cell.isRevealed && cell.isMine;

  const radius    = Math.max(4, Math.round(size * 0.18));
  const textSize  = Math.max(10, Math.round(size * 0.44));
  const emojiSize = Math.max(9,  Math.round(size * 0.38));

  const exitCfg        = THEME_CONFIG[exitThemeRef.current];
  const exitBorderRadius = exitCfg.exitAnim === 'cheese-bite' ? size / 2 : radius;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      disabled={cell.isRevealed && !cell.isMine}
    >
      <Animated.View
        style={[
          styles.cell,
          { width: size, height: size, borderRadius: radius },
          // ── Hidden cell border (3-D raised look) ──
          isHidden && {
            borderBottomWidth: 3,
            borderRightWidth:  2,
            borderBottomColor: cfg.hiddenBotColor,
            borderRightColor:  cfg.hiddenRightColor,
            elevation:         cfg.elevation,
            shadowColor:       cfg.shadowColor,
            shadowOpacity:     cfg.shadowOpacity,
            shadowOffset:      { width: 0, height: 2 },
            shadowRadius:      4,
          },
          // ── Revealed cell ──
          isRevealed && {
            borderWidth:  1,
            borderColor:  cfg.revealedBorder,
          },
          // ── Mine (always red) ──
          isMine && styles.mine,
          { opacity: opacityAnim, transform: [{ scale: scaleAnim }, { rotate }] },
        ]}
      >
        {/* ── Themed tile background (hidden & revealed) ── */}
        {!isMine && (
          <TileBackground
            theme={roomTheme}
            variant={cellVariant}
            isRevealed={cell.isRevealed}
            size={size}
          />
        )}

        {/* ── Gloss highlight on top (marble & melon only) ── */}
        {isHidden && cfg.gloss && (
          <View style={[
            styles.gloss,
            { borderRadius: radius - 1, backgroundColor: cfg.gloss },
          ]} />
        )}

        {/* ── Flag ── */}
        {isFlagged && (
          <Animated.View style={{ transform: [{ scale: flagScale }] }}>
            <FlagIcon size={emojiSize} poleColor={cfg.flagPoleColor} flagColor="#FF3B30" />
          </Animated.View>
        )}

        {/* ── Mine ── */}
        {isMine && <Text style={[styles.cellText, { fontSize: emojiSize }]}>💣</Text>}

        {/* ── Number ── */}
        {isRevealed && cell.adjacentMines > 0 && (
          <Text style={[
            styles.number,
            { fontSize: textSize, color: NUMBER_COLORS[cell.adjacentMines] ?? '#fff' },
          ]}>
            {cell.adjacentMines}
          </Text>
        )}

        {/* ── Exit animation overlay ── */}
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            {
              borderRadius: exitBorderRadius,
              backgroundColor: exitCfg.exitColor,
              opacity:   exitOpacity,
              transform: [
                { scale:      exitScale  },
                { rotate:     exitRot    },
                { translateY: exitTransY },
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
    top: 2, left: 3, right: 3,
    height: '38%',
  },
  number: {
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cellText: {
    fontWeight: '800',
  },
});
