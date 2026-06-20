import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { api, LeaderRow, StatEntry } from '@/lib/api';
import { useApi } from '@/lib/useApi';
import { STAT_META, StatKey, theme } from '@/lib/theme';
import { Avatar, Card, EmptyState } from '@/components/ui';

const TOTAL_KEYS: StatKey[] = [
  'goals',
  'assists',
  'manOfTheMatch',
  'appearances',
  'yellowCards',
  'redCards',
];

export default function PlayerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const board = useApi<LeaderRow[]>(() => api.getLeaderboard('goals'), []);
  const history = useApi<StatEntry[]>(() => api.getPlayerStats(id), [id]);

  const row = board.data?.find((r) => r.playerId === id);
  const loading = board.loading && !board.data;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: row?.name ?? 'Player' }} />
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={theme.colors.text} />
      ) : !row ? (
        <EmptyState title="Player not found" />
      ) : (
        <FlatList
          data={history.data ?? []}
          keyExtractor={(e) => e._id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={{ gap: 16, marginBottom: 8 }}>
              <View style={styles.header}>
                <Avatar name={row.name} size={64} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{row.name}</Text>
                  <Text style={styles.sub}>
                    {[row.position, row.jerseyNumber != null && `#${row.jerseyNumber}`]
                      .filter(Boolean)
                      .join('  ·  ') || 'Squad player'}
                  </Text>
                </View>
              </View>

              <View style={styles.grid}>
                {TOTAL_KEYS.map((key) => (
                  <Card key={key} style={styles.statCard}>
                    <Text style={[styles.statValue, { color: STAT_META[key].color }]}>
                      {row[key]}
                    </Text>
                    <Text style={styles.statLabel}>
                      {STAT_META[key].emoji} {STAT_META[key].label}
                    </Text>
                  </Card>
                ))}
              </View>

              <Text style={styles.historyTitle}>History</Text>
            </View>
          }
          ListEmptyComponent={
            <EmptyState
              title="No entries yet"
              subtitle="Add stats for this player in the Add Stats tab."
            />
          }
          renderItem={({ item }) => <HistoryRow entry={item} />}
        />
      )}
    </View>
  );
}

function HistoryRow({ entry }: { entry: StatEntry }) {
  const parts: string[] = [];
  if (entry.goals) parts.push(`⚽ ${entry.goals}`);
  if (entry.assists) parts.push(`🎯 ${entry.assists}`);
  if (entry.manOfTheMatch) parts.push('⭐ MOTM');
  if (entry.yellowCards) parts.push(`🟨 ${entry.yellowCards}`);
  if (entry.redCards) parts.push(`🟥 ${entry.redCards}`);

  const date = new Date(entry.createdAt).toLocaleDateString();
  const title = entry.match ? `vs ${entry.match.opponent}` : 'General';

  return (
    <View style={styles.histRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.histTitle}>{title}</Text>
        <Text style={styles.histStats}>
          {parts.length ? parts.join('   ') : 'No contributions logged'}
        </Text>
        {entry.note ? <Text style={styles.histNote}>“{entry.note}”</Text> : null}
      </View>
      <Text style={styles.histDate}>{date}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  list: { padding: 16, paddingBottom: 32, gap: 10 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  name: { color: theme.colors.text, fontSize: 24, fontWeight: '900' },
  sub: { color: theme.colors.textMuted, fontSize: 14, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: {
    width: '31%',
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 14,
  },
  statValue: { fontSize: 26, fontWeight: '900' },
  statLabel: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  historyTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 6,
  },
  histRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14,
  },
  histTitle: { color: theme.colors.text, fontSize: 15, fontWeight: '700' },
  histStats: { color: theme.colors.textMuted, fontSize: 14, marginTop: 4 },
  histNote: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 4,
  },
  histDate: { color: theme.colors.textMuted, fontSize: 12 },
});
