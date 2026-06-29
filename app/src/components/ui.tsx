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
  indicator,
  value,
  onChange,
  min = 0,
  max = 50,
  compact = false,
}: {
  label: string;
  indicator?: ReactNode;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  compact?: boolean;
}) {
  const set = (v: number) => onChange(Math.max(min, Math.min(max, v)));
  return (
    <View style={[styles.stepperRow, compact && styles.stepperRowCompact]}>
      <View style={styles.stepperLabelWrap}>
        {indicator}
        <Text style={styles.stepperLabel}>{label}</Text>
      </View>
      <View style={[styles.stepperControls, compact && styles.stepperControlsCompact]}>
        <Pressable
          onPress={() => set(value - 1)}
          style={({ pressed }) => [
            styles.stepBtn,
            compact && styles.stepBtnCompact,
            pressed && { opacity: 0.5 },
          ]}>
          <Text style={styles.stepBtnText}>−</Text>
        </Pressable>
        <Text style={[styles.stepValue, compact && styles.stepValueCompact]}>{value}</Text>
        <Pressable
          onPress={() => set(value + 1)}
          style={({ pressed }) => [
            styles.stepBtn,
            compact && styles.stepBtnCompact,
            pressed && { opacity: 0.5 },
          ]}>
          <Text style={styles.stepBtnText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function Toggle({
  label,
  indicator,
  value,
  onChange,
}: {
  label: string;
  indicator?: ReactNode;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <Pressable
      onPress={() => onChange(!value)}
      style={({ pressed }) => [styles.toggle, pressed && { opacity: 0.7 }]}>
      <View style={styles.stepperLabelWrap}>
        {indicator}
        <Text style={styles.stepperLabel}>{label}</Text>
      </View>
      <View style={[styles.toggleKnob, value && styles.toggleKnobOn]}>
        <View style={[styles.toggleDot, value && styles.toggleDotOn]} />
      </View>
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
    minWidth: 0,
    width: '100%',
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
  stepperRowCompact: { paddingHorizontal: 10 },
  stepperLabel: { color: theme.colors.text, fontSize: 15, fontWeight: '600' },
  stepperLabelWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepperControls: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepperControlsCompact: { gap: 6 },
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
  stepBtnCompact: { width: 30, height: 30, borderRadius: 15 },
  stepBtnText: { color: theme.colors.text, fontSize: 22, fontWeight: '600', lineHeight: 24 },
  stepValue: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
    minWidth: 24,
    textAlign: 'center',
  },
  stepValueCompact: { fontSize: 16, minWidth: 16 },
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
  toggleKnob: {
    width: 44,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 2,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  toggleKnobOn: {
    borderColor: theme.colors.onAccent,
    alignItems: 'flex-end',
  },
  toggleDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.textMuted,
  },
  toggleDotOn: { backgroundColor: theme.colors.onAccent },
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
