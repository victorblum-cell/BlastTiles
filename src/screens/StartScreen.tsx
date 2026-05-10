import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Start'>;

export function StartScreen({ navigation }: Props) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  function handlePress() {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.93, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start(() => navigation.navigate('Game'));
  }

  return (
    <LinearGradient colors={['#6C63FF', '#3D5AFE', '#00B0FF']} style={styles.container}>
      <View style={styles.titleBlock}>
        <Text style={styles.title}>TRIGGER</Text>
        <Text style={styles.titleAccent}>FIELD</Text>
        <Text style={styles.subtitle}>One life. No mercy.</Text>
      </View>

      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity style={styles.playButton} onPress={handlePress} activeOpacity={0.85}>
          <Text style={styles.playText}>PLAY</Text>
        </TouchableOpacity>
      </Animated.View>

      <TouchableOpacity onPress={() => navigation.navigate('Leaderboard')} style={styles.lbButton}>
        <Text style={styles.lbText}>🏆 Leaderboard</Text>
      </TouchableOpacity>

      <View style={styles.rulesBox}>
        <Text style={styles.ruleText}>7 × 12 grid · 18 mines · 1 life</Text>
        <Text style={styles.ruleText}>Clear rooms to raise your multiplier</Text>
        <Text style={styles.ruleText}>Long press to flag · First tap is safe</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  titleBlock: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 52,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 6,
  },
  titleAccent: {
    fontSize: 52,
    fontWeight: '900',
    color: '#FFD600',
    letterSpacing: 6,
    marginTop: -10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 8,
    letterSpacing: 1,
  },
  playButton: {
    backgroundColor: '#FFD600',
    borderRadius: 30,
    paddingVertical: 18,
    paddingHorizontal: 80,
    elevation: 8,
    shadowColor: '#FFD600',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
  },
  playText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#3E2723',
    letterSpacing: 4,
  },
  lbButton: {
    marginTop: 24,
  },
  lbText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
  },
  rulesBox: {
    position: 'absolute',
    bottom: 48,
    alignItems: 'center',
    gap: 4,
  },
  ruleText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.5,
  },
});
