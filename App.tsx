import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { GameProvider } from './src/context/GameContext';
import { GameOverScreen } from './src/screens/GameOverScreen';
import { GameScreen } from './src/screens/GameScreen';
import { LeaderboardScreen } from './src/screens/LeaderboardScreen';
import { RoomClearScreen } from './src/screens/RoomClearScreen';
import { StartScreen } from './src/screens/StartScreen';

export type RootStackParamList = {
  Start: undefined;
  Game: undefined;
  RoomClear: undefined;
  GameOver: undefined;
  Leaderboard: { highlightName?: string } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
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
          <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GameProvider>
  );
}
