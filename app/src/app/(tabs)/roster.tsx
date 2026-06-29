import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api, ApiError, Player } from '@/lib/api';
import { useApi } from '@/lib/useApi';
import { theme } from '@/lib/theme';
import { JerseyTile } from '@/components/kit';
import { Button, Card, EmptyState, Field } from '@/components/ui';

function initials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function RosterScreen() {
  const { data, error, loading, reload } = useApi<Player[]>(() =>
    api.getPlayers(),
  );
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [jersey, setJersey] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!name.trim()) {
      Alert.alert('Name required', 'Enter the player’s name.');
      return;
    }
    setSaving(true);
    try {
      await api.createPlayer({
        name: name.trim(),
        position: position.trim() || undefined,
        jerseyNumber: jersey ? Number(jersey) : undefined,
      });
      setName('');
      setPosition('');
      setJersey('');
      setAdding(false);
      reload();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not add player';
      if (e instanceof ApiError && e.status === 401) {
        Alert.alert('Team PIN needed', 'Set the team PIN (🔑) to add players.', [
          { text: 'Set PIN', onPress: () => router.push('/settings') },
          { text: 'Cancel', style: 'cancel' },
        ]);
      } else {
        Alert.alert('Could not add player', msg);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FlatList
        data={data ?? []}
        keyExtractor={(p) => p._id}
        numColumns={2}
        columnWrapperStyle={styles.colWrap}
        contentContainerStyle={[styles.list, { paddingTop: insets.top + 12 }]}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={reload}
            tintColor={theme.colors.text}
          />
        }
        ListHeaderComponent={
          <View style={{ marginBottom: 16 }}>
            <Text style={styles.title}>SQUAD</Text>
            {adding ? (
              <Card style={{ gap: 12 }}>
                <Field
                  label="Name"
                  placeholder="e.g. Dreyan Franco"
                  value={name}
                  onChangeText={setName}
                  autoFocus
                />
                <Field
                  label="Position (optional)"
                  placeholder="Forward"
                  value={position}
                  onChangeText={setPosition}
                />
                <Field
                  label="Jersey number (optional)"
                  placeholder="9"
                  keyboardType="number-pad"
                  value={jersey}
                  onChangeText={setJersey}
                />
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Button
                      label="Cancel"
                      variant="ghost"
                      onPress={() => setAdding(false)}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Button label="Save" onPress={submit} loading={saving} />
                  </View>
                </View>
              </Card>
            ) : (
              <Button label="＋  Add player" onPress={() => setAdding(true)} />
            )}
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={theme.colors.text} />
          ) : error ? (
            <EmptyState title="Couldn't load roster" subtitle={error} />
          ) : (
            <EmptyState
              title="No players yet"
              subtitle="Add your first player above."
            />
          )
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/player/${item._id}`)}
            style={({ pressed }) => [styles.cell, pressed && { borderColor: theme.colors.textMuted }]}>
            <JerseyTile number={item.jerseyNumber} size={40} radius={10} />
            <View>
              <Text style={styles.name} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.sub}>
                {[item.position, initials(item.name)].filter(Boolean).join(' · ')}
              </Text>
            </View>
          </Pressable>
        )}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  list: { padding: 20, paddingBottom: 32 },
  title: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 14,
  },
  colWrap: { gap: 10 },
  cell: {
    flex: 1,
    gap: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14,
    marginBottom: 10,
  },
  name: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  sub: {
    color: theme.colors.faint,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 3,
  },
});
