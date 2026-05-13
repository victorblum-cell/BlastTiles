import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

const LABELS = [
  'NICE', 'GOOD', 'COOL', 'GREAT',
  'STRONG', 'AWESOME', 'INCREDIBLE', 'UNBELIEVABLE',
];
const COLORS = ['#00E5FF', '#69FF47', '#FFD600', '#FF4081', '#7C4DFF'];

interface Props {
  streak: number;
}

export function ComboText({ streak }: Props) {
  const scaleAnim   = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  // Track which streak triggered the last animation so re-triggering same streak works
  const lastStreak  = useRef(0);

  useEffect(() => {
    if (streak < 1 || streak === lastStreak.current) return;
    lastStreak.current = streak;

    scaleAnim.stopAnimation();
    opacityAnim.stopAnimation();
    scaleAnim.setValue(0);
    opacityAnim.setValue(1);

    // Phase 1 (0–18 ms):  scale 0 → 1.15  (quick pop)
    // Phase 2 (18–412 ms): scale 1.15 → 1.0 (settle)
    // Phase 3 (412–750 ms): scale 1.0 → 0.1 + opacity → 0
    Animated.sequence([
      Animated.timing(scaleAnim,   { toValue: 1.15, duration: 18,  useNativeDriver: true }),
      Animated.timing(scaleAnim,   { toValue: 1.0,  duration: 394, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(scaleAnim,   { toValue: 0.1, duration: 338, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0,   duration: 338, useNativeDriver: true }),
      ]),
    ]).start(() => { lastStreak.current = 0; });
  }, [streak]);

  if (streak < 1) return null;

  const label = LABELS[Math.min(streak - 1, LABELS.length - 1)];
  const color = COLORS[(streak - 1) % COLORS.length];

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        { opacity: opacityAnim, transform: [{ scale: scaleAnim }] },
      ]}
    >
      {/* Triple-glow layers */}
      <Text style={[styles.glow3, { color, textShadowColor: color }]}>{label}</Text>
      <Text style={[styles.glow2, { color, textShadowColor: color }]}>{label}</Text>
      <Text style={[styles.text,  { color, textShadowColor: color }]}>{label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 56,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    pointerEvents: 'none',
  },
  // Each layer overlaid — same position, increasing shadow radius for triple-glow
  glow3: {
    position: 'absolute',
    fontSize: 52,
    fontWeight: '900',
    letterSpacing: 3,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 32,
  },
  glow2: {
    position: 'absolute',
    fontSize: 52,
    fontWeight: '900',
    letterSpacing: 3,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  text: {
    fontSize: 52,
    fontWeight: '900',
    letterSpacing: 3,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
});
