# Handover Notes

This document is for whoever picks up this project next. It covers the current state of the app and known gaps. **Read `README.md` first** for setup/run instructions, architecture, and the full API reference — this file only covers things worth knowing beyond that.

---

## Current state (high level)

The app is a React Native/Expo student app with a Node/Express + SQLite backend, deployable either locally or to Render's free tier (`render.yaml`, `RENDER_DEPLOYMENT.md`). It has:

- Student login/register (with session persistence across restarts), a Dashboard, a Subjects list, and per-subject detail screens (Introduction / Activities / Study Guide / Past Papers).
- Quiz Activities and Past Paper practice quizzes, with a wrong-answer explanation + hint modal.
- A Community Board (articles, likes, comments) — students browse/interact, admins manage.
- Full offline support: on-device caching, offline quiz-taking/likes/comments with background sync, and offline PDF viewing on native.
- An in-app Admin panel for managing subjects, activities, past papers, articles, and users.
- A branded MzansiGo loading screen shown on login and app launch.
- EAS Build configured (`eas.json`, `preview` profile) for producing an installable Android APK.

## Known gaps / things to look at next

### Progress calculation doesn't count PDF-only past papers
A past paper that only has an uploaded PDF (no practice questions attached) doesn't count toward a subject's completion total — only papers *with* practice questions do, since there's no "viewed this paper's PDF" tracking (unlike the study guide, which has `guide_views`). Would need a similar per-paper view-tracking table if this should change.

### `backend/seed.js` targets a stale schema
It creates a completely different, disconnected set of tables (`subjects(id,name)`, `modules`, `quizzes`) that doesn't match the real schema in `backend/database/database.js` (`activities`, `quiz`, `past_papers`, etc.). Running it does not seed the real app with usable data. An auto-reseed-on-boot for the hosted Render deploy (to survive its free-tier filesystem resets) was considered and dropped for this reason — worth writing a seeder against the current schema if that's needed later.

### `screens/Admin_2/` is an unreferenced duplicate
There's a `screens/Admin_2/` directory containing near-duplicates of every file in `screens/admin/` (added in the "Admin edits" commit). Nothing in the app imports from `Admin_2` — `navigation/AppNavigator.js` only references `screens/admin/`. It looks like leftover work-in-progress rather than intentional dead code; worth confirming with whoever added it before deleting.

### Render free tier has no persistent disk
`backend/database/app.db` and `backend/uploads/` reset on every redeploy/restart on the free plan. Fine for a demo; a paid persistent disk (or moving to a hosted DB) is the fix if this needs to become a durable deployment.

### `promote-admin` endpoint is a standing privilege-escalation surface
`POST /api/auth/promote-admin` (gated by `ADMIN_PROMOTE_SECRET`) exists specifically because the Render free tier has no DB shell access. It's a permanent, unlogged, unrevocable-except-by-editing-code way to grant admin to any account if the secret ever leaks. Acceptable for a demo app with no real user data at stake — reconsider before any real deployment.

---

## Merge status

`main` is up to date and is where all work described above landed. Recent notable commits (see `git log` for the full picture): Community Board + wrong-answer explanations frontend, admin edits, the offline-support feature set (Phases A–D per the now-removed `COMMUNITY_AND_OFFLINE_HANDOVER.md` plan — that document has been deleted since everything it specced is done), and the branded loading screen.
