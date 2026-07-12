# Offline-First Educational Mobile App

A React Native / Expo mobile application for student learning — each subject has an Introduction, multiple quiz Activities, a PDF Study Guide, and Past Papers (with their own practice quizzes) — plus an in-app admin panel for managing all of it, and completion-based progress tracking.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Prerequisites](#prerequisites)
3. [Project Structure](#project-structure)
4. [Setup & Running the Project](#setup--running-the-project)
5. [Running on a Physical Android Device](#running-on-a-physical-android-device)
6. [App Structure: Subjects & Progress](#app-structure-subjects--progress)
7. [Admin Panel](#admin-panel)
8. [API Reference](#api-reference)
9. [Testing Checklist](#testing-checklist)
10. [Troubleshooting](#troubleshooting)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile App | React Native + Expo SDK 56 |
| Navigation | React Navigation v7 (Stack) |
| Backend | Node.js + Express (runs locally) |
| Database | SQLite (via sqlite3) |
| File uploads | multer (PDF study guides & past papers) |
| Auth | bcrypt password hashing |

---

## Prerequisites

Make sure the following are installed on your machine before you begin:

- **Node.js** v18 or higher — https://nodejs.org
- **npm** v9 or higher (comes with Node.js)
- **Expo Go** app on your phone — install from the App Store or Google Play
- **Git** — https://git-scm.com
- **sqlite3** CLI — for granting admin access (`brew install sqlite3` on Mac)

---

## Project Structure

```
OfflineEducationApp/
├── App.js                    # Entry point
├── config.example.js         # Template — copy to config.js on first setup
├── config.js                 # Your local BASE_URL (gitignored)
├── index.js                  # Expo entry registration
│
├── backend/
│   ├── server.js             # Express server (port 3000)
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── subjectController.js    # subjects CRUD + study guide upload/view-tracking
│   │   ├── activityController.js   # activities CRUD (per-subject mini-quizzes)
│   │   ├── paperController.js      # past papers CRUD + PDF upload
│   │   ├── quizController.js       # question CRUD + quiz scoring
│   │   └── progressController.js   # per-subject completion % calculation
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── subjectRoutes.js
│   │   ├── activityRoutes.js
│   │   ├── paperRoutes.js
│   │   ├── quizRoutes.js
│   │   └── progressRoutes.js
│   ├── middleware/
│   │   └── upload.js         # shared multer config for PDF uploads
│   ├── uploads/               # uploaded PDFs land here (gitignored)
│   └── database/
│       └── database.js       # SQLite table definitions + migrations (app.db auto-created)
│
├── navigation/
│   └── AppNavigator.js       # All screen routes
│
├── screens/
│   ├── LoginScreen.js        # Student/Admin toggle
│   ├── RegisterScreen.js
│   ├── ForgotPasswordScreen.js
│   ├── DashboardScreen.js
│   ├── SubjectScreen.js
│   ├── SubjectDetailsScreen.js   # 4-tab layout: Introduction / Activities / Study Guide / Past Papers
│   ├── ActivityQuizScreen.js     # taking a named Activity's quiz
│   ├── PaperQuizScreen.js        # taking a past paper's practice quiz
│   ├── StudyGuideViewerScreen.js # in-app PDF viewer (native WebView / web iframe)
│   ├── ResultsScreen.js
│   ├── ProgressScreen.js
│   └── admin/
│       ├── AdminDashboardScreen.js
│       ├── AdminSubjectsScreen.js         # subjects + study guide PDF upload
│       ├── AdminActivitiesScreen.js       # activities per subject
│       ├── AdminActivityQuestionsScreen.js # questions per activity
│       ├── AdminPapersScreen.js           # past papers + PDF upload per subject
│       ├── AdminPaperQuestionsScreen.js   # practice questions per past paper
│       └── AdminUsersScreen.js
│
├── components/
│   ├── Button.js
│   ├── Input.js
│   ├── Loader.js
│   ├── BottomNav.js
│   ├── ProgressCard.js
│   ├── StatsCard.js
│   └── ScoreDashboard.js
│
├── theme/
│   └── colors.js             # Design system colours
│
└── utils/
    └── progress.js           # Thin wrapper around GET /api/progress
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

### 4. Create your local config file

```bash
cp config.example.js config.js
```

Open `config.js` and set the URL:

- **Web browser testing** — use `http://localhost:3000`
- **Android device testing** — use your machine's local IP (see [Running on a Physical Android Device](#running-on-a-physical-android-device))

```js
const BASE_URL = 'http://localhost:3000';
export default BASE_URL;
```

> `config.js` is gitignored — every developer keeps their own copy.

### 5. Start the backend server

Open a **first terminal** and run:

```bash
node backend/server.js
```

You should see:
```
Connected to SQLite database
Server running on port 3000
```

The database file `backend/database/app.db` is created automatically on first run, and any pending schema migrations (new tables/columns from ongoing development) run automatically too — this is safe to happen on every restart. Keep this terminal open — the server must stay running while using the app.

> **Important:** If the terminal returns to the prompt immediately, another process may still be using port 3000. Run `lsof -ti:3000 | xargs kill -9` then restart the server.

> **Tip:** `npm run dev` (from the project root) starts both the backend and Expo together in one terminal — see `package.json`.

### 6. Start the Expo app

Open a **second terminal** and run:

```bash
npx expo start
```

- Press **W** to open in a web browser
- Scan the **QR code** with the Expo Go app on your phone
- Press **A** to open in an Android emulator (if one is running)

Both terminals must stay open while testing.

---

## Running on a Physical Android Device

When testing on an Android phone, `localhost` points to the phone itself — not your machine. You must use your machine's local IP address.

### Step 1 — Find your IP

```bash
# Mac
ipconfig getifaddr en0

# Windows
ipconfig
```

Example output: `192.168.0.5`

### Step 2 — Update config.js

```js
const BASE_URL = 'http://192.168.0.5:3000';  // ← replace with your IP
export default BASE_URL;
```

### Step 3 — Same Wi-Fi network

Your machine and Android phone must be connected to the **same Wi-Fi network**.

### Step 4 — Scan the QR code with Expo Go

Run `npx expo start` and scan the QR code shown in the terminal.

---

## App Structure: Subjects & Progress

Each subject (`SubjectDetailsScreen.js`) is organized into four tabs:

| Tab | What it shows |
|---|---|
| **Introduction** | The subject's description (set via the admin panel) plus a static "What You Will Learn" list |
| **Activities** | Independent named mini-quizzes (e.g. "Chapter 1 Quiz", "Chapter 2 Quiz") — each has its own set of questions and its own timer/score, unrelated to the others |
| **Study Guide** | A single PDF per subject, viewable in-app; the first time a student opens it, that's recorded so it counts toward their progress |
| **Past Papers** | A list of past exam papers per subject, each with an optional PDF to view and an optional set of practice questions to attempt |

### Progress

A subject's progress bar reflects **completion**, not quiz score:

```
completed = (activities attempted) + (past papers with practice attempted) + (1 if study guide viewed)
total     = (activities with questions) + (past papers with practice questions) + (1 if a study guide PDF is uploaded)
pct       = completed / total
```

- If nothing has been uploaded for a subject yet, its status shows **"No Content"** rather than 0%.
- This is computed entirely server-side by `GET /api/progress?user_id=` (see `backend/controllers/progressController.js`) — the frontend (`utils/progress.js`) just fetches and displays it.
- A past paper that only has an uploaded PDF (no practice questions attached) does **not** currently count toward the total — only past papers *with* practice questions do, since there's no "viewed this paper's PDF" tracking (only the study guide has that).
- `ProgressScreen.js` separately shows an "Avg Score" stat and a "Recent Quizzes" list — those are based on actual quiz scores (from the `results` table) and are independent of the completion percentage above.

---

## Admin Panel

The app includes a built-in admin panel for managing subjects, activities, past papers, and users — no terminal or database access required after initial setup.

### Granting admin access

Admin accounts are regular user accounts with an `is_admin` flag. After registering an account through the app, run this command to grant admin access:

```bash
sqlite3 backend/database/app.db "UPDATE users SET is_admin = 1 WHERE email = 'your@email.com';"
```

Then **restart the backend server** — kill it with Ctrl+C and run `node backend/server.js` again.

> Only one server instance should be running. Check with `lsof -ti:3000` before restarting.

### Logging in as admin

On the Login screen, tap **Admin** in the Student | Admin toggle, then enter the admin credentials. Non-admin accounts attempting admin login will be blocked with an error.

### What the admin panel can do

| Screen | Actions |
|---|---|
| **Admin Dashboard** | Overview — total subjects, questions, and users |
| **Subjects** | Add, edit, and delete subjects; upload/replace/remove each subject's Study Guide PDF |
| **Activities** | Select a subject, then add/edit/delete named Activities; tap **Questions** on an Activity to add/edit/delete its questions |
| **Past Papers** | Select a subject, then add/edit/delete Past Papers and upload/replace/remove each one's PDF; tap **Questions** on a paper to add/edit/delete its practice questions |
| **Users** | View all registered users, delete accounts |

### Adding a new subject

1. Log in as admin → tap **Subjects**
2. Tap **+ Add Subject**, fill in the name and description, tap **Save**
3. Optionally, edit the subject again to upload a Study Guide PDF (the upload option only appears once the subject has been saved)

### Adding activities and their questions

1. Log in as admin → tap **Activities**
2. Select the subject using the chips at the top
3. Tap **+ Add Activity**, give it a title (e.g. "Chapter 1 Quiz"), tap **Save**
4. Tap **Questions** on that activity, then **+ Add Question** — fill in the question, four options, and select the correct answer (A/B/C/D), tap **Save**
5. Repeat for as many activities/questions as needed — each activity is fully independent, so a student's attempt on one doesn't affect any other

### Adding past papers and their practice questions

1. Log in as admin → tap **Past Papers**
2. Select the subject using the chips at the top
3. Tap **+ Add Past Paper**, fill in a title and year, tap **Save**
4. Edit the paper again to upload its PDF (**Upload PDF** button, appears once saved)
5. Tap **Questions** on that paper to add practice questions, same form as Activities

### Resetting the database

If the database becomes corrupted or you want a clean slate:

```bash
rm backend/database/app.db
node backend/server.js
```

All tables are recreated automatically. You will need to re-grant admin access and re-add content via the admin panel.

---

## API Reference

All endpoints are available at `http://localhost:3000`.

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login (returns `is_admin` flag) |
| GET | `/api/auth/users` | List all users |
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
| GET | `/api/activities` | List all activities (all subjects) |
| POST | `/api/activities` | Create an activity (`{ subject_id, title }`) |
| PUT | `/api/activities/:id` | Update an activity |
| DELETE | `/api/activities/:id` | Delete an activity (cascades: deletes its questions) |
| GET | `/api/quiz` | Get all quiz questions (activity- and paper-scoped alike — filter client-side by `activity_id`/`paper_id`) |
| POST | `/api/quiz` | Add a question (`{ subject_id, activity_id? , paper_id?, question, option_a..d, correct_answer }`) |
| PUT | `/api/quiz/:id` | Update a question |
| DELETE | `/api/quiz/:id` | Delete a question |
| POST | `/api/submitActivityQuiz` | Submit answers for an Activity (`{ user_id, subject_id, activity_id, answers }`) → returns score |

### Past Papers

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/papers` | List all past papers (all subjects) |
| POST | `/api/papers` | Create a past paper (`{ subject_id, title, year }`) |
| PUT | `/api/papers/:id` | Update a past paper |
| DELETE | `/api/papers/:id` | Delete a past paper (cascades: deletes its questions + PDF file) |
| POST | `/api/papers/:id/file` | Upload/replace a past paper's PDF (`multipart/form-data`, field `pdf`) |
| DELETE | `/api/papers/:id/file` | Remove a past paper's PDF |
| POST | `/api/submitPaperQuiz` | Submit answers for a past paper's practice quiz (`{ user_id, subject_id, paper_id, answers }`) → returns score |

### Results & Progress

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/results` | Get all quiz results (all users — filter client-side by `user_id`); each row has a `type` of `'activity'` or `'paper'` |
| GET | `/api/progress?user_id=` | Per-subject completion `{ subject_id, total, completed, pct, status }` for that user — see [Progress](#app-structure-subjects--progress) |

Uploaded PDFs are served statically at `http://localhost:3000/uploads/<filename>`.

---

## Testing Checklist

Use this checklist when testing the app end-to-end on a new machine or after a fresh database reset.

### Setup

- [ ] Cloned repo, ran `npm install` and `cd backend && npm install`
- [ ] Copied `config.example.js` to `config.js` and set `http://localhost:3000` (web) or local IP (Android)
- [ ] Backend starts and stays running (`node backend/server.js`)
- [ ] Expo starts without errors (`npx expo start`)
- [ ] App loads on web or device

### Student flow

- [ ] Register a new account on the Register screen
- [ ] Log in using the **Student** toggle
- [ ] Dashboard loads — subjects appear, progress bars show either a % or "No Content"
- [ ] Navigate to a subject — the 4 tabs render: Introduction, Activities, Study Guide, Past Papers
- [ ] **Introduction** tab shows the subject's description
- [ ] **Activities** tab lists activities with question counts — start one, answer all questions, submit
- [ ] Results screen shows the correct score, and "Try Again" retakes the same activity
- [ ] **Study Guide** tab — tap View Study Guide (or see "Coming soon" if none uploaded); the subject's progress % increases after the first view
- [ ] **Past Papers** tab — View PDF opens the paper; Practice (if available) launches its own quiz
- [ ] Return to Dashboard — that subject's progress bar has updated to reflect what was just completed
- [ ] Navigate to Progress screen — "Subject Completion" bar matches the Dashboard, "Recent Quizzes" lists the attempt labeled by Activity/Paper name
- [ ] Forgot Password flow completes without error

### Admin flow

- [ ] Register an account, then grant admin: `sqlite3 backend/database/app.db "UPDATE users SET is_admin = 1 WHERE email = 'your@email.com';"`
- [ ] Restart the backend server (only one instance running — check with `lsof -ti:3000`)
- [ ] Switch to the **Admin** toggle on Login and log in
- [ ] Admin Dashboard loads with correct subject, question, and user counts
- [ ] **Subjects** — add a new subject, it appears in the list immediately
- [ ] **Subjects** — edit the subject, upload a study guide PDF, confirm it shows on the student side
- [ ] **Activities** — select a subject, add an activity, add a question, confirm it appears only under that activity (not leaking into other activities or past papers)
- [ ] **Past Papers** — add a paper, upload its PDF, add a practice question, confirm it appears only under that paper
- [ ] **Users** — all registered users appear in the list; delete a non-self user, confirm they disappear
- [ ] Log out — switch to Student toggle, confirm non-admin accounts are blocked from Admin login

### Edge cases

- [ ] Attempting to log in with wrong password shows an error
- [ ] Attempting Admin login with a non-admin account shows "This account does not have admin access"
- [ ] An Activity or Past Paper with no questions yet shows a disabled "No questions yet"/"No practice questions" state rather than crashing
- [ ] Progress bars do not go negative or exceed 100%
- [ ] Activity questions and Past Paper questions never appear in each other's lists

---

## Troubleshooting

### Server exits immediately after starting

Another process may already be using port 3000:

```bash
lsof -ti:3000 | xargs kill -9
node backend/server.js
```

### "Could not connect to server"

- Confirm the backend is running (`node backend/server.js` in a separate terminal)
- Check `config.js` has the correct URL (`http://localhost:3000` for web, local IP for Android)
- For Android device testing, confirm both devices are on the same Wi-Fi network

### "User not found" after granting admin

The server was not restarted after the `UPDATE users` command, or multiple server instances are running. Kill all instances and restart:

```bash
lsof -ti:3000 | xargs kill -9
node backend/server.js
```

### 500 error on login or register

The database may be corrupted. Delete it and restart the server:

```bash
rm backend/database/app.db
node backend/server.js
```

Then re-grant admin access and re-add content via the admin panel.

### Activities tab or Past Papers tab shows nothing

No activities/papers have been added for that subject yet. Log in as admin and add them via the **Activities** or **Past Papers** screen.

### Port 3000 already in use

```bash
lsof -ti:3000 | xargs kill -9
```

Then restart the backend.

### Progress bars not updating after a quiz or viewing the study guide

Navigate away and come back — screens use `useFocusEffect` to refresh automatically. If still not updating, check the backend terminal for a non-200 response on `POST /api/submitActivityQuiz`, `POST /api/submitPaperQuiz`, or `POST /api/subjects/:id/guide/view`.
