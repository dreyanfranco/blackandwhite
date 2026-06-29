/** Black & white theme — matching the team's colours. */
export const theme = {
  colors: {
    bg: '#0B0B0C',
    surface: '#161618',
    surfaceAlt: '#1F1F22',
    border: '#2A2A2E',
    text: '#FFFFFF',
    textMuted: '#9A9AA2',
    faint: '#5A5A62',
    accent: '#FFFFFF',
    onAccent: '#0B0B0C',
    goal: '#4ADE80',
    assist: '#60A5FA',
    motm: '#FACC15',
    yellow: '#EAB308',
    red: '#EF4444',
    danger: '#EF4444',
  },
  radius: { sm: 8, md: 12, lg: 18, pill: 999 },
  spacing: (n: number) => n * 4,
};

export type StatKey =
  | 'goals'
  | 'assists'
  | 'manOfTheMatch'
  | 'yellowCards'
  | 'redCards'
  | 'appearances';

export const STAT_META: Record<
  StatKey,
  { label: string; short: string; emoji: string; color: string }
> = {
  goals: { label: 'Goals', short: 'G', emoji: '⚽', color: theme.colors.goal },
  assists: {
    label: 'Assists',
    short: 'A',
    emoji: '🤝',
    color: theme.colors.assist,
  },
  manOfTheMatch: {
    label: 'Man of the Match',
    short: 'MOTM',
    emoji: '⭐',
    color: theme.colors.motm,
  },
  yellowCards: {
    label: 'Yellow Cards',
    short: 'YC',
    emoji: '🟡',
    color: theme.colors.yellow,
  },
  redCards: {
    label: 'Red Cards',
    short: 'RC',
    emoji: '🔴',
    color: theme.colors.red,
  },
  appearances: {
    label: 'Appearances',
    short: 'Apps',
    emoji: '👕',
    color: theme.colors.textMuted,
  },
};
