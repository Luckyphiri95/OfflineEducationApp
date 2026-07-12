# Handover Notes

This document is for whoever picks up this project next. It covers the current state of the app, what changed most recently, known gaps, and where to look for things.

**Read `README.md` first** for setup/run instructions — but note it is **out of date** as of this handover (see [README is stale](#readme-is-stale) below).

---

## Current state (high level)

The app is a React Native/Expo student app with a Node/Express + SQLite backend, run entirely locally (no hosted backend — see `config.js`/`config.example.js`). It has:

- Student login/register, a Dashboard, a Subjects list, and per-subject detail screens.
- Each **Subject** now has four tabs: **Introduction**, **Activities**, **Study Guide**, **Past Papers**.
- An in-app **Admin panel** for managing subjects, activities, past papers, and users — no direct DB/terminal access needed day-to-day (except granting the first admin account, see README).

## What changed in the most recent branch of work (`frontend-auth`, latest commit)

The subject screen was restructured from a single "Start Quiz" + "View Study Guide" + "Past Papers" button layout into a 4-tab interface, and the single subject-wide quiz was replaced by multiple independent **Activities** (named mini-quizzes). Progress tracking was redefined from *last quiz score* to *completion ratio* (how much of the uploaded content a student has actually done).

### Data model
- New `activities` table (`id, subject_id, title, created_at`).
- New `guide_views` table — tracks which (user, subject) pairs have opened the study guide PDF, since that's now part of the completion calculation.
- `quiz` and `results` tables gained `activity_id` (nullable) columns; `results` also gained a `type` column (`'activity'` or `'paper'`) to disambiguate which kind of attempt a row represents. This fixed a real bug where a paper attempt and an activity attempt could silently collide when computing "latest result per subject."
- **Migration**: on server startup, any pre-existing subject-wide quiz questions (rows with no `paper_id` and no `activity_id`) are automatically grouped into a new "General Quiz" activity per subject, and their `results` rows are backfilled the same way. This is self-guarding (only touches rows where `activity_id IS NULL`), so it's safe to restart the server repeatedly — it won't create duplicate activities.

### Backend (all in `backend/`)
- `controllers/activityController.js` + `routes/activityRoutes.js` — CRUD for activities (`GET/POST /api/activities`, `PUT/DELETE /api/activities/:id`). Deleting an activity cascades to delete its questions.
- `controllers/paperController.js` + `routes/paperRoutes.js` — CRUD + PDF upload for past papers (`/api/papers`, `/api/papers/:id/file`).
- `controllers/progressController.js` + `routes/progressRoutes.js` — `GET /api/progress?user_id=` computes, per subject, `{ total, completed, pct, status }`. This is the single source of truth for the completion percentage — every screen that shows a progress bar calls this instead of computing it independently.
- `controllers/quizController.js` — `submitActivityQuiz` (new) alongside the existing `submitPaperQuiz`; `createQuestion`/`updateQuestion` now accept an optional `activity_id`.
- `controllers/subjectController.js` — new `markGuideViewed` (`POST /api/subjects/:id/guide/view`), called by the app the first time a student opens a subject's study guide.
- `middleware/upload.js` — shared multer config for both subject-guide and past-paper PDF uploads (files land in `backend/uploads/`, gitignored).

### Frontend (all in `screens/`)
- `SubjectDetailsScreen.js` — rewritten with the 4-tab layout described above.
- `ActivityQuizScreen.js` (new), `PaperQuizScreen.js` (kept, unchanged in behavior) — the actual quiz-taking UI, filtered by `activity_id`/`paper_id` respectively.
- `StudyGuideViewerScreen.js` — in-app PDF viewer (native: `react-native-webview`; web: plain `<iframe>`, since `react-native-webview` has no web implementation).
- `ResultsScreen.js` — now branches "Try Again" between `ActivityQuiz`/`PaperQuiz` depending on what was just taken.
- `admin/AdminActivitiesScreen.js` + `admin/AdminActivityQuestionsScreen.js` (new) — replace the old `AdminQuestionsScreen.js` (deleted).
- `admin/AdminPapersScreen.js` + `admin/AdminPaperQuestionsScreen.js` — past papers admin (unchanged from prior work).
- `utils/progress.js` — now just a thin wrapper around `GET /api/progress`; no longer computes anything client-side.
- **Deleted**: `QuizScreen.js` (old single subject-wide quiz), `admin/AdminQuestionsScreen.js`, `PastPapersScreen.js` (its content is now inlined into the Past Papers tab).

---

## Known gaps / things to look at next

### README is stale
`README.md` still documents the **old** structure — it references `PDF_GUIDES`/`TOPICS_BY_SUBJECT` hardcoded maps in `SubjectDetailsScreen.js` (both removed), the single `QuizScreen`/`AdminQuestionsScreen` (both deleted), and the `POST /api/submitQuiz` endpoint (replaced by `submitActivityQuiz`/`submitPaperQuiz`). It needs a rewrite covering: the 4-tab subject layout, Activities admin flow, Past Papers admin flow (PDF upload), and the new `/api/activities`, `/api/papers`, `/api/progress` endpoints. I did not update it as part of this session — flagging it here so it doesn't get missed.

### Progress calculation doesn't count PDF-only past papers
A past paper that only has an uploaded PDF (no practice questions attached) currently doesn't count toward a subject's completion total or completed count — only papers *with* practice questions do, since there's no "viewed this paper's PDF" tracking (unlike the study guide, which does have `guide_views`). If that matters for how progress should read, it would need a similar per-paper view-tracking table.

### APK build phase not started
Per earlier discussion, packaging this as a distributable APK (via EAS Build) is a separate, not-yet-started phase. `eas.json` already has `development`/`preview`/`production` profiles configured — see the conversation history or ask the team for the plan that was discussed (build a dev-client APK once, then iterate via `expo start --dev-client`; only rebuild when native dependencies change).

### Not yet merged to `main`
`main` currently only contains the initial scaffold commit — all real development has happened on `frontend-auth` (and its predecessor branches). This work has **not been merged into `main` yet**. See the PR instructions below.

### Test/debug accounts
Backend testing during this work used throwaway accounts (`debugadmin@test.com`, `debugstudent@test.com`) and dummy activities/results — all were cleaned up after each verification pass, so the committed database migration is the only lasting backend-side change (no test data was committed; `backend/database/app.db` itself is gitignored anyway).

---

## Opening a PR into `main`

`main` is currently just the initial scaffold, so this PR will be large (it's effectively "bring main up to date with everything built so far"). Steps:

1. Confirm the branch is pushed (it already is, as of this handover — `frontend-auth` is up to date with `origin/frontend-auth`).
2. Go to `https://github.com/Luckyphiri95/OfflineEducationApp/compare/main...frontend-auth` — GitHub will show the diff and a "Create pull request" button.
3. Title suggestion: `Bring main up to date: full app implementation through subject restructure`.
4. In the description, summarize the major milestones (subjects/quiz/admin panel → study guides → past papers → this tab restructure) — or link to this HANDOVER.md.
5. Since `main` is essentially empty, there's nothing to conflict with — the merge should be clean.

If you'd rather use the `gh` CLI instead of the web UI, install it (`brew install gh` on Mac), run `gh auth login` once, then:
```bash
gh pr create --base main --head frontend-auth --title "Bring main up to date: full app implementation through subject restructure" --body-file HANDOVER.md
```
