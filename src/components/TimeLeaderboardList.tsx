import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

export interface TimeLeaderboardEntry {
  player_name: string;
  time_ms: number;
  created_at?: string;
}

interface Props {
  entries: TimeLeaderboardEntry[];
  highlightName?: string;
}

function formatTime(ms: number): string {
  const totalSecs = ms / 1000;
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  if (mins > 0) return `${String(mins).padStart(2, '0')}:${secs.toFixed(2).padStart(5, '0')}`;
  return `${secs.toFixed(2)}s`;
}

export function TimeLeaderboardList({ entries, highlightName }: Props) {
  return (
    <FlatList
      data={entries}
      keyExtractor={(_, i) => String(i)}
      renderItem={({ item, index }) => {
        const isHighlight = item.player_name === highlightName;
        return (
          <View style={[styles.row, isHighlight && styles.highlightRow]}>
            <Text style={[styles.rank, isHighlight && styles.highlightText]}>
              {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
            </Text>
            <Text style={[styles.name, isHighlight && styles.highlightText]} numberOfLines={1}>
              {item.player_name}
            </Text>
            <View style={styles.right}>
              <Text style={[styles.time, isHighlight && styles.highlightText]}>
                {formatTime(item.time_ms)}
              </Text>
              <Text style={[styles.meta, isHighlight && styles.highlightMeta]}>
                9 × 14
              </Text>
            </View>
          </View>
        );
      }}
      ListEmptyComponent={<Text style={styles.empty}>No times yet</Text>}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 6,
  },
  highlightRow: {
    backgroundColor: '#FFB300',
  },
  rank: {
    width: 36,
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  name: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 6,
  },
  right: {
    alignItems: 'flex-end',
  },
  time: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFD600',
  },
  meta: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
  highlightText: {
    color: '#1A0A00',
  },
  highlightMeta: {
    color: 'rgba(0,0,0,0.5)',
  },
  empty: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.5)',
    marginTop: 20,
    fontSize: 14,
  },
});
