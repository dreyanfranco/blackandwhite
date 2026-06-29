import { ReactNode } from 'react';
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
import { theme } from '@/lib/theme';
import { CardChip, JerseyTile, StatDot } from '@/components/kit';
import { EmptyState } from '@/components/ui';

type Cell = {
  key: keyof LeaderRow;
  label: string;
  indicator: ReactNode;
};

const CELLS: Cell[] = [
  { key: 'goals', label: 'Goals', indicator: <StatDot color={theme.colors.goal} size={6} /> },
  { key: 'assists', label: 'Assists', indicator: <StatDot color={theme.colors.assist} size={6} /> },
  { key: 'manOfTheMatch', label: 'MOTM', indicator: <StatDot color={theme.colors.motm} size={6} /> },
  { key: 'appearances', label: 'Apps', indicator: <StatDot color={theme.colors.textMuted} size={6} /> },
  { key: 'yellowCards', label: 'Yellow', indicator: <CardChip color={theme.colors.yellow} /> },
  { key: 'redCards', label: 'Red', indicator: <CardChip color={theme.colors.red} /> },
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
            <View style={{ marginBottom: 8 }}>
              <View style={styles.header}>
                <JerseyTile number={row.jerseyNumber} size={56} radius={12} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.name} numberOfLines={2}>
                    {row.name}
                  </Text>
                  <Text style={styles.sub}>
                    {[
                      row.position,
                      row.jerseyNumber != null && `No. ${row.jerseyNumber}`,
                      `${row.appearances} apps`,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </Text>
                </View>
              </View>

              <View style={styles.grid}>
                {CELLS.map((c) => (
                  <View key={c.key} style={styles.statCard}>
                    <Text style={styles.statValue}>{row[c.key] as number}</Text>
                    <View style={styles.statLabelRow}>
                      {c.indicator}
                      <Text style={styles.statLabel}>{c.label}</Text>
                    </View>
                  </View>
                ))}
              </View>

              <Text style={styles.historyTitle}>HISTORY</Text>
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
  const parts: { node: ReactNode; key: string }[] = [];
  if (entry.goals)
    parts.push({ key: 'g', node: <Pill color={theme.colors.goal} value={entry.goals} /> });
  if (entry.assists)
    parts.push({ key: 'a', node: <Pill color={theme.colors.assist} value={entry.assists} /> });
  if (entry.manOfTheMatch)
    parts.push({ key: 'm', node: <Pill color={theme.colors.motm} value="MOTM" /> });
  if (entry.yellowCards)
    parts.push({ key: 'y', node: <Pill card={theme.colors.yellow} value={entry.yellowCards} /> });
  if (entry.redCards)
    parts.push({ key: 'r', node: <Pill card={theme.colors.red} value={entry.redCards} /> });

  const date = new Date(entry.createdAt).toLocaleDateString();
  const title = entry.match ? `vs ${entry.match.opponent}` : 'General';

  return (
    <View style={styles.histRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.histTitle}>{title}</Text>
        <View style={styles.histStats}>
          {parts.length ? (
            parts.map((p) => <View key={p.key}>{p.node}</View>)
          ) : (
            <Text style={styles.histEmpty}>No contributions logged</Text>
          )}
        </View>
        {entry.note ? <Text style={styles.histNote}>“{entry.note}”</Text> : null}
      </View>
      <Text style={styles.histDate}>{date}</Text>
    </View>
  );
}

function Pill({
  color,
  card,
  value,
}: {
  color?: string;
  card?: string;
  value: number | string;
}) {
  return (
    <View style={styles.pill}>
      {card ? <CardChip color={card} /> : <StatDot color={color!} size={7} />}
      <Text style={styles.pillText}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  list: { padding: 20, paddingBottom: 32, gap: 10 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 22 },
  name: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
    textTransform: 'uppercase',
    lineHeight: 24,
  },
  sub: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 6,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: {
    width: '31.5%',
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statValue: {
    color: theme.colors.text,
    fontSize: 30,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  statLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  statLabel: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  historyTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 24,
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
  histStats: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  histEmpty: { color: theme.colors.faint, fontSize: 13 },
  histNote: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 8,
  },
  histDate: { color: theme.colors.faint, fontSize: 12 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  pillText: { color: theme.colors.text, fontSize: 12, fontWeight: '700' },
});
