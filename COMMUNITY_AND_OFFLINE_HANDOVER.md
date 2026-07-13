# Handover: Community Board, Quiz Explanations & Offline Support

This document is for the developer picking up backend work on **MzansiGo** (formerly "OfflineEducationApp" — see `README.md`). It describes three pieces of scoped-but-not-yet-built work, in enough detail to implement directly. Nothing described here has been built yet — this is a plan, not a changelog.

**Read `README.md` and `HANDOVER.md` first** for the current state of the app (architecture, existing screens/endpoints, admin flows). This document only covers the three new pieces below.

**Recommended order: Feature 1 → Feature 2 → Feature 3.** Features 1 and 2 are fully self-contained and low-risk. Feature 3 (offline support) is a large architecture change that touches how *every* screen fetches data — building it last avoids having to redo Features 1/2's screens on top of a data-fetching layer that doesn't exist yet when you start them.

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

### Frontend — what already exists / what to expect calling into

The frontend work for this feature is **not yet built either** — if you're doing backend-only work, coordinate with whoever picks up the frontend side on the exact request/response shapes above before finalizing them, since these are proposed shapes, not a contract that's already been agreed with working UI. For reference, the intended frontend pieces are:
- New student screen `screens/CommunityBoardScreen.js` (list + category filter tabs), new shared `screens/ArticleDetailScreen.js` (full article + like + comments), new admin screen `screens/admin/AdminCommunityBoardScreen.js` (article CRUD).
- New bottom-nav tab in `components/BottomNav.js`, new admin dashboard tile in `screens/admin/AdminDashboardScreen.js`, new routes registered in `navigation/AppNavigator.js` (`CommunityBoard`, `ArticleDetail`, `AdminCommunityBoard`).

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

### Frontend — what already exists / what to expect calling into

Again, not yet built — the intended frontend pieces, for context:
- `screens/admin/AdminActivityQuestionsScreen.js` and `screens/admin/AdminPaperQuestionsScreen.js` (currently identical question-CRUD forms) get two new multiline inputs ("Explanation", "Hint / Clue"), required before save, included in the POST/PUT body to `/api/quiz`.
- A new shared `components/ExplanationModal.js`, shown by `screens/ActivityQuizScreen.js` and `screens/PaperQuizScreen.js` when a student picks the wrong answer — showing the correct answer, explanation, and hint, with a "Continue" button. Legacy questions with no `explanation`/`hint` set should still show the modal, with a graceful fallback message ("No explanation provided for this question yet") rather than blank text — so the backend response for a question should just return `null` for these fields as-is; the frontend handles the fallback display.

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
