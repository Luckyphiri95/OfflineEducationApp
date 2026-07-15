# MzansiGo

A React Native / Expo student learning app — each subject has an Introduction, multiple quiz Activities, a PDF Study Guide, and Past Papers (with their own practice quizzes) — plus a Community Board, offline support with background sync, and an in-app admin panel for managing all of it.

> Formerly "OfflineEducationApp" — the GitHub repo and project folder keep the original name; only the app's display name and branding have changed to MzansiGo.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Prerequisites](#prerequisites)
3. [Project Structure](#project-structure)
4. [Setup & Running the Project](#setup--running-the-project)
5. [Running on a Physical Android Device](#running-on-a-physical-android-device)
6. [App Structure: Subjects & Progress](#app-structure-subjects--progress)
7. [Community Board](#community-board)
8. [Offline Support](#offline-support)
9. [Admin Panel](#admin-panel)
10. [Hosted Backend (Render) & Building the APK](#hosted-backend-render--building-the-apk)
11. [API Reference](#api-reference)
12. [Testing](#testing)
13. [Troubleshooting](#troubleshooting)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile App | React Native + Expo SDK 56 |
| Navigation | React Navigation v7 (Stack) |
| On-device storage | `@react-native-async-storage/async-storage` (cache, session, sync queue) |
| Connectivity | `@react-native-community/netinfo` |
| Offline PDFs | `expo-file-system` (native only) |
| Backend | Node.js + Express |
| Database | SQLite (via sqlite3) |
| File uploads | multer (PDF study guides & past papers) |
| Auth | bcrypt password hashing |
| Hosting | Render (free tier) — see [Hosted Backend](#hosted-backend-render--building-the-apk) |
| APK builds | EAS Build (`eas.json`, `preview` profile) |

---

## Prerequisites

- **Node.js** v18 or higher — https://nodejs.org
- **npm** v9 or higher (comes with Node.js)
- **Expo Go** app on your phone — install from the App Store or Google Play (for quick testing without a full build)
- **Git** — https://git-scm.com
- **sqlite3** CLI — for local admin/DB access (`brew install sqlite3` on Mac)
- **EAS CLI** (`npm install -g eas-cli`) — only needed if building a standalone APK

---

## Project Structure

```
OfflineEducationApp/
├── App.js                    # Entry point — mounts SyncManager + OfflineBanner above the navigator
├── config.example.js         # Template — copy to config.js on first setup
├── config.js                 # Your local/hosted BASE_URL
├── render.yaml                # Render Blueprint — see Hosted Backend section
├── eas.json                   # EAS Build profiles (development / preview / production)
│
├── backend/
│   ├── server.js             # Express server (port 3000)
│   ├── controllers/
│   │   ├── authController.js       # register/login/users + promoteToAdmin
│   │   ├── subjectController.js    # subjects CRUD + study guide upload/view-tracking
│   │   ├── activityController.js   # activities CRUD (per-subject mini-quizzes)
│   │   ├── paperController.js      # past papers CRUD + PDF upload
│   │   ├── quizController.js       # question CRUD (incl. explanation/hint) + quiz scoring
│   │   ├── progressController.js   # per-subject completion % calculation
│   │   └── articleController.js    # Community Board: articles, likes, comments
│   ├── routes/                     # one file per controller above
│   ├── middleware/upload.js  # shared multer config for PDF uploads
│   ├── uploads/               # uploaded PDFs land here (gitignored)
│   └── database/database.js  # SQLite table definitions + migrations (app.db auto-created)
│
├── navigation/
│   └── AppNavigator.js       # All screen routes; resumes a saved session on launch
│
├── screens/
│   ├── LoginScreen.js / RegisterScreen.js / ForgotPasswordScreen.js
│   ├── DashboardScreen.js / SubjectScreen.js
│   ├── SubjectDetailsScreen.js   # 4-tab layout: Introduction / Activities / Study Guide / Past Papers
│   ├── ActivityQuizScreen.js / PaperQuizScreen.js  # quiz-taking, with wrong-answer explanation modal
│   ├── StudyGuideViewerScreen.js # in-app PDF viewer, caches PDFs on-device for offline viewing
│   ├── ResultsScreen.js / ProgressScreen.js
│   ├── CommunityBoardScreen.js / ArticleDetailScreen.js
│   └── admin/
│       ├── AdminDashboardScreen.js / AdminSubjectsScreen.js / AdminUsersScreen.js
│       ├── AdminActivitiesScreen.js / AdminActivityQuestionsScreen.js
│       ├── AdminPapersScreen.js / AdminPaperQuestionsScreen.js
│       ├── AdminCommunityBoardScreen.js
│       └── AdminProgressScreen.js
│
├── components/
│   ├── Button.js / Input.js / Loader.js / Card.js
│   ├── BottomNav.js / ProgressCard.js / StatsCard.js / ScoreDashboard.js
│   ├── AnswerSelection.js / QuestionCard.js / ExplanationModal.js
│   ├── SearchSubjects.js / confirmAction pattern
│   ├── BrandedLoadingScreen.js  # MzansiGo splash-style loading screen (login + app launch)
│   ├── OfflineBanner.js         # "You're offline" banner, connectivity-aware
│   └── SyncManager.js           # invisible root component, flushes the offline write queue
│
├── theme/
│   └── colors.js             # Design system colours (incl. brandNavy/brandGold)
│
├── utils/
│   ├── api.js         # apiGet(path, cacheKey) — network-first with AsyncStorage cache fallback
│   ├── syncQueue.js   # enqueueOrSend/flushQueue — offline write queue with mutex-protected flush
│   ├── network.js     # connectivity subscription, fed by both NetInfo and real fetch outcomes
│   ├── session.js     # persists the logged-in user across app restarts
│   ├── pdfCache.js    # downloads study guide/past paper PDFs for offline viewing (native only)
│   ├── progress.js    # thin wrapper around GET /api/progress
│   └── confirmAction.js
│
└── assets/
    ├── mzansigo-logo.jpeg      # original brand reference (kept for provenance)
    └── mzansigo-logo-navy.png # cleaned-up version used by BrandedLoadingScreen
```

---

## Setup & Running the Project

### 1. Clone the repository

```bash
git clone https://github.com/Luckyphiri95/OfflineEducationApp.git
cd OfflineEducationApp
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd backend && npm install && cd ..
```

### 4. Set your BASE_URL in config.js

`config.js` is tracked in git and currently points at whichever backend you're testing against — either your local server or the hosted Render instance. Open it and set:

```js
const BASE_URL = 'http://localhost:3000';
export default BASE_URL;
```

or, to test against the hosted backend instead of running one locally:

```js
const BASE_URL = 'https://mzansigo-backend.onrender.com';
export default BASE_URL;
```

See `config.example.js` for the full set of options (including Android-device local-IP setup) and [Hosted Backend](#hosted-backend-render--building-the-apk) for the free-tier caveats.

### 5. Start the backend server (skip if using the hosted backend)

```bash
node backend/server.js
```

You should see:
```
Connected to SQLite database
Server running on port 3000
```

The database file `backend/database/app.db` is created automatically on first run, and any pending schema migrations run automatically too. Keep this terminal open.

> **Tip:** `npm run dev` (from the project root) starts both the backend and Expo together in one terminal.

> If the terminal returns to the prompt immediately, another process is using port 3000: `lsof -ti:3000 | xargs kill -9`, then restart.

### 6. Start the Expo app

```bash
npx expo start
```

- Press **W** to open in a web browser
- Scan the **QR code** with Expo Go on your phone
- Press **A** to open in an Android emulator

---

## Running on a Physical Android Device

`localhost` on a phone refers to the phone itself, not your machine. Either:

- **Point at the hosted backend** — set `config.js` to `https://mzansigo-backend.onrender.com` and skip the rest of this section entirely, or
- **Point at your local backend**, using your machine's LAN IP:

```bash
# Mac
ipconfig getifaddr en0
# Windows
ipconfig
```

```js
const BASE_URL = 'http://192.168.0.5:3000';  // ← replace with your IP
export default BASE_URL;
```

Your machine and phone must be on the **same Wi-Fi network**. Then `npx expo start` and scan the QR code with Expo Go.

> **Standalone APK builds** (not Expo Go) bake `config.js` in at build time — see [Hosted Backend & Building the APK](#hosted-backend-render--building-the-apk).

---

## App Structure: Subjects & Progress

Each subject (`SubjectDetailsScreen.js`) has four tabs:

| Tab | What it shows |
|---|---|
| **Introduction** | The subject's description plus a static "What You Will Learn" list |
| **Activities** | Independent named mini-quizzes — each has its own questions, score, and (on a wrong answer) an explanation + hint modal |
| **Study Guide** | A single PDF per subject, viewable in-app and cached on-device after the first view so it's readable offline |
| **Past Papers** | A list of past exam papers per subject, each with an optional PDF (also cached after first view) and an optional practice quiz |

### Progress

```
completed = (activities attempted) + (past papers with practice attempted) + (1 if study guide viewed)
total     = (activities with questions) + (past papers with practice questions) + (1 if a study guide PDF is uploaded)
pct       = completed / total
```

Computed server-side by `GET /api/progress?user_id=` (`backend/controllers/progressController.js`); the frontend (`utils/progress.js`) just fetches and displays it. If nothing has been uploaded for a subject yet, its status shows **"No Content"** rather than 0%.

---

## Community Board

Admin-authored articles in two categories — **module** (tied to a subject) or **improvement** (general, no subject link) — that students browse, like, and comment on.

- Students can toggle a like per article (tap again to unlike) and post/delete their own comments.
- Admins can delete any comment (moderation) and manage articles from **Admin → Community Board**.
- Both liking and commenting work offline — see [Offline Support](#offline-support).

---

## Offline Support

The student-facing app works fully offline once content has been loaded once:

- **On-device caching** (`utils/api.js`) — every read (`GET /api/subjects`, `/api/activities`, `/api/papers`, `/api/quiz`, `/api/results`, `/api/progress`, `/api/articles`, comments) tries the network first and falls back to the last cached response on failure, so previously-viewed content still renders offline.
- **Session persistence** (`utils/session.js`) — logging in survives an app restart/reload; you're taken straight to the Dashboard/Admin Dashboard instead of back to Login.
- **Offline writes + sync** (`utils/syncQueue.js`) — quiz submissions, study-guide view tracking, article likes, and comments all queue locally when offline and replay automatically once connectivity returns. The queue is mutex-protected so a flaky reconnect can't double-submit the same action twice.
- **Offline PDFs** (`utils/pdfCache.js`, native only) — study guide and past paper PDFs download to the device the first time they're opened online, then load from that local copy on every subsequent open, including offline. Not available on web (browsers have no persistent filesystem access) — web always falls back to fetching the PDF directly.
- **Offline banner** (`components/OfflineBanner.js`) — a small banner appears app-wide whenever there's no connection, driven both by the device's connectivity state and by real fetch failures (more reliable than connectivity events alone, especially on web).

Admin screens are **online-only** — they always hit the live API directly, since content management isn't expected to work without a connection.

---

## Admin Panel

The app includes a built-in admin panel for managing subjects, activities, past papers, articles, and users.

### Granting admin access

Admin accounts are regular user accounts with an `is_admin` flag.

**Local database** — after registering an account, run:

```bash
sqlite3 backend/database/app.db "UPDATE users SET is_admin = 1 WHERE email = 'your@email.com';"
```

Then restart the backend server.

**Hosted (Render) backend** — there's no database shell access on the free tier, so use the `promote-admin` endpoint instead (gated by a secret you set yourself, never committed to git):

1. In the Render dashboard → your service → **Environment**, add `ADMIN_PROMOTE_SECRET` = a password of your choice.
2. Register the account you want promoted (through the app, or `POST /api/auth/register`).
3. Promote it:
   ```bash
   curl -X POST https://mzansigo-backend.onrender.com/api/auth/promote-admin \
     -H "Content-Type: application/json" \
     -d '{"email":"you@example.com","secret":"the-secret-you-set-in-step-1"}'
   ```

### Logging in as admin

On the Login screen, tap **Admin** in the Student | Admin toggle, then enter the admin credentials. Non-admin accounts attempting admin login are blocked with an error.

### What the admin panel can do

| Screen | Actions |
|---|---|
| **Admin Dashboard** | Overview — total subjects, questions, and users |
| **Subjects** | Add/edit/delete subjects; upload/replace/remove each subject's Study Guide PDF |
| **Activities** | Add/edit/delete named Activities per subject; manage each Activity's questions (incl. explanation + hint for wrong answers) |
| **Past Papers** | Add/edit/delete Past Papers and their PDFs; manage each paper's practice questions |
| **Community Board** | Add/edit/delete articles; delete any comment |
| **Users** | View all registered users, delete accounts |

### Resetting the local database

```bash
rm backend/database/app.db
node backend/server.js
```

All tables are recreated automatically; re-grant admin access and re-add content afterward.

---

## Hosted Backend (Render) & Building the APK

The backend is deployable to Render's free tier via the `render.yaml` Blueprint at the repo root — see **`RENDER_DEPLOYMENT.md`** for the exact click-through steps and free-tier caveats (no persistent disk — the database resets on redeploy/restart).

To build an installable Android APK (not Expo Go) pointing at whatever `config.js` currently has set:

```bash
eas build -p android --profile preview
```

This uploads the project to EAS Build and returns an install link/QR code once it finishes (~10-15 min). Since `config.js` is baked in at build time, **make sure it points at a URL reachable from the test device** (the hosted Render URL, not `localhost`) before building — a build made with `localhost` will fail every request on a real device.

---

## API Reference

All endpoints are relative to your `BASE_URL` (`http://localhost:3000` locally, or the hosted Render URL).

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login (returns `is_admin` flag) |
| GET | `/api/auth/users` | List all users |
| POST | `/api/auth/promote-admin` | Grant `is_admin` to an account (`{ email, secret }`, requires `ADMIN_PROMOTE_SECRET` env var) |
| DELETE | `/api/auth/users/:id` | Delete a user |

### Subjects & Study Guide

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/subjects` | List all subjects |
| POST | `/api/subjects` | Create a subject |
| PUT | `/api/subjects/:id` | Update a subject |
| DELETE | `/api/subjects/:id` | Delete a subject |
| POST | `/api/subjects/:id/guide` | Upload/replace a subject's study guide PDF (`multipart/form-data`, field `pdf`) |
| DELETE | `/api/subjects/:id/guide` | Remove a subject's study guide PDF |
| POST | `/api/subjects/:id/guide/view` | Record that a user has viewed the study guide (body: `{ user_id }`) |

### Activities & Questions

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/activities` | List all activities |
| POST | `/api/activities` | Create an activity (`{ subject_id, title }`) |
| PUT / DELETE | `/api/activities/:id` | Update / delete (cascades to its questions) |
| GET | `/api/quiz` | Get all quiz questions (filter client-side by `activity_id`/`paper_id`) |
| POST | `/api/quiz` | Add a question (`{ subject_id, activity_id?, paper_id?, question, option_a..d, correct_answer, explanation?, hint? }`) |
| PUT / DELETE | `/api/quiz/:id` | Update / delete a question |
| POST | `/api/submitActivityQuiz` | Submit answers (`{ user_id, subject_id, activity_id, answers }`) → returns score |

### Past Papers

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/papers` | List all past papers |
| POST | `/api/papers` | Create a past paper (`{ subject_id, title, year }`) |
| PUT / DELETE | `/api/papers/:id` | Update / delete (cascades to its questions + PDF file) |
| POST | `/api/papers/:id/file` | Upload/replace a past paper's PDF (`multipart/form-data`, field `pdf`) |
| DELETE | `/api/papers/:id/file` | Remove a past paper's PDF |
| POST | `/api/submitPaperQuiz` | Submit answers (`{ user_id, subject_id, paper_id, answers }`) → returns score |

### Community Board

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/articles` | List all articles |
| POST | `/api/articles` | Create an article (`{ title, body, category, subject_id?, author_id }`) |
| PUT / DELETE | `/api/articles/:id` | Update / delete an article |
| POST | `/api/articles/:id/like` | Toggle like for the requesting user |
| GET | `/api/articles/:id/comments` | List comments on an article |
| POST | `/api/articles/:id/comments` | Add a comment (`{ user_id, body }`) |
| DELETE | `/api/comments/:id` | Delete a comment |

### Results & Progress

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/results` | Get all quiz results (filter client-side by `user_id`); each row has a `type` of `'activity'` or `'paper'` |
| GET | `/api/progress?user_id=` | Per-subject completion `{ subject_id, total, completed, pct, status }` |

Uploaded PDFs are served statically at `<BASE_URL>/uploads/<filename>`.

---

## Testing

See **`TESTING.md`** for the full tester-facing test case document, covering setup, student flow, admin flow, Community Board, quiz explanations, offline behavior, and edge cases.

---

## Troubleshooting

### Server exits immediately after starting

```bash
lsof -ti:3000 | xargs kill -9
node backend/server.js
```

### "Could not connect to server"

- Confirm the backend is running, or that `config.js` points at a reachable hosted URL
- For Android device testing, confirm both devices are on the same Wi-Fi network (if using a local backend)

### "User not found" after granting admin locally

The server wasn't restarted after the `UPDATE users` command. Kill all instances and restart.

### 500 error on login or register

The database may be corrupted:

```bash
rm backend/database/app.db
node backend/server.js
```

### Activities tab or Past Papers tab shows nothing

No activities/papers have been added for that subject yet — add them from the admin panel.

### Hosted backend feels slow on first request

Render's free tier spins the instance down after inactivity; the first request after idle can take ~30-50 seconds to wake it up. This is expected — not a bug.

### App shows stale/cached data instead of the latest changes

That's the offline cache working as intended when there's no connection. Confirm you actually have connectivity (the offline banner should be visible if not) — if online and still stale, pull-to-refresh or navigate away and back to force a fresh fetch.

### A build made with `config.js` pointing at `localhost` fails every request on a real device

Expected — `localhost` on a physical device means the device itself. Rebuild after pointing `config.js` at a reachable URL (see [Hosted Backend & Building the APK](#hosted-backend-render--building-the-apk)).
