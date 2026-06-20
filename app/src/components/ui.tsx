import { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { theme } from '@/lib/theme';

export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading,
  disabled,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'danger';
  loading?: boolean;
  disabled?: boolean;
}) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.btn,
        variant === 'primary' && styles.btnPrimary,
        variant === 'ghost' && styles.btnGhost,
        variant === 'danger' && styles.btnDanger,
        (pressed || isDisabled) && { opacity: 0.6 },
      ]}>
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? theme.colors.onAccent : theme.colors.text}
        />
      ) : (
        <Text
          style={[
            styles.btnText,
            variant === 'primary' && { color: theme.colors.onAccent },
            variant === 'danger' && { color: theme.colors.danger },
          ]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

export function Field({
  label,
  ...props
}: TextInputProps & { label?: string }) {
  return (
    <View style={{ gap: 6 }}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={theme.colors.textMuted}
        style={styles.input}
        {...props}
      />
    </View>
  );
}

export function Stepper({
  label,
  emoji,
  value,
  onChange,
  min = 0,
  max = 50,
}: {
  label: string;
  emoji: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  const set = (v: number) => onChange(Math.max(min, Math.min(max, v)));
  return (
    <View style={styles.stepperRow}>
      <Text style={styles.stepperLabel}>
        {emoji}  {label}
      </Text>
      <View style={styles.stepperControls}>
        <Pressable
          onPress={() => set(value - 1)}
          style={({ pressed }) => [styles.stepBtn, pressed && { opacity: 0.5 }]}>
          <Text style={styles.stepBtnText}>−</Text>
        </Pressable>
        <Text style={styles.stepValue}>{value}</Text>
        <Pressable
          onPress={() => set(value + 1)}
          style={({ pressed }) => [styles.stepBtn, pressed && { opacity: 0.5 }]}>
          <Text style={styles.stepBtnText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function Toggle({
  label,
  emoji,
  value,
  onChange,
}: {
  label: string;
  emoji: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <Pressable
      onPress={() => onChange(!value)}
      style={({ pressed }) => [
        styles.toggle,
        value && styles.toggleOn,
        pressed && { opacity: 0.7 },
      ]}>
      <Text style={[styles.stepperLabel, value && { color: theme.colors.onAccent }]}>
        {emoji}  {label}
      </Text>
      <View style={[styles.toggleDot, value && styles.toggleDotOn]} />
    </Pressable>
  );
}

export function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle ? <Text style={styles.emptySub}>{subtitle}</Text> : null}
    </View>
  );
}

export function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2 },
      ]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.36 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
  },
  btn: {
    height: 52,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  btnPrimary: { backgroundColor: theme.colors.accent },
  btnGhost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  btnDanger: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.danger,
  },
  btnText: { color: theme.colors.text, fontSize: 16, fontWeight: '700' },
  fieldLabel: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 2,
  },
  input: {
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    color: theme.colors.text,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  stepperLabel: { color: theme.colors.text, fontSize: 16, fontWeight: '600' },
  stepperControls: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: { color: theme.colors.text, fontSize: 22, fontWeight: '600', lineHeight: 24 },
  stepValue: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
    minWidth: 24,
    textAlign: 'center',
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.md,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  toggleOn: { backgroundColor: theme.colors.motm, borderColor: theme.colors.motm },
  toggleDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: theme.colors.textMuted,
  },
  toggleDotOn: {
    backgroundColor: theme.colors.onAccent,
    borderColor: theme.colors.onAccent,
  },
  empty: { alignItems: 'center', justifyContent: 'center', padding: 40, gap: 6 },
  emptyTitle: { color: theme.colors.text, fontSize: 17, fontWeight: '700' },
  emptySub: { color: theme.colors.textMuted, fontSize: 14, textAlign: 'center' },
  avatar: {
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: theme.colors.text, fontWeight: '800' },
});
