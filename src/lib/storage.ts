import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCAL_SCORES_KEY = 'tf_local_scores';
const PLAYER_NAME_KEY = 'tf_player_name';
const TUTORIAL_SEEN_KEY = 'tf_tutorial_seen';

export interface LocalScore {
  player_name: string;
  total_score: number;
  rooms_cleared: number;
  max_multiplier: number;
  created_at: string;
}

export async function getLocalScores(): Promise<LocalScore[]> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_SCORES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveLocalScore(score: Omit<LocalScore, 'created_at'>): Promise<void> {
  try {
    const scores = await getLocalScores();
    const entry: LocalScore = { ...score, created_at: new Date().toISOString() };
    const updated = [entry, ...scores]
      .sort((a, b) => b.total_score - a.total_score)
      .slice(0, 20);
    await AsyncStorage.setItem(LOCAL_SCORES_KEY, JSON.stringify(updated));
  } catch {}
}

export async function getSavedPlayerName(): Promise<string> {
  try {
    return (await AsyncStorage.getItem(PLAYER_NAME_KEY)) ?? '';
  } catch {
    return '';
  }
}

export async function savePlayerName(name: string): Promise<void> {
  try {
    await AsyncStorage.setItem(PLAYER_NAME_KEY, name);
  } catch {}
}

export async function hasSeenTutorial(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(TUTORIAL_SEEN_KEY)) === 'true';
  } catch {
    return false;
  }
}

export async function markTutorialSeen(): Promise<void> {
  try {
    await AsyncStorage.setItem(TUTORIAL_SEEN_KEY, 'true');
  } catch {}
}
