import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

// Tier thresholds: 0=1–49, 1=50–99, 2=100–149, 3=150+
interface TierConfig {
  numColor: string;
  shadowColor: string;
  shadowRadius: number;
  bg: string;
  border: string;
  flames: string;        // emoji(s) shown after the number
  badgeLabel?: string;   // optional label under the badge (50+, 100+, 150+)
  pulse: boolean;
  rotate: boolean;
}

const TIERS: TierConfig[] = [
  // Tier 0: 1–49  — classic orange fire
  {
    numColor: '#FF6B00',
    shadowColor: '#FF6B00',
    shadowRadius: 8,
    bg: 'rgba(255,107,0,0.12)',
    border: 'rgba(255,107,0,0.4)',
    flames: '🔥',
    pulse: false,
    rotate: false,
  },
  // Tier 1: 50–99  — golden flame
  {
    numColor: '#FFD600',
    shadowColor: '#FFD600',
    shadowRadius: 14,
    bg: 'rgba(255,214,0,0.14)',
    border: 'rgba(255,214,0,0.55)',
    flames: '🔥',
    badgeLabel: 'GOLD',
    pulse: false,
    rotate: false,
  },
  // Tier 2: 100–149  — blue inferno (hottest flame = blue)
  {
    numColor: '#00E5FF',
    shadowColor: '#00CFFF',
    shadowRadius: 20,
    bg: 'rgba(0,200,255,0.13)',
    border: 'rgba(0,229,255,0.6)',
    flames: '🔥🔥',
    badgeLabel: 'INFERNO',
    pulse: true,
    rotate: false,
  },
  // Tier 3: 150+  — legendary purple/magenta
  {
    numColor: '#FF44FF',
    shadowColor: '#FF00FF',
    shadowRadius: 26,
    bg: 'rgba(200,0,255,0.14)',
    border: 'rgba(255,0,255,0.6)',
    flames: '🔥🔥🔥',
    badgeLabel: 'LEGEND',
    pulse: true,
    rotate: true,
  },
];

interface Props {
  streak: number;
  size?: 'normal' | 'large';
}

export function StreakBadge({ streak, size = 'normal' }: Props) {
  if (streak <= 0) return null;

  const tier = streak >= 150 ? 3 : streak >= 100 ? 2 : streak >= 50 ? 1 : 0;
  const cfg = TIERS[tier];

  const pulseAnim  = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim   = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    if (cfg.pulse) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.06, duration: 700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0.96, duration: 700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      ).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
          Animated.timing(glowAnim, { toValue: 0.5, duration: 700, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        ])
      ).start();
    }
    if (cfg.rotate) {
      Animated.loop(
        Animated.timing(rotateAnim, { toValue: 1, duration: 4000, easing: Easing.linear, useNativeDriver: true })
      ).start();
    }
  }, [tier]);

  const rotate = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const isLarge = size === 'large';

  return (
    <Animated.View
      style={[
        styles.badge,
        isLarge && styles.badgeLarge,
        {
          backgroundColor: cfg.bg,
          borderColor: cfg.border,
        },
        cfg.pulse && { transform: [{ scale: pulseAnim }] },
      ]}
    >
      {/* Number */}
      <Text
        style={[
          styles.number,
          isLarge && styles.numberLarge,
          {
            color: cfg.numColor,
            textShadowColor: cfg.shadowColor,
            textShadowRadius: cfg.shadowRadius,
          },
        ]}
      >
        {streak}
      </Text>

      {/* Flames (optionally rotating for tier 3) */}
      {cfg.rotate ? (
        <Animated.Text style={[styles.flames, isLarge && styles.flamesLarge, { transform: [{ rotate }] }]}>
          {cfg.flames}
        </Animated.Text>
      ) : (
        <Text style={[styles.flames, isLarge && styles.flamesLarge]}>{cfg.flames}</Text>
      )}

      {/* Tier label (50+, 100+, 150+) */}
      {cfg.badgeLabel && (
        <Text style={[styles.tierLabel, { color: cfg.numColor }]}>{cfg.badgeLabel}</Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  badgeLarge: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 2,
  },
  number: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
    textShadowOffset: { width: 0, height: 0 },
  },
  numberLarge: {
    fontSize: 28,
  },
  flames: {
    fontSize: 18,
  },
  flamesLarge: {
    fontSize: 26,
  },
  tierLabel: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginLeft: 2,
    alignSelf: 'center',
    opacity: 0.85,
  },
});
