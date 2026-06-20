import Constants from 'expo-constants';
import { getPin } from './pin';

/**
 * The API runs on the dev machine, port 3000. In Expo, the bundler's host URI
 * (e.g. "192.168.1.20:8081") tells us that machine's LAN address, so the same
 * build works on a simulator and on a physical phone over Wi-Fi.
 * Override with EXPO_PUBLIC_API_URL if needed.
 */
function resolveBaseUrl(): string {
  const explicit = process.env.EXPO_PUBLIC_API_URL;
  if (explicit) return explicit.replace(/\/$/, '');

  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri?.split(':')[0];
  if (host) return `http://${host}:3000`;

  return 'http://localhost:3000';
}

export const API_BASE_URL = resolveBaseUrl();

export type Player = {
  _id: string;
  name: string;
  position?: string;
  jerseyNumber?: number;
};

export type Match = {
  _id: string;
  opponent: string;
  date: string;
  homeAway?: 'home' | 'away';
  competition?: string;
};

export type LeaderRow = {
  playerId: string;
  name: string;
  position?: string;
  jerseyNumber?: number;
  goals: number;
  assists: number;
  manOfTheMatch: number;
  yellowCards: number;
  redCards: number;
  appearances: number;
};

export type StatEntry = {
  _id: string;
  player: Player;
  match?: Match;
  goals: number;
  assists: number;
  manOfTheMatch: boolean;
  yellowCards: number;
  redCards: number;
  note?: string;
  createdAt: string;
};

export type LeaderboardSort =
  | 'goals'
  | 'assists'
  | 'manOfTheMatch'
  | 'yellowCards'
  | 'redCards'
  | 'appearances';

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean } = {},
): Promise<T> {
  const { method = 'GET', body, auth = false } = options;
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const pin = await getPin();
    if (pin) headers['x-team-pin'] = pin;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      `Can't reach the server at ${API_BASE_URL}. Is the API running?`,
      0,
    );
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data?.message) {
        message = Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message;
      }
    } catch {
      // keep default message
    }
    if (res.status === 401) message = 'Invalid or missing team PIN.';
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  getLeaderboard: (sort: LeaderboardSort = 'goals') =>
    request<LeaderRow[]>(`/leaderboard?sort=${sort}`),
  getPlayers: () => request<Player[]>('/players'),
  createPlayer: (body: {
    name: string;
    position?: string;
    jerseyNumber?: number;
  }) => request<Player>('/players', { method: 'POST', body, auth: true }),
  getMatches: () => request<Match[]>('/matches'),
  createMatch: (body: {
    opponent: string;
    homeAway?: 'home' | 'away';
    competition?: string;
  }) => request<Match>('/matches', { method: 'POST', body, auth: true }),
  getPlayerStats: (playerId: string) =>
    request<StatEntry[]>(`/stats?player=${playerId}`),
  createStat: (body: {
    player: string;
    match?: string;
    goals?: number;
    assists?: number;
    manOfTheMatch?: boolean;
    yellowCards?: number;
    redCards?: number;
    note?: string;
  }) => request<StatEntry>('/stats', { method: 'POST', body, auth: true }),
};

export { ApiError };
