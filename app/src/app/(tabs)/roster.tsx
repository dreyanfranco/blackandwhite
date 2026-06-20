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
import { api, ApiError, Player } from '@/lib/api';
import { useApi } from '@/lib/useApi';
import { theme } from '@/lib/theme';
import { Avatar, Button, Card, EmptyState, Field } from '@/components/ui';

export default function RosterScreen() {
  const { data, error, loading, reload } = useApi<Player[]>(() =>
    api.getPlayers(),
  );
  const router = useRouter();

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
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={reload}
            tintColor={theme.colors.text}
          />
        }
        ListHeaderComponent={
          <View style={{ marginBottom: 14 }}>
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
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}>
            <Avatar name={item.name} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              {item.position ? (
                <Text style={styles.sub}>{item.position}</Text>
              ) : null}
            </View>
            {item.jerseyNumber != null ? (
              <Text style={styles.jersey}>#{item.jerseyNumber}</Text>
            ) : null}
          </Pressable>
        )}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  list: { padding: 16, paddingBottom: 32, gap: 10 },
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
  name: { color: theme.colors.text, fontSize: 16, fontWeight: '700' },
  sub: { color: theme.colors.textMuted, fontSize: 13, marginTop: 2 },
  jersey: { color: theme.colors.textMuted, fontSize: 18, fontWeight: '800' },
});
