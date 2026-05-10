import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

export interface LeaderboardEntry {
  player_name: string;
  total_score: number;
  rooms_cleared: number;
  max_multiplier: number;
  created_at?: string;
}

interface Props {
  entries: LeaderboardEntry[];
  highlightName?: string;
}

export function LeaderboardList({ entries, highlightName }: Props) {
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
              <Text style={[styles.score, isHighlight && styles.highlightText]}>
                {item.total_score.toLocaleString()}
              </Text>
              <Text style={styles.meta}>
                R{item.rooms_cleared} · {item.max_multiplier.toFixed(1)}x
              </Text>
            </View>
          </View>
        );
      }}
      ListEmptyComponent={<Text style={styles.empty}>No scores yet</Text>}
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
    backgroundColor: '#FFD600',
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
  score: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  meta: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
  highlightText: {
    color: '#3E2723',
  },
  empty: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.5)',
    marginTop: 20,
    fontSize: 14,
  },
});
