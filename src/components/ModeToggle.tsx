import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type CellMode = 'reveal' | 'flag';

interface Props {
  mode: CellMode;
  onModeChange: (mode: CellMode) => void;
}

export function ModeToggle({ mode, onModeChange }: Props) {
  const [buttonWidth, setButtonWidth] = useState(0);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const revealScale = useRef(new Animated.Value(1.05)).current;
  const flagScale = useRef(new Animated.Value(0.95)).current;
  const revealTextOpacity = useRef(new Animated.Value(1)).current;
  const flagTextOpacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const toReveal = mode === 'reveal';
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: toReveal ? 0 : buttonWidth,
        useNativeDriver: false,
        tension: 220,
        friction: 14,
      }),
      Animated.spring(revealScale, {
        toValue: toReveal ? 1.05 : 0.95,
        useNativeDriver: true,
        tension: 260,
        friction: 10,
      }),
      Animated.spring(flagScale, {
        toValue: toReveal ? 0.95 : 1.05,
        useNativeDriver: true,
        tension: 260,
        friction: 10,
      }),
      Animated.timing(revealTextOpacity, {
        toValue: toReveal ? 1 : 0.5,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.timing(flagTextOpacity, {
        toValue: toReveal ? 0.5 : 1,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start();
  }, [mode, buttonWidth]);

  function handlePress(newMode: CellMode) {
    if (newMode === mode) return;
    onModeChange(newMode);
  }

  return (
    <View style={styles.wrapper}>
      <View
        style={styles.container}
        onLayout={e => setButtonWidth(e.nativeEvent.layout.width / 2)}
      >
        {/* Sliding highlight pill */}
        {buttonWidth > 0 && (
          <Animated.View
            style={[
              styles.indicator,
              { width: buttonWidth - 6, left: slideAnim },
            ]}
          />
        )}

        {/* Reveal / Shovel */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => handlePress('reveal')}
          activeOpacity={0.75}
        >
          <Animated.View
            style={[styles.buttonInner, { transform: [{ scale: revealScale }] }]}
          >
            <Text style={styles.icon}>⛏️</Text>
            <Animated.Text style={[styles.label, { opacity: revealTextOpacity }]}>
              REVEAL
            </Animated.Text>
          </Animated.View>
        </TouchableOpacity>

        {/* Flag */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => handlePress('flag')}
          activeOpacity={0.75}
        >
          <Animated.View
            style={[styles.buttonInner, { transform: [{ scale: flagScale }] }]}
          >
            <Text style={styles.icon}>🚩</Text>
            <Animated.Text style={[styles.label, { opacity: flagTextOpacity }]}>
              FLAG
            </Animated.Text>
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    paddingTop: 8,
  },
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: 4,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    borderRadius: 16,
    backgroundColor: '#FFD600',
    elevation: 4,
    shadowColor: '#FFD600',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.55,
    shadowRadius: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 16,
    zIndex: 1,
  },
  buttonInner: {
    alignItems: 'center',
    gap: 2,
  },
  icon: {
    fontSize: 22,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1.5,
  },
});
