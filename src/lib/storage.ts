import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCAL_SCORES_KEY = 'tf_local_scores';
const LOCAL_TIME_SCORES_KEY = 'tf_local_time_scores';
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

export async function getPersonalBest(): Promise<LocalScore | null> {
  const scores = await getLocalScores();
  return scores.length > 0 ? scores[0] : null;
}

export interface TimeScore {
  player_name: string;
  time_ms: number;
  created_at: string;
}

export async function getLocalTimeScores(): Promise<TimeScore[]> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_TIME_SCORES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveLocalTimeScore(score: Omit<TimeScore, 'created_at'>): Promise<void> {
  try {
    const scores = await getLocalTimeScores();
    const entry: TimeScore = { ...score, created_at: new Date().toISOString() };
    const updated = [entry, ...scores]
      .sort((a, b) => a.time_ms - b.time_ms)
      .slice(0, 20);
    await AsyncStorage.setItem(LOCAL_TIME_SCORES_KEY, JSON.stringify(updated));
  } catch {}
}

export async function getPersonalBestTime(): Promise<TimeScore | null> {
  const scores = await getLocalTimeScores();
  return scores.length > 0 ? scores[0] : null;
}

// ── Daily streak ──────────────────────────────────────────────────────────

const STREAK_KEY = 'tf_streak';

export interface StreakData {
  currentStreak: number;
  lastPlayedDate: string; // 'YYYY-MM-DD'
  longestStreak: number;
}

function todayString(): string {
  return new Date().toISOString().split('T')[0];
}

function yesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

export async function getStreak(): Promise<StreakData> {
  try {
    const raw = await AsyncStorage.getItem(STREAK_KEY);
    if (!raw) return { currentStreak: 0, lastPlayedDate: '', longestStreak: 0 };
    return JSON.parse(raw);
  } catch {
    return { currentStreak: 0, lastPlayedDate: '', longestStreak: 0 };
  }
}

/** Call once per game session (room cleared, board completed, or mine hit). */
export async function recordPlay(): Promise<StreakData> {
  const data = await getStreak();
  const today = todayString();

  if (data.lastPlayedDate === today) return data; // already counted today

  const newStreak = data.lastPlayedDate === yesterdayString()
    ? data.currentStreak + 1  // consecutive day
    : 1;                       // gap or first ever

  const updated: StreakData = {
    currentStreak: newStreak,
    lastPlayedDate: today,
    longestStreak: Math.max(newStreak, data.longestStreak),
  };
  try {
    await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(updated));
  } catch {}
  return updated;
}
