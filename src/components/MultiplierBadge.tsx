import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

interface Props {
  multiplier: number;
}

export function MultiplierBadge({ multiplier }: Props) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim  = useRef(new Animated.Value(0)).current;
  const prevMultiplier = useRef(multiplier);

  useEffect(() => {
    if (multiplier === prevMultiplier.current) return;
    prevMultiplier.current = multiplier;

    Animated.sequence([
      Animated.parallel([
        Animated.spring(pulseAnim, { toValue: 1.45, tension: 400, friction: 5, useNativeDriver: true }),
        Animated.timing(glowAnim,  { toValue: 1, duration: 120, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(pulseAnim, { toValue: 1, tension: 200, friction: 8, useNativeDriver: true }),
        Animated.timing(glowAnim,  { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  }, [multiplier]);

  return (
    <Animated.View style={[styles.badge, { transform: [{ scale: pulseAnim }] }]}>
      <Text style={styles.label}>MULT</Text>
      <Text style={styles.value}>{multiplier.toFixed(1)}×</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: 'rgba(255,214,0,0.15)',
    borderWidth: 1.5,
    borderColor: '#FFD600',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 5,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#FFD600',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  label: {
    fontSize: 9,
    fontWeight: '800',
    color: 'rgba(255,214,0,0.75)',
    letterSpacing: 2,
  },
  value: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFD600',
    textShadowColor: '#FFD600',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
});
