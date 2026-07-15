# Deploying the backend to Render (free tier)

This repo includes `render.yaml` at the root, which is a Render "Blueprint" —
it describes the web service so Render can create it automatically instead of
you configuring each field by hand.

## Steps

1. Go to https://dashboard.render.com and sign up / log in (a free account is
   enough — no card required for the free plan).
2. Click **New +** → **Blueprint**.
3. Connect your GitHub account if you haven't already, then select this
   repository (`OfflineEducationApp`).
4. Render will detect `render.yaml` and show you the `mzansigo-backend`
   service it's about to create. Review it and click **Apply**.
5. Wait for the first build/deploy to finish (a few minutes). When it's done,
   Render shows you the live URL, e.g. `https://mzansigo-backend.onrender.com`.
6. Open `config.js` in the project root and point `BASE_URL` at that URL
   (see the commented example already added in `config.example.js`) whenever
   you want the app to talk to the hosted backend instead of your local
   machine. Switch back to `localhost`/your LAN IP for day-to-day local dev.

## What to expect on the free tier

- The free plan has **no persistent disk** — `backend/database/app.db` and
  any uploaded files reset whenever the service restarts or redeploys
  (Render free instances also spin down after ~15 minutes of inactivity and
  cold-start on the next request, which itself doesn't lose data, but a
  redeploy or manual restart does reset the filesystem).
- This is fine for a demo, but it means:
  - Any admin-added content (new subjects, articles, uploaded PDFs) will be
    lost on a cold restart/redeploy.
  - You may need to re-run `node backend/seed.js` (or re-register a demo
    user / re-add content through the admin UI) after a restart if you want
    the hosted demo to have data again. This project does **not** currently
    auto-reseed on boot — that was considered and intentionally dropped
    (see below).
- If this ever needs to become a real, durable deployment, the fix is either
  Render's paid persistent disk add-on, or moving to a hosted database
  (e.g. Turso, Postgres) instead of the local SQLite file.

## Note on auto-reseeding

The original plan considered having the server auto-run `backend/seed.js` on
boot if the database was empty, so a free-tier reset would "self-heal" with
demo content. On inspection, `backend/seed.js` turned out to create a
completely different, disconnected schema (`subjects(id,name)`, `modules`,
`quizzes`) that doesn't match the real app's tables (`activities`, `quiz`,
`past_papers`, etc. from `backend/database/database.js`). Auto-running it
would not actually repopulate a reset demo meaningfully, so this idea was
dropped rather than building a new seeder from scratch — flagging this here
in case it's worth revisiting later with a seed script written against the
current schema.
