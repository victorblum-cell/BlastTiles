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
import { RootStackParamList, GameMode } from '../../App';
import { LeaderboardList, LeaderboardEntry } from '../components/LeaderboardList';
import { TimeLeaderboardList, TimeLeaderboardEntry } from '../components/TimeLeaderboardList';
import { fetchGlobalLeaderboard, fetchGlobalTimeLeaderboard } from '../lib/supabase';
import { getLocalScores, getLocalTimeScores } from '../lib/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Leaderboard'>;

export function LeaderboardScreen({ route, navigation }: Props) {
  const highlightName = route.params?.highlightName;
  const initialMode: GameMode = route.params?.mode ?? 'infinite';

  const [modeTab, setModeTab] = useState<GameMode>(initialMode);
  const [scopeTab, setScopeTab] = useState<'global' | 'local'>('global');

  const [globalInfinite, setGlobalInfinite] = useState<LeaderboardEntry[]>([]);
  const [localInfinite, setLocalInfinite] = useState<LeaderboardEntry[]>([]);
  const [globalTime, setGlobalTime] = useState<TimeLeaderboardEntry[]>([]);
  const [localTime, setLocalTime] = useState<TimeLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [gInf, lInf, gTime, lTime] = await Promise.all([
        fetchGlobalLeaderboard(),
        getLocalScores(),
        fetchGlobalTimeLeaderboard(),
        getLocalTimeScores(),
      ]);
      setGlobalInfinite(gInf);
      setLocalInfinite(lInf);
      setGlobalTime(gTime);
      setLocalTime(lTime);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <LinearGradient colors={['#311B92', '#4527A0', '#6A1B9A']} style={styles.container}>
      <Text style={styles.title}>🏆 LEADERBOARD</Text>

      {/* Mode tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, modeTab === 'infinite' && styles.activeTab]}
          onPress={() => setModeTab('infinite')}
        >
          <Text style={[styles.tabText, modeTab === 'infinite' && styles.activeTabText]}>INFINITE</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, modeTab === 'time' && styles.activeTimeTab]}
          onPress={() => setModeTab('time')}
        >
          <Text style={[styles.tabText, modeTab === 'time' && styles.activeTimeTabText]}>⏱ TIME</Text>
        </TouchableOpacity>
      </View>

      {/* Scope tabs */}
      <View style={[styles.tabs, styles.scopeTabs]}>
        <TouchableOpacity
          style={[styles.tab, scopeTab === 'global' && styles.activeScopeTab]}
          onPress={() => setScopeTab('global')}
        >
          <Text style={[styles.tabText, scopeTab === 'global' && styles.activeScopeTabText]}>Global Top 50</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, scopeTab === 'local' && styles.activeScopeTab]}
          onPress={() => setScopeTab('local')}
        >
          <Text style={[styles.tabText, scopeTab === 'local' && styles.activeScopeTabText]}>Local Top 20</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color="#FFD600" style={{ marginTop: 40 }} />
      ) : modeTab === 'infinite' ? (
        <LeaderboardList
          entries={scopeTab === 'global' ? globalInfinite : localInfinite}
          highlightName={highlightName}
        />
      ) : (
        <TimeLeaderboardList
          entries={scopeTab === 'global' ? globalTime : localTime}
          highlightName={highlightName}
        />
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
    marginBottom: 16,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    marginBottom: 8,
    padding: 4,
  },
  scopeTabs: {
    marginBottom: 12,
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
  activeTimeTab: {
    backgroundColor: '#FFB300',
  },
  activeScopeTab: {
    backgroundColor: 'rgba(255,255,255,0.2)',
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
  activeTimeTabText: {
    color: '#1A0A00',
    fontWeight: '800',
  },
  activeScopeTabText: {
    color: '#fff',
    fontWeight: '700',
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
