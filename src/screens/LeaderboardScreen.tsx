import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { LeaderboardList, LeaderboardEntry } from '../components/LeaderboardList';
import { fetchGlobalLeaderboard } from '../lib/supabase';
import { getLocalScores } from '../lib/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Leaderboard'>;

export function LeaderboardScreen({ route, navigation }: Props) {
  const highlightName = route.params?.highlightName;
  const [tab, setTab] = useState<'global' | 'local'>('global');
  const [globalEntries, setGlobalEntries] = useState<LeaderboardEntry[]>([]);
  const [localEntries, setLocalEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [global, local] = await Promise.all([fetchGlobalLeaderboard(), getLocalScores()]);
      setGlobalEntries(global);
      setLocalEntries(local);
      setLoading(false);
    }
    load();
  }, []);

  const entries = tab === 'global' ? globalEntries : localEntries;

  return (
    <LinearGradient colors={['#311B92', '#4527A0', '#6A1B9A']} style={styles.container}>
      <Text style={styles.title}>🏆 LEADERBOARD</Text>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'global' && styles.activeTab]}
          onPress={() => setTab('global')}
        >
          <Text style={[styles.tabText, tab === 'global' && styles.activeTabText]}>Global Top 50</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'local' && styles.activeTab]}
          onPress={() => setTab('local')}
        >
          <Text style={[styles.tabText, tab === 'local' && styles.activeTabText]}>Local Top 20</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color="#FFD600" style={{ marginTop: 40 }} />
      ) : (
        <LeaderboardList entries={entries} highlightName={highlightName} />
      )}

      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.popToTop()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 20,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    marginBottom: 16,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#FFD600',
  },
  tabText: {
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    fontSize: 14,
  },
  activeTabText: {
    color: '#3E2723',
    fontWeight: '800',
  },
  backBtn: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  backText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
    fontWeight: '600',
  },
});
