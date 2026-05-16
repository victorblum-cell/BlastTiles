import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Asset } from 'expo-asset';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { ALL_TILE_ASSETS } from './src/components/TileBackground';
import { GameProvider } from './src/context/GameContext';
import { GameOverScreen } from './src/screens/GameOverScreen';
import { GameScreen } from './src/screens/GameScreen';
import { LeaderboardScreen } from './src/screens/LeaderboardScreen';
import { RoomClearScreen } from './src/screens/RoomClearScreen';
import { StartScreen } from './src/screens/StartScreen';
import { TimeCompleteScreen } from './src/screens/TimeCompleteScreen';

export type { GameMode } from './src/hooks/useGameState';

export type RootStackParamList = {
  Start: undefined;
  Game: undefined;
  RoomClear: undefined;
  GameOver: undefined;
  TimeComplete: undefined;
  Leaderboard: { highlightName?: string; mode?: GameMode } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Asset.loadAsync(ALL_TILE_ASSETS)
      .catch(() => {}) // silently continue if preload fails
      .finally(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: '#060D30', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#00E5FF" />
      </View>
    );
  }

  return (
    <GameProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Start"
          screenOptions={{ headerShown: false, animation: 'fade' }}
        >
          <Stack.Screen name="Start" component={StartScreen} />
          <Stack.Screen name="Game" component={GameScreen} />
          <Stack.Screen
            name="RoomClear"
            component={RoomClearScreen}
            options={{ animation: 'slide_from_bottom', gestureEnabled: false }}
          />
          <Stack.Screen
            name="GameOver"
            component={GameOverScreen}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen
            name="TimeComplete"
            component={TimeCompleteScreen}
            options={{ animation: 'slide_from_bottom', gestureEnabled: false }}
          />
          <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GameProvider>
  );
}
