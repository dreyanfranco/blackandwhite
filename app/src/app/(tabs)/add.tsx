import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { api, ApiError, Match, Player } from '@/lib/api';
import { useApi } from '@/lib/useApi';
import { theme } from '@/lib/theme';
import { Button, Card, EmptyState, Field, Stepper, Toggle } from '@/components/ui';

const EMPTY = {
  goals: 0,
  assists: 0,
  yellowCards: 0,
  redCards: 0,
  manOfTheMatch: false,
};

export default function AddStatsScreen() {
  const router = useRouter();
  const players = useApi<Player[]>(() => api.getPlayers());
  const matches = useApi<Match[]>(() => api.getMatches());

  const [playerId, setPlayerId] = useState<string | null>(null);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const [newOpponent, setNewOpponent] = useState('');
  const [creatingMatch, setCreatingMatch] = useState(false);

  const set = (k: keyof typeof EMPTY, v: number | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  function requirePin(e: unknown, fallbackTitle: string) {
    if (e instanceof ApiError && e.status === 401) {
      Alert.alert('Team PIN needed', 'Set the team PIN (🔑) to save changes.', [
        { text: 'Set PIN', onPress: () => router.push('/settings') },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return true;
    }
    Alert.alert(fallbackTitle, e instanceof Error ? e.message : 'Try again.');
    return false;
  }

  async function addMatch() {
    if (!newOpponent.trim()) return;
    setCreatingMatch(true);
    try {
      const m = await api.createMatch({ opponent: newOpponent.trim() });
      setNewOpponent('');
      await matches.reload();
      setMatchId(m._id);
    } catch (e) {
      requirePin(e, 'Could not create match');
    } finally {
      setCreatingMatch(false);
    }
  }

  async function submit() {
    if (!playerId) {
      Alert.alert('Pick a player', 'Select who these stats are for.');
      return;
    }
    setSaving(true);
    try {
      await api.createStat({
        player: playerId,
        match: matchId ?? undefined,
        ...form,
        note: note.trim() || undefined,
      });
      const who = players.data?.find((p) => p._id === playerId)?.name ?? 'Player';
      setForm({ ...EMPTY });
      setNote('');
      Alert.alert('Saved ✅', `Stats added for ${who}.`);
    } catch (e) {
      requirePin(e, 'Could not save stats');
    } finally {
      setSaving(false);
    }
  }

  if (players.loading && !players.data) {
    return <EmptyState title="Loading…" />;
  }
  if (!players.data?.length) {
    return (
      <EmptyState
        title="No players yet"
        subtitle="Add players in the Roster tab before recording stats."
      />
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled">
      <Text style={styles.section}>Player</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}>
        {players.data.map((p) => (
          <Chip
            key={p._id}
            label={p.name}
            active={playerId === p._id}
            onPress={() => setPlayerId(p._id)}
          />
        ))}
      </ScrollView>

      <Text style={styles.section}>Match (optional)</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}>
        <Chip label="No match" active={!matchId} onPress={() => setMatchId(null)} />
        {(matches.data ?? []).map((m) => (
          <Chip
            key={m._id}
            label={`vs ${m.opponent}`}
            active={matchId === m._id}
            onPress={() => setMatchId(m._id)}
          />
        ))}
      </ScrollView>
      <View style={styles.newMatch}>
        <View style={{ flex: 1 }}>
          <Field
            placeholder="New opponent…"
            value={newOpponent}
            onChangeText={setNewOpponent}
            onSubmitEditing={addMatch}
          />
        </View>
        <Button
          label="Add"
          variant="ghost"
          onPress={addMatch}
          loading={creatingMatch}
          disabled={!newOpponent.trim()}
        />
      </View>

      <Text style={styles.section}>Stats</Text>
      <Card style={{ gap: 10 }}>
        <Stepper
          label="Goals"
          emoji="⚽"
          value={form.goals}
          onChange={(v) => set('goals', v)}
        />
        <Stepper
          label="Assists"
          emoji="🎯"
          value={form.assists}
          onChange={(v) => set('assists', v)}
        />
        <Toggle
          label="Man of the Match"
          emoji="⭐"
          value={form.manOfTheMatch}
          onChange={(v) => set('manOfTheMatch', v)}
        />
        <Stepper
          label="Yellow cards"
          emoji="🟨"
          value={form.yellowCards}
          onChange={(v) => set('yellowCards', v)}
          max={10}
        />
        <Stepper
          label="Red cards"
          emoji="🟥"
          value={form.redCards}
          onChange={(v) => set('redCards', v)}
          max={5}
        />
      </Card>

      <View style={{ marginTop: 14 }}>
        <Field
          label="Note (optional)"
          placeholder="e.g. screamer from 30 yards"
          value={note}
          onChangeText={setNote}
        />
      </View>

      <View style={{ marginTop: 20 }}>
        <Button label="Save stats" onPress={submit} loading={saving} />
      </View>
    </ScrollView>
  );
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  content: { padding: 16, paddingBottom: 48 },
  section: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 18,
    marginBottom: 8,
    marginLeft: 2,
  },
  chips: { gap: 8, paddingRight: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipActive: { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent },
  chipText: { color: theme.colors.text, fontWeight: '600', fontSize: 14 },
  chipTextActive: { color: theme.colors.onAccent },
  newMatch: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 10 },
});
