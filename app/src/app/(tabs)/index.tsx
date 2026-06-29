import { useMemo, useState } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api, LeaderRow } from '@/lib/api';
import { useApi } from '@/lib/useApi';
import { theme } from '@/lib/theme';
import { Brand, CountUp, Eyebrow, JerseyTile, StatDot } from '@/components/kit';
import { EmptyState } from '@/components/ui';

type MetricKey = 'goals' | 'assists' | 'motm' | 'apps' | 'cards';

const METRICS: {
  key: MetricKey;
  label: string;
  hero: string;
  color: string;
  get: (r: LeaderRow) => number;
}[] = [
  { key: 'goals', label: 'Goals', hero: 'Golden Boot', color: theme.colors.goal, get: (r) => r.goals },
  { key: 'assists', label: 'Assists', hero: 'Playmaker', color: theme.colors.assist, get: (r) => r.assists },
  { key: 'motm', label: 'MOTM', hero: 'Star Man', color: theme.colors.motm, get: (r) => r.manOfTheMatch },
  { key: 'apps', label: 'Apps', hero: 'Ever-present', color: theme.colors.textMuted, get: (r) => r.appearances },
  { key: 'cards', label: 'Cards', hero: 'Most Booked', color: theme.colors.red, get: (r) => r.yellowCards + r.redCards * 2 },
];

const META = (k: MetricKey) => METRICS.find((m) => m.key === k)!;

export default function LeaderboardScreen() {
  const [sort, setSort] = useState<MetricKey>('goals');
  const { data, error, loading, reload } = useApi<LeaderRow[]>(
    () => api.getLeaderboard('goals'),
    [],
  );
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const metric = META(sort);

  const sorted = useMemo(() => {
    const rows = data ? [...data] : [];
    return rows.sort((a, b) => {
      const d = metric.get(b) - metric.get(a);
      return d !== 0 ? d : a.name.localeCompare(b.name);
    });
  }, [data, metric]);

  const leader = sorted[0];

  return (
    <View style={styles.container}>
      {loading && !data ? (
        <ActivityIndicator style={{ marginTop: 48 }} color={theme.colors.text} />
      ) : error ? (
        <EmptyState title="Couldn't load leaderboard" subtitle={error} />
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(item) => item.playerId}
          contentContainerStyle={[styles.list, { paddingTop: insets.top }]}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={reload}
              tintColor={theme.colors.text}
            />
          }
          ListHeaderComponent={
            <View>
              <Brand
                right={
                  <Pressable
                    onPress={() => router.push('/settings')}
                    hitSlop={10}
                    style={styles.pinBtn}>
                    <Text style={styles.pinBtnText}>PIN</Text>
                  </Pressable>
                }
              />

              {leader ? (
                <Hero leader={leader} metric={metric} />
              ) : null}

              <View style={styles.standingsHead}>
                <View>
                  <Text style={styles.h2}>STANDINGS</Text>
                  <Text style={styles.h2sub}>
                    {sorted.length} players · tap a row to open a profile
                  </Text>
                </View>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tabs}>
                {METRICS.map((m) => {
                  const on = m.key === sort;
                  return (
                    <Pressable
                      key={m.key}
                      onPress={() => setSort(m.key)}
                      style={[styles.tab, on && styles.tabOn]}>
                      <Text style={[styles.tabText, on && styles.tabTextOn]}>
                        {m.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
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
              metric={metric}
              onPress={() => router.push(`/player/${item.playerId}`)}
            />
          )}
        />
      )}
    </View>
  );
}

function Hero({ leader, metric }: { leader: LeaderRow; metric: (typeof METRICS)[number] }) {
  const [first, ...rest] = leader.name.split(' ');
  return (
    <View style={styles.hero}>
      <Eyebrow>
        {metric.hero} · 25/26
      </Eyebrow>
      <Text style={styles.heroName}>
        {first}
        {rest.length ? '\n' + rest.join(' ') : ''}
      </Text>

      <View style={styles.heroStats}>
        <HeroStat color={theme.colors.goal} value={leader.goals} label="goals" />
        <HeroStat color={theme.colors.assist} value={leader.assists} label="assists" />
        <HeroStat color={theme.colors.motm} value={leader.manOfTheMatch} label="motm" />
        <Text style={styles.heroDot}>·</Text>
        <Text style={styles.heroMeta}>
          {leader.position ?? 'Squad'} ·{' '}
          <Text style={styles.heroMetaStrong}>{leader.appearances}</Text> apps
        </Text>
      </View>

      <View style={styles.heroBig}>
        <Text style={styles.heroBigLabel}>{metric.label} · 25/26</Text>
        <CountUp
          value={metric.get(leader)}
          pad={2}
          style={styles.heroBigNum}
        />
      </View>
    </View>
  );
}

function HeroStat({ color, value, label }: { color: string; value: number; label: string }) {
  return (
    <View style={styles.heroStat}>
      <StatDot color={color} />
      <Text style={styles.heroStatVal}>{value}</Text>
      <Text style={styles.heroStatLabel}>{label}</Text>
    </View>
  );
}

function Row({
  row,
  rank,
  metric,
  onPress,
}: {
  row: LeaderRow;
  rank: number;
  metric: (typeof METRICS)[number];
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.rank, rank <= 3 && styles.rankTop]}>
        {rank < 10 ? `0${rank}` : rank}
      </Text>
      <JerseyTile number={row.jerseyNumber} size={44} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.name} numberOfLines={1}>
          {row.name}
        </Text>
        <View style={styles.rowStats}>
          <RowStat color={theme.colors.goal} value={row.goals} />
          <RowStat color={theme.colors.assist} value={row.assists} />
          <RowStat color={theme.colors.motm} value={row.manOfTheMatch} />
          <Text style={styles.rowPos}>{row.position ?? '—'}</Text>
        </View>
      </View>
      <Text style={styles.rowVal}>{metric.get(row)}</Text>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

function RowStat({ color, value }: { color: string; value: number }) {
  return (
    <View style={styles.rowStat}>
      <StatDot color={color} size={6} />
      <Text style={styles.rowStatVal}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  pinBtn: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  pinBtnText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },

  // hero
  hero: {
    paddingTop: 28,
    paddingBottom: 28,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  heroName: {
    color: theme.colors.text,
    fontSize: 46,
    lineHeight: 44,
    fontWeight: '800',
    letterSpacing: -1.5,
    textTransform: 'uppercase',
    marginTop: 18,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 20,
  },
  heroStat: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  heroStatVal: { color: theme.colors.text, fontSize: 13, fontWeight: '700' },
  heroStatLabel: { color: theme.colors.textMuted, fontSize: 13 },
  heroDot: { color: theme.colors.faint, fontSize: 13 },
  heroMeta: { color: theme.colors.textMuted, fontSize: 13 },
  heroMetaStrong: { color: theme.colors.text, fontWeight: '700' },
  heroBig: { marginTop: 22 },
  heroBigLabel: {
    color: theme.colors.faint,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  heroBigNum: {
    color: theme.colors.text,
    fontSize: 104,
    lineHeight: 104,
    fontWeight: '800',
    letterSpacing: -4,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },

  // standings head
  standingsHead: { marginTop: 28 },
  h2: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  h2sub: { color: theme.colors.textMuted, fontSize: 13, marginTop: 4 },

  // tabs
  tabs: { gap: 6, paddingVertical: 16, paddingRight: 8 },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
  },
  tabOn: { backgroundColor: theme.colors.accent },
  tabText: {
    color: theme.colors.textMuted,
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tabTextOn: { color: theme.colors.onAccent },

  // rows
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(42,42,46,0.7)',
  },
  rank: {
    width: 26,
    textAlign: 'center',
    color: theme.colors.faint,
    fontWeight: '700',
    fontSize: 13,
    fontVariant: ['tabular-nums'],
  },
  rankTop: { color: theme.colors.text },
  name: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  rowStats: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 5 },
  rowStat: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  rowStatVal: { color: theme.colors.text, fontSize: 12, fontWeight: '700' },
  rowPos: {
    color: theme.colors.faint,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rowVal: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  chevron: { color: theme.colors.faint, fontSize: 18, marginLeft: 2 },
});
