import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { api, LeaderRow, LeaderboardSort } from '@/lib/api';
import { useApi } from '@/lib/useApi';
import { STAT_META, StatKey, theme } from '@/lib/theme';
import { Avatar, EmptyState } from '@/components/ui';

const SORTS: StatKey[] = [
  'goals',
  'assists',
  'manOfTheMatch',
  'appearances',
  'yellowCards',
  'redCards',
];

export default function LeaderboardScreen() {
  const [sort, setSort] = useState<LeaderboardSort>('goals');
  const { data, error, loading, reload } = useApi<LeaderRow[]>(
    () => api.getLeaderboard(sort),
    [sort],
  );
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}>
        {SORTS.map((key) => {
          const active = sort === key;
          return (
            <Pressable
              key={key}
              onPress={() => setSort(key)}
              style={[styles.chip, active && styles.chipActive]}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {STAT_META[key].emoji} {STAT_META[key].label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {loading && !data ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={theme.colors.text} />
      ) : error ? (
        <EmptyState title="Couldn't load leaderboard" subtitle={error} />
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(item) => item.playerId}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={reload}
              tintColor={theme.colors.text}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title="No players yet"
              subtitle="Add players in the Roster tab to get started."
            />
          }
          renderItem={({ item, index }) => (
            <Row
              row={item}
              rank={index + 1}
              sort={sort}
              onPress={() => router.push(`/player/${item.playerId}`)}
            />
          )}
        />
      )}
    </View>
  );
}

function Row({
  row,
  rank,
  sort,
  onPress,
}: {
  row: LeaderRow;
  rank: number;
  sort: LeaderboardSort;
  onPress: () => void;
}) {
  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;
  const meta = STAT_META[sort as StatKey];
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}>
      <Text style={styles.rank}>{medal ?? rank}</Text>
      <Avatar name={row.name} />
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{row.name}</Text>
        <Text style={styles.sub}>
          ⚽ {row.goals}  ·  🎯 {row.assists}  ·  ⭐ {row.manOfTheMatch}  ·  👕{' '}
          {row.appearances}
        </Text>
      </View>
      <View style={styles.bigStat}>
        <Text style={[styles.bigStatValue, { color: meta.color }]}>
          {row[sort as keyof LeaderRow] as number}
        </Text>
        <Text style={styles.bigStatLabel}>{meta.short}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  chips: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipActive: { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent },
  chipText: { color: theme.colors.textMuted, fontWeight: '600', fontSize: 13 },
  chipTextActive: { color: theme.colors.onAccent },
  list: { paddingHorizontal: 16, paddingBottom: 32, gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 12,
  },
  rank: {
    width: 26,
    textAlign: 'center',
    color: theme.colors.textMuted,
    fontWeight: '800',
    fontSize: 16,
  },
  name: { color: theme.colors.text, fontSize: 16, fontWeight: '700' },
  sub: { color: theme.colors.textMuted, fontSize: 12, marginTop: 3 },
  bigStat: { alignItems: 'center', minWidth: 48 },
  bigStatValue: { fontSize: 22, fontWeight: '900' },
  bigStatLabel: { color: theme.colors.textMuted, fontSize: 11, fontWeight: '600' },
});
