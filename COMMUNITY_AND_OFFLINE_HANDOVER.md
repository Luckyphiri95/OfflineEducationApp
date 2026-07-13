# Handover: Community Board, Quiz Explanations & Offline Support

This document is for the developer picking up backend work on **MzansiGo** (formerly "OfflineEducationApp" — see `README.md`). It describes three pieces of work; **the frontend for Features 1 and 2 is already built** (see "Frontend — already built" under each) and is currently calling endpoints that don't exist on the backend yet — those calls fail gracefully (friendly error states, no crashes) until the backend catches up. Feature 3 (offline support) has no frontend or backend work started yet — it's still a plan.

## Current status at a glance

| | Frontend | Backend | Notes |
|---|---|---|---|
| **Feature 1** — Community Board | ✅ Built & verified | ❌ Not started | Screens call `GET/POST/PUT/DELETE /api/articles`, `.../like`, `.../comments` — all currently 404/fail gracefully. Build the 3 new tables + `articleController`/`articleRoutes` per the spec below. |
| **Feature 2** — Wrong-answer explanation + clue | ✅ Built & verified | ❌ Not started | `ExplanationModal` is wired into both quiz screens and shows the graceful "no explanation yet" fallback for every question today, since the backend doesn't have `explanation`/`hint` columns yet. Add the 2 columns + update `createQuestion`/`updateQuestion` — no frontend change needed once that's done. |
| **Feature 3** — Offline support + sync | ❌ Not started | ❌ Not started | Pure plan — do this last, after 1 and 2. See Phase A–D below; Phase A (hosting) blocks everything else in this feature. |

**Bottom line for your first PR**: implement Feature 1's backend, then Feature 2's backend (much smaller — 2 columns + one function edit each in `createQuestion`/`updateQuestion`). Both are fully specced below with exact schema and endpoint shapes — the frontend is already built and waiting, don't redesign the contract.

**Read `README.md` and `HANDOVER.md` first** for the current state of the app (architecture, existing screens/endpoints, admin flows). This document only covers the three new pieces below.

**Recommended order: Feature 1 → Feature 2 → Feature 3.** The frontend for 1 and 2 is done and waiting on you; Feature 3 (offline support) is a large architecture change that touches how *every* screen fetches data — build it last so you're not redoing Features 1/2's already-built screens on top of a data-fetching layer that doesn't exist yet.

---

## Feature 1: Community Board

Admin-authored articles that students browse and read, in two categories, with per-user like-toggling and moderatable comments.

- **Categories**: `'module'` (tied to a specific subject — learning content) or `'improvement'` (general school-improvement tips, no subject link).
- **Likes**: toggle, one per user per article (tap again to unlike).
- **Comments**: any student can comment; a student can delete their own comment; an admin can delete *any* comment (moderation).

### Data model

Follow this codebase's existing conventions exactly — see `backend/database/database.js` for the pattern (`CREATE TABLE IF NOT EXISTS` + idempotent `ALTER TABLE ... ADD COLUMN` wrapped in a no-op error callback for future migrations, `id INTEGER PRIMARY KEY AUTOINCREMENT`, `created_at DATETIME DEFAULT CURRENT_TIMESTAMP`).

```sql
CREATE TABLE IF NOT EXISTS articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT NOT NULL,        -- 'module' | 'improvement'
  subject_id INTEGER,            -- nullable; only set for 'module' articles
  author_id INTEGER,             -- the admin user who posted it
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(subject_id) REFERENCES subjects(id)
);

CREATE TABLE IF NOT EXISTS article_likes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  article_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(article_id, user_id),   -- same one-row-per-pair pattern as guide_views
  FOREIGN KEY(article_id) REFERENCES articles(id),
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS article_comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  article_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  body TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(article_id) REFERENCES articles(id),
  FOREIGN KEY(user_id) REFERENCES users(id)
);
```

### Backend — new files

- `backend/controllers/articleController.js` + `backend/routes/articleRoutes.js`. Mirror `backend/controllers/subjectController.js`'s plain CRUD functions (`getSubjects`/`createSubject`/`updateSubject`/`deleteSubject` — no file upload involved) for `getArticles`/`createArticle`/`updateArticle`/`deleteArticle`. `deleteArticle` must cascade-delete its `article_likes` and `article_comments` rows first (same cascade pattern already used in `activityController.js`'s `deleteActivity` and `paperController.js`'s `deletePaper`).
- `getArticles` should return each article with a computed `like_count`, `comment_count`, and — when a `?user_id=` query param is passed — a `liked_by_me` boolean. Compute these the same way `backend/controllers/progressController.js` aggregates counts from a join table into plain JS objects (i.e., `db.all` the raw rows, then `.map`/`.filter` in JS — this codebase doesn't use SQL `JOIN`/`GROUP BY` anywhere, stay consistent with that).
- `POST /api/articles/:id/like` — body `{ user_id }`. This is a **toggle**, not insert-or-ignore: check if a row exists for `(article_id, user_id)`; if yes, `DELETE` it (unlike); if no, `INSERT` it (like). Respond with the new liked state and updated count.
- `GET /api/articles/:id/comments`, `POST /api/articles/:id/comments` (body `{ user_id, body }`), `DELETE /api/comments/:id` (body `{ user_id, is_admin }` — allow the delete if the comment's `user_id` matches the requester, or if `is_admin` is true).
- **Auth note**: there is no auth middleware anywhere in this codebase today — every endpoint trusts whatever `user_id`/`is_admin` the client sends (see `markGuideViewed` in `subjectController.js` for precedent). The comment-deletion check above is consistent with that existing (weak) trust model, not a new gap you're introducing. If real auth gets added later, this is one of the endpoints that would need it most.

### Frontend — already built, calling the endpoints above

All of this is already in the codebase, calling exactly the endpoints/shapes specified above — **build the backend to match this contract**, not the other way around, since the UI already exists and was verified end-to-end against a mocked/missing backend (confirmed graceful failure with no crashes):
- `screens/CommunityBoardScreen.js` — student list + category filter tabs (All / Module / Improvement), calls `GET /api/articles?user_id=`. Registered as the "Community" tab in the bottom nav (`components/BottomNav.js`).
- `screens/ArticleDetailScreen.js` (shared student/admin) — full article body, a like toggle button (`POST /api/articles/:id/like`), and a comment list + add-comment form (`GET`/`POST /api/articles/:id/comments`, `DELETE /api/comments/:id`). The delete button on a comment only renders client-side if `comment.user_id === current user` or `user.is_admin` — but **the backend must also enforce this**, since a client-side-only check is not real authorization.
- `screens/admin/AdminCommunityBoardScreen.js` — article CRUD (category picker, conditional subject-chip picker for "module" articles, multiline body), calls `GET/POST/PUT/DELETE /api/articles`. Linked from a new "Community Board" tile on `screens/admin/AdminDashboardScreen.js`.
- All three screens are registered in `navigation/AppNavigator.js` as `CommunityBoard`, `ArticleDetail`, `AdminCommunityBoard`.
- **One shape note**: `ArticleDetailScreen.js` expects each comment to optionally include a `username` field (falls back to "Student" if absent) — include a joined username in `GET /api/articles/:id/comments` if you want real names displayed, otherwise the fallback is harmless.

---

## Feature 2: Wrong-answer explanation + clue

When a student answers a quiz question incorrectly (in an Activity or a Past Paper practice quiz), show the correct answer's explanation plus a hint, and block advancing to the next question until they dismiss it.

### Data model

Two new nullable columns on the existing `quiz` table, added via the same idempotent migration pattern already used for `paper_id`/`activity_id` in `backend/database/database.js`:

```sql
ALTER TABLE quiz ADD COLUMN explanation TEXT;
ALTER TABLE quiz ADD COLUMN hint TEXT;
```

Nullable at the DB/API level on purpose — existing questions (and any direct API calls) shouldn't break. "Required" only applies at the admin **UI** form layer (validate non-empty before allowing save), not the API — this matches how every other admin-form validation in this app already works (e.g. subject name required client-side, not server-side).

### Backend

- `backend/controllers/quizController.js` — `createQuestion` and `updateQuestion` currently destructure `{ subject_id, paper_id, activity_id, question, option_a, option_b, option_c, option_d, correct_answer }` from the body and build a parameterized INSERT/UPDATE. Add `explanation` and `hint` to that destructure and to the INSERT/UPDATE column list + values array, the same way `activity_id` was added in a previous change. **Do not** add them to the required-fields validation (`if (!subject_id || !question || ...)`) — keep that check as-is.

### Frontend — already built, waiting on the backend columns

- `screens/admin/AdminActivityQuestionsScreen.js` and `screens/admin/AdminPaperQuestionsScreen.js` already have two new multiline inputs ("Explanation", "Hint / Clue"), required client-side before save (blocks the Save button with an inline error if empty), and already included in the POST/PUT body to `/api/quiz` as `explanation`/`hint`. **Until you add the columns**, the backend's `createQuestion`/`updateQuestion` will silently ignore these two extra body fields (no error — they're just not in the destructure/INSERT yet) — so questions save fine today, but the explanation/hint text typed by the admin isn't actually persisted until you wire it up.
- New shared `components/ExplanationModal.js` is built and wired into both `screens/ActivityQuizScreen.js` and `screens/PaperQuizScreen.js` — verified live: when a student picks the wrong answer, the quiz timer pauses, the modal shows the correct answer + explanation + hint, and advancing only happens after "Continue" is tapped. Right now, since the backend never stores/returns `explanation`/`hint`, the modal correctly shows its graceful fallback text ("No explanation provided for this question yet") for every question — that's expected and will start showing real content the moment the two columns exist and `getQuiz`/`GET /api/quiz` returns them (no frontend change needed, `getQuiz` already does `SELECT *`).

---

## Feature 3: Offline support + sync-when-online

This is the big one — confirmed via codebase audit that **the app currently has zero offline capability**: no `AsyncStorage`, no local cache, no `NetInfo`, every screen does a bare `fetch()` with no fallback, and session state isn't even persisted (a page refresh logs you out). The backend itself is also not genuinely "online" today — it's an Express+SQLite server that only a phone on the *same Wi-Fi* as the admin's laptop can reach (see `README.md`'s Android LAN-IP setup instructions). Both problems need fixing for "offline with sync" to mean anything real.

Scope, as agreed: **full offline coverage including downloaded PDFs**, a **hosted backend** so sync means the real internet (not just LAN), and offline support **for students only** — the admin panel can stay online-only (simpler; admins are assumed to have a connection when managing content).

Broken into four phases — **do them in order**, each depends on the previous:

### Phase A — Host the backend on the real internet

This is the actual backend work in this handover — the rest of Feature 3 is primarily frontend, but depends on this phase existing first.

- Deploy the existing Express+SQLite backend to a hosting service. `config.js` already has a commented-out Render URL (`https://offlineeducationapp.onrender.com`) — Render is the path of least resistance, but any Node host works.
- **Critical**: most hosting platforms (Render included) have an **ephemeral filesystem** — anything written to disk gets wiped on every redeploy unless you attach persistent storage. `backend/database/app.db` (the SQLite file) and everything in `backend/uploads/` (PDFs) **must** live on a persistent volume, or every redeploy silently deletes all data and every uploaded PDF. On Render specifically, this means attaching a **persistent Disk** mounted at (or symlinked to) `backend/database/` and `backend/uploads/`.
  - This keeps all existing SQLite-based backend code completely unchanged — no DB engine migration needed, just correct deployment configuration.
  - If Render's disk pricing/limits are a blocker, the fallback is migrating to a managed Postgres instance instead — a materially bigger change (rewriting every `db.run`/`db.all`/`db.get` call and the SQL dialect differences), only worth it if the persistent-disk route turns out to be unworkable.
- Update `config.js`/`config.example.js` so the hosted URL is the default `BASE_URL`, with local `localhost`/LAN-IP kept as an easy swap-in for local development (the comment-toggle pattern already there).
- Once this phase is done, "online" means the real internet for the first time in this project's history — which is the actual prerequisite for the phases below to be meaningful.

### Phase B — On-device cache (read path) — frontend-heavy

- Use `@react-native-async-storage/async-storage` for local caching, **not** `expo-sqlite` — `expo-sqlite` has no web implementation, and this project has already hit that exact class of bug twice (`react-native-webview` and `expo-document-picker` both needed `Platform.OS === 'web'` workarounds because they don't support web either). AsyncStorage works everywhere (native key-value store on iOS/Android, backed by `localStorage` on web via `react-native-web`), and the use case here — caching JSON blobs per API resource — doesn't need a relational engine anyway.
- New `utils/api.js`: a wrapper that tries the network first (with a short timeout), writes successful responses into AsyncStorage under a cache key, and falls back to the cached copy on any network failure/timeout. Every screen's existing `fetch(`${BASE_URL}/api/...`)` calls need to move onto this wrapper — mechanical, but touches most screens.
- Persist login sessions (currently not persisted anywhere — `LoginScreen.js` only passes `user` through navigation params, so a refresh logs the user out): write `user` to AsyncStorage on login, check for it on app launch and skip straight past the Login screen if found.
- Add `@react-native-community/netinfo` for connectivity detection, and a small "You're offline — showing saved content" banner shown app-wide when there's no connection.

### Phase C — Offline writes + sync queue — frontend-heavy, small backend consideration

- An AsyncStorage-backed queue: every write endpoint (`submitActivityQuiz`, `submitPaperQuiz`, the guide-view endpoint, and Feature 1's like/comment endpoints once built) goes through a new `utils/sync.js` helper — try sending immediately, and if that fails, queue it locally with a timestamp and apply the equivalent local effect right away so the UI doesn't look broken.
- On regaining connectivity (`NetInfo`'s event), replay the queue against the real API in order, then do a fresh full re-fetch to refresh the cache.
- **Backend consideration**: to make quiz-submission replays idempotent (so a student who submits offline, and whose queued action *did* actually reach the server via a flaky connection before the app realized it failed, doesn't end up with duplicate `results` rows on retry), consider accepting an optional client-generated idempotency key on `submitActivityQuiz`/`submitPaperQuiz` and having the backend ignore a repeat with the same key. This is a nice-to-have, not a blocker — worst case today, a duplicate submission just looks like an intentional retake (already a supported flow via "Try Again"), so it's not a data-integrity emergency, just slightly noisy `results` data.

### Phase D — Offline PDFs — frontend-only, native platforms only

- `expo-file-system` downloads a study guide/past paper PDF to local device storage the first time it's viewed online; `StudyGuideViewerScreen.js` checks for a local copy first, falling back to the remote URL.
- **Only works on native (iOS/Android)** — browsers have no arbitrary filesystem access, so PDFs on web will always require a live connection regardless of this phase. That's expected and fine; web is this project's dev-convenience target, not the real student-facing platform.
- Needs to detect when an admin replaces a PDF (compare the stored `filename`/`original_name` against what's cached) and re-download rather than serving a stale local copy.

### New dependencies (install via `npx expo install`, this project's established convention — see `package.json` for prior examples)
`@react-native-async-storage/async-storage`, `@react-native-community/netinfo`, `expo-file-system` (Phase D only).

---

## Verification checklist

### Feature 1
- [ ] Create an article in each category via the API (one linked to a subject, one general) — `POST /api/articles`
- [ ] Toggle-like the same article as two different `user_id`s — confirm `like_count` and `liked_by_me` behave correctly per user
- [ ] Add a comment as one user, delete it as a different (non-admin) user — should be rejected; delete it as an admin — should succeed
- [ ] `deleteArticle` removes its likes/comments too (no orphaned rows left in `article_likes`/`article_comments`)

### Feature 2
- [ ] `POST /api/quiz` with `explanation`/`hint` in the body — confirm they're stored and returned by `GET /api/quiz`
- [ ] `PUT /api/quiz/:id` updates them
- [ ] A question saved *without* `explanation`/`hint` still round-trips fine (both come back `null`, no error)

### Feature 3
- [ ] Phase A: redeploy the hosted backend and confirm existing subjects/users/results survive (the persistent disk actually persisted)
- [ ] Phase B: load the app online once, then go into airplane mode and relaunch — cached content should still render, with the offline banner visible
- [ ] Phase C: take a quiz and (once Feature 1 exists) comment on an article while offline — both should succeed locally; reconnect and confirm they land on the server with no duplicates
- [ ] Phase D: view a PDF online, go offline, reopen the same subject — the PDF should still open from the local copy (native only; expected to fail gracefully on web)
