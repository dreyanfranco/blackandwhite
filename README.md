# ⚽ Black & White — Team Stats

A stats tracker for a football team. Players record **goals, assists, man of the
match, yellow cards and red cards** per match, and the app ranks everyone on a
live leaderboard.

Monorepo:

```
blackandwhite/
├── api/   → NestJS + Mongoose REST API (MongoDB)
└── app/   → Expo / React Native app (expo-router)
```

## Stack

| Part     | Tech                                            |
| -------- | ----------------------------------------------- |
| App      | Expo SDK 56, React Native, expo-router, TypeScript |
| API      | NestJS 11, Mongoose, class-validator            |
| Database | MongoDB (local, `blackandwhite` db)             |
| Auth     | Shared **team PIN** (`x-team-pin` header) on writes |

## Prerequisites

- Node 20+ and **pnpm**
- MongoDB running locally on `mongodb://127.0.0.1:27017`
  (`brew services start mongodb-community`)
- The **Expo Go** app on your phone, or an iOS/Android simulator

## 1. Run the API

```bash
cd api
pnpm install
cp .env.example .env        # adjust MONGODB_URI / TEAM_PIN / PORT if needed
pnpm start:dev              # http://localhost:3000
```

Default `TEAM_PIN` is `1234` — change it in `.env`.

### Endpoints

| Method | Path                      | Auth | Description                          |
| ------ | ------------------------- | ---- | ------------------------------------ |
| GET    | `/`                       | —    | Health check                         |
| GET    | `/players`                | —    | List players                         |
| POST   | `/players`                | PIN  | Add a player                         |
| PATCH  | `/players/:id`            | PIN  | Update a player                      |
| DELETE | `/players/:id`            | PIN  | Remove a player                      |
| GET    | `/matches`                | —    | List matches (newest first)          |
| POST   | `/matches`                | PIN  | Add a match                          |
| GET    | `/leaderboard?sort=goals` | —    | Totals per player (sortable)         |
| GET    | `/stats?player=:id`       | —    | Stat entries (optionally per player) |
| POST   | `/stats`                  | PIN  | Record a stat entry                  |
| DELETE | `/stats/:id`              | PIN  | Delete a stat entry                  |

`sort` accepts: `goals`, `assists`, `manOfTheMatch`, `yellowCards`, `redCards`,
`appearances`.

Writes require the header `x-team-pin: <TEAM_PIN>`.

## 2. Run the app

```bash
cd app
pnpm install
pnpm start                  # opens Expo; scan the QR code with Expo Go
```

The app auto-detects the API at `http://<your-dev-machine-ip>:3000` from the
Expo bundler host, so it works on a physical phone on the same Wi-Fi. To override,
set `EXPO_PUBLIC_API_URL` (e.g. in `app/.env`).

In the app, tap **🔑** (top-right) and enter the team PIN once — it's stored on
the device and sent with every change.

### Screens

- **🏆 Leaderboard** — every player ranked; tap a stat chip to re-sort.
- **👥 Roster** — squad list + add players; tap a player for their profile.
- **➕ Add Stats** — pick a player (and optionally a match), tap in the numbers,
  save.
- **Player profile** — season totals + match-by-match history.

## Notes

- The API listens on `0.0.0.0` so phones on the LAN can reach it.
- `api/.env` is git-ignored; commit `.env.example` only.
