import { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { theme } from '@/lib/theme';

/**
 * The team's identity: bold black & white vertical stripes (the kit).
 * Used for the club badge.
 */
export function KitStripes({
  size = 36,
  radius = 4,
  stripe = 6,
}: {
  size?: number;
  radius?: number;
  stripe?: number;
}) {
  const count = Math.ceil(size / stripe);
  return (
    <View
      style={[
        styles.stripesWrap,
        { width: size, height: size, borderRadius: radius },
      ]}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={{
            width: stripe,
            height: size,
            backgroundColor: i % 2 ? theme.colors.bg : theme.colors.text,
          }}
        />
      ))}
    </View>
  );
}

/** Faint pinstripe overlay used to give tiles a subtle "kit" texture. */
function FineStripes({ radius = 8 }: { radius?: number }) {
  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { borderRadius: radius, overflow: 'hidden' }]}>
      <View style={styles.fineRow}>
        {Array.from({ length: 24 }).map((_, i) => (
          <View key={i} style={styles.fineBar} />
        ))}
      </View>
    </View>
  );
}

/** A squad-number tile with the faint kit texture. */
export function JerseyTile({
  number,
  size = 44,
  radius = 10,
  fontSize,
}: {
  number?: number;
  size?: number;
  radius?: number;
  fontSize?: number;
}) {
  return (
    <View
      style={[
        styles.jersey,
        { width: size, height: size, borderRadius: radius },
      ]}>
      <FineStripes radius={radius} />
      <Text style={[styles.jerseyNum, { fontSize: fontSize ?? size * 0.36 }]}>
        {number ?? '—'}
      </Text>
    </View>
  );
}

/** Small round colour token used next to a stat label. */
export function StatDot({ color, size = 8 }: { color: string; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
      }}
    />
  );
}

/** A little booking-card rectangle (yellow / red). */
export function CardChip({ color }: { color: string }) {
  return <View style={[styles.cardChip, { backgroundColor: color }]} />;
}

/** Club wordmark — badge + name, uppercase, tight tracking. */
export function Brand({ right }: { right?: React.ReactNode }) {
  return (
    <View style={styles.brand}>
      <View style={styles.brandLeft}>
        <KitStripes size={36} />
        <View>
          <Text style={styles.brandName}>BLACK &amp; WHITE</Text>
          <Text style={styles.brandSub}>FOOTBALL CLUB</Text>
        </View>
      </View>
      {right}
    </View>
  );
}

/** A label with a tiny accent rule, e.g. "GOLDEN BOOT · 25/26". */
export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.eyebrow}>
      <View style={styles.eyebrowRule} />
      <Text style={styles.eyebrowText}>{children}</Text>
    </View>
  );
}

/** Number that counts up from zero when `value` changes. */
export function CountUp({
  value,
  style,
  pad = 0,
  duration = 1000,
}: {
  value: number;
  style?: TextStyle | TextStyle[];
  pad?: number;
  duration?: number;
}) {
  const [display, setDisplay] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (raf.current != null) cancelAnimationFrame(raf.current);
    const start = Date.now();
    const from = 0;
    const tick = () => {
      const k = Math.min(1, (Date.now() - start) / duration);
      const eased = 1 - Math.pow(1 - k, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (k < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current != null) cancelAnimationFrame(raf.current);
    };
  }, [value, duration]);

  const text = pad ? String(display).padStart(pad, '0') : String(display);
  return <Text style={style}>{text}</Text>;
}

const styles = StyleSheet.create({
  stripesWrap: {
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  fineRow: { flexDirection: 'row', flex: 1 },
  fineBar: {
    width: 2,
    marginRight: 5,
    flex: 0,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  jersey: {
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  jerseyNum: {
    color: theme.colors.text,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  cardChip: {
    width: 10,
    height: 14,
    borderRadius: 2,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  brandLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  brandName: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  brandSub: {
    color: theme.colors.faint,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 3,
    marginTop: 3,
  },
  eyebrow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  eyebrowRule: { height: 1, width: 32, backgroundColor: theme.colors.textMuted },
  eyebrowText: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
});
