import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface ScoreEntry {
  id?: string;
  player_name: string;
  total_score: number;
  rooms_cleared: number;
  max_multiplier: number;
  created_at?: string;
}

export async function submitScore(entry: Omit<ScoreEntry, 'id' | 'created_at'>): Promise<void> {
  await supabase.from('scores').insert([entry]);
}

export async function fetchGlobalLeaderboard(): Promise<ScoreEntry[]> {
  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .order('total_score', { ascending: false })
    .limit(50);
  if (error) return [];
  return data ?? [];
}
