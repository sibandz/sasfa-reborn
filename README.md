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

Without cloud credentials configured, data is read from and written to
`tournament-data.json` on disk (created automatically on first save).

## Cloud data (JSONBin)

To persist data across deployments instead of using local disk storage:

1. Create a bin at [jsonbin.io](https://jsonbin.io)
2. Copy `.env.example` to `.env` and fill in `JSONBIN_BIN_ID` and `JSONBIN_API_KEY`
3. On Vercel, add the same two variables under Project Settings → Environment Variables

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
