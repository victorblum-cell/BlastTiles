import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

interface Props {
  streak: number;
}

export function ComboText({ streak }: Props) {
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (streak < 2) return;
    opacityAnim.setValue(1);
    translateY.setValue(0);
    scaleAnim.setValue(1.3);
    Animated.parallel([
      Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(600),
        Animated.parallel([
          Animated.timing(opacityAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: -20, duration: 300, useNativeDriver: true }),
        ]),
      ]),
    ]).start();
  }, [streak]);

  if (streak < 2) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: opacityAnim, transform: [{ translateY }, { scale: scaleAnim }] },
      ]}
    >
      <Text style={styles.text}>COMBO x{streak}!</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 80,
    alignSelf: 'center',
    zIndex: 100,
    backgroundColor: '#FF6D00',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 8,
    elevation: 10,
    pointerEvents: 'none',
  },
  text: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2,
  },
});
