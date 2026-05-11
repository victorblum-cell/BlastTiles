import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { TutorialStepConfig } from '../hooks/useTutorial';

interface Props {
  visible: boolean;
  step: number;
  totalSteps: number;
  config: TutorialStepConfig;
  onNext: () => void;
}

export function TutorialOverlay({ visible, step, totalSteps, config, onNext }: Props) {
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Per-step card animations
  const cardSlide = useRef(new Animated.Value(80)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.88)).current;
  const emojiScale = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(1)).current;
  const arrowBounce = useRef(new Animated.Value(0)).current;

  // Backdrop fade in once
  useEffect(() => {
    if (visible) {
      Animated.timing(backdropOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    }
  }, [visible]);

  // Animate card on every step change
  useEffect(() => {
    if (!visible) return;

    cardSlide.setValue(config.cardPosition === 'top' ? -70 : 70);
    cardOpacity.setValue(0);
    cardScale.setValue(0.88);
    emojiScale.setValue(0);
    arrowBounce.setValue(0);

    Animated.parallel([
      Animated.spring(cardSlide, { toValue: 0, tension: 180, friction: 13, useNativeDriver: true }),
      Animated.timing(cardOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.spring(cardScale, { toValue: 1, tension: 200, friction: 11, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(160),
        Animated.spring(emojiScale, { toValue: 1.15, tension: 350, friction: 6, useNativeDriver: true }),
        Animated.spring(emojiScale, { toValue: 1, tension: 200, friction: 8, useNativeDriver: true }),
      ]),
    ]).start(() => {
      // Arrow bounce loop after card lands
      if (config.cardPosition !== 'center') {
        Animated.loop(
          Animated.sequence([
            Animated.timing(arrowBounce, { toValue: 8, duration: 420, useNativeDriver: true }),
            Animated.timing(arrowBounce, { toValue: 0, duration: 420, useNativeDriver: true }),
          ])
        ).start();
      }
    });
  }, [step, visible]);

  function handleNext() {
    Animated.sequence([
      Animated.spring(btnScale, { toValue: 0.9, useNativeDriver: true, tension: 400, friction: 6 }),
      Animated.spring(btnScale, { toValue: 1, useNativeDriver: true, tension: 300, friction: 8 }),
    ]).start();
    // Slide card out before calling onNext
    Animated.parallel([
      Animated.timing(cardOpacity, { toValue: 0, duration: 140, useNativeDriver: true }),
      Animated.timing(cardSlide, {
        toValue: config.cardPosition === 'top' ? -40 : 40,
        duration: 140,
        useNativeDriver: true,
      }),
    ]).start(onNext);
  }

  const isTop = config.cardPosition === 'top';
  const isCenter = config.cardPosition === 'center';
  const accent = config.danger ? '#FF5252' : '#FFD600';
  const cardBg = config.danger ? 'rgba(140,10,10,0.97)' : 'rgba(22,14,72,0.97)';
  const btnBg = config.danger ? '#FF5252' : '#FFD600';
  const btnTextColor = config.danger ? '#fff' : '#3E2723';

  const arrowDir = isTop
    ? [{ translateY: arrowBounce }]
    : [{ translateY: Animated.multiply(arrowBounce, -1) }];

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>

        {/* Arrow indicator — top card points DOWN toward grid */}
        {isTop && (
          <Animated.View style={[styles.arrowWrapper, styles.arrowBottom, { transform: arrowDir }]}>
            <Text style={[styles.arrowText, { color: accent }]}>▼</Text>
          </Animated.View>
        )}

        {/* Card */}
        <Animated.View
          style={[
            styles.card,
            isTop ? styles.cardTop : isCenter ? styles.cardCenter : styles.cardBottom,
            {
              backgroundColor: cardBg,
              borderColor: accent,
              opacity: cardOpacity,
              transform: [{ translateY: cardSlide }, { scale: cardScale }],
            },
          ]}
        >
          <Animated.Text style={[styles.emoji, { transform: [{ scale: emojiScale }] }]}>
            {config.emoji}
          </Animated.Text>

          <Text style={[styles.title, { color: accent }]}>{config.title}</Text>
          <Text style={styles.body}>{config.body}</Text>

          {/* Step dots */}
          <View style={styles.dots}>
            {Array.from({ length: totalSteps }).map((_, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  i === step && { width: 24, backgroundColor: accent },
                ]}
              />
            ))}
          </View>

          <Animated.View style={{ transform: [{ scale: btnScale }], width: '100%' }}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: btnBg }]}
              onPress={handleNext}
              activeOpacity={0.85}
            >
              <Text style={[styles.buttonText, { color: btnTextColor }]}>
                {config.buttonLabel}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        {/* Arrow indicator — bottom card points UP toward header */}
        {!isTop && !isCenter && (
          <Animated.View style={[styles.arrowWrapper, styles.arrowTop, { transform: arrowDir }]}>
            <Text style={[styles.arrowText, { color: accent }]}>▲</Text>
          </Animated.View>
        )}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.80)',
  },
  card: {
    marginHorizontal: 16,
    borderRadius: 26,
    borderWidth: 2,
    padding: 26,
    alignItems: 'center',
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
  },
  cardBottom: {
    position: 'absolute',
    bottom: 44,
    left: 16,
    right: 16,
  },
  cardTop: {
    position: 'absolute',
    top: 64,
    left: 16,
    right: 16,
  },
  cardCenter: {
    position: 'absolute',
    top: '22%',
    left: 16,
    right: 16,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 52,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 1.5,
    marginBottom: 12,
    lineHeight: 26,
  },
  body: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.88)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 20,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  button: {
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    elevation: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  arrowWrapper: {
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
  },
  arrowBottom: {
    bottom: 310,
  },
  arrowTop: {
    top: 72,
  },
  arrowText: {
    fontSize: 30,
    fontWeight: '900',
  },
});
