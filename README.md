# SASFA Tournaments

A schools-football tournament site — fixtures, live results, standings,
and playoffs — with a broadcast-graphics design system (black chrome,
neon accent, Anton display type, JetBrains Mono scoreboard digits).

## Structure

```
public/
  index.html      → public site (fixtures, standings, teams, playoffs)
  edit.html       → manager login + editor panel
  images/         → logo + photos
api/
  get-data.js     → Vercel serverless function, reads tournament data
  save-data.js    → Vercel serverless function, writes tournament data
server.js         → Express server for local development
vercel.json       → security headers for deployment
```

## Run locally

```bash
npm install
npm start
```

Then open `http://localhost:3000/public/index.html`.

The app now uses Firebase Realtime Database for persistence in both
local and deployed environments.

## Cloud data (Firebase Realtime Database)

To persist fixtures and results:

1. Create a Firebase project and enable Realtime Database
2. Create a service account key from Firebase Project Settings → Service Accounts
3. Copy `.env.example` to `.env` and fill in:
  - `FIREBASE_PROJECT_ID`
  - `FIREBASE_CLIENT_EMAIL`
  - `FIREBASE_PRIVATE_KEY`
  - `FIREBASE_DATABASE_URL`
  - `FIREBASE_DATA_PATH` (default `tournamentData`)
4. On Vercel, add the same environment variables under Project Settings → Environment Variables

## Deploy

Push to a GitHub repo and import it into Vercel. The `public/` folder
is auto-detected as the static root, and `api/` becomes serverless
functions automatically — no build step needed.

## Editing fixtures

Visit `/public/edit.html`, log in with the manager password (set in
the login flow), and update pool matches, playoff fixtures, and
national finals from there. Saves go through `/api/save-data`.

## Design system

- **Colors**: fixed broadcast-black chrome (header/hero/footer) that
  doesn't change with light/dark mode, one neon accent (`--lime`),
  broadcast red for LIVE states
- **Type**: Anton (headlines/labels), Inter (body), JetBrains Mono
  (scores and stats)
- **Shapes**: angled `clip-path` cuts on buttons and crests instead of
  rounded corners; flat colour blocks instead of blurred/glass cards
