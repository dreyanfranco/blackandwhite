import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { API_BASE_URL } from '@/lib/api';
import { clearPin, getPin, setPin } from '@/lib/pin';
import { theme } from '@/lib/theme';
import { Button, Card, Field } from '@/components/ui';

export default function SettingsScreen() {
  const router = useRouter();
  const [pin, setPinValue] = useState('');
  const [hasPin, setHasPin] = useState(false);

  useEffect(() => {
    getPin().then((p) => {
      if (p) {
        setPinValue(p);
        setHasPin(true);
      }
    });
  }, []);

  async function save() {
    if (!pin.trim()) {
      Alert.alert('Enter a PIN', 'The PIN can’t be empty.');
      return;
    }
    await setPin(pin);
    Alert.alert('Saved', 'Team PIN stored on this device.');
    router.back();
  }

  async function forget() {
    await clearPin();
    setPinValue('');
    setHasPin(false);
    Alert.alert('Cleared', 'The team PIN was removed from this device.');
  }

  return (
    <View style={styles.container}>
      <Card style={{ gap: 14 }}>
        <Text style={styles.blurb}>
          Adding players, matches and stats requires the shared team PIN. It’s
          stored only on this device and sent with each change.
        </Text>
        <Field
          label="Team PIN"
          placeholder="••••"
          value={pin}
          onChangeText={setPinValue}
          secureTextEntry
          keyboardType="number-pad"
          autoFocus={!hasPin}
        />
        <Button label="Save PIN" onPress={save} />
        {hasPin ? (
          <Button label="Forget PIN" variant="danger" onPress={forget} />
        ) : null}
      </Card>

      <Text style={styles.api}>API: {API_BASE_URL}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg, padding: 16, gap: 16 },
  blurb: { color: theme.colors.textMuted, fontSize: 14, lineHeight: 20 },
  api: { color: theme.colors.textMuted, fontSize: 12, textAlign: 'center' },
});
