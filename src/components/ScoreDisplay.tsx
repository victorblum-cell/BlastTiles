import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

interface Props {
  totalScore: number;
  roomPoints: number;
}

export function ScoreDisplay({ totalScore, roomPoints }: Props) {
  const target = totalScore + roomPoints;
  const [displayed, setDisplayed] = useState(target);
  const displayedRef = useRef(target);
  const prevTarget   = useRef(target);
  const glowAnim     = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (target === prevTarget.current) return;
    const from = displayedRef.current;
    prevTarget.current = target;

    // Cyan glow pulse
    glowAnim.setValue(1);
    Animated.timing(glowAnim, { toValue: 0, duration: 900, useNativeDriver: false }).start();

    // Roll-up counter (800ms, ease-out cubic)
    const DURATION = 800;
    const TICK     = 16;
    const steps    = Math.ceil(DURATION / TICK);
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const t = step / steps;
      const eased = 1 - Math.pow(1 - t, 3);
      const cur = Math.round(from + (target - from) * eased);
      displayedRef.current = cur;
      setDisplayed(cur);
      if (step >= steps) {
        clearInterval(timer);
        displayedRef.current = target;
        setDisplayed(target);
      }
    }, TICK);

    return () => clearInterval(timer);
  }, [target]);

  const glowRadius = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 32] });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>SCORE</Text>
      <Animated.Text style={[styles.value, { textShadowRadius: glowRadius }]}>
        {displayed.toLocaleString()}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(0,229,255,0.7)',
    letterSpacing: 3,
    marginBottom: 2,
  },
  value: {
    fontSize: 48,
    fontWeight: '900',
    color: '#00E5FF',
    letterSpacing: 2,
    textShadowColor: '#00E5FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
});
