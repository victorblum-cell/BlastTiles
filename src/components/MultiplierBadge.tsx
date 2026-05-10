import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

interface Props {
  multiplier: number;
}

export function MultiplierBadge({ multiplier }: Props) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const prevMultiplier = useRef(multiplier);

  useEffect(() => {
    if (multiplier !== prevMultiplier.current) {
      prevMultiplier.current = multiplier;
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.4, duration: 150, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.9, duration: 100, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 100, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();
    }
  }, [multiplier]);

  return (
    <Animated.View style={[styles.badge, { transform: [{ scale: pulseAnim }] }]}>
      <Text style={styles.label}>MULTIPLIER</Text>
      <Text style={styles.value}>{multiplier.toFixed(1)}x</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: '#FFD600',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 6,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#FFD600',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: '#5D4037',
    letterSpacing: 1.5,
  },
  value: {
    fontSize: 22,
    fontWeight: '900',
    color: '#3E2723',
  },
});
