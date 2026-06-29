# Offline-First Educational Mobile App

A React Native / Expo mobile application for student learning — featuring subject browsing, quizzes, progress tracking, PDF study guides, and an in-app admin panel for managing all content.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Prerequisites](#prerequisites)
3. [Project Structure](#project-structure)
4. [Setup & Running the Project](#setup--running-the-project)
5. [Running on a Physical Android Device](#running-on-a-physical-android-device)
6. [Admin Panel](#admin-panel)
7. [Adding a PDF Study Guide](#adding-a-pdf-study-guide)
8. [Adding Topics for a Subject](#adding-topics-for-a-subject)
9. [API Reference](#api-reference)
10. [Testing Checklist](#testing-checklist)
11. [Troubleshooting](#troubleshooting)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile App | React Native + Expo SDK 56 |
| Navigation | React Navigation v7 (Stack) |
| Backend | Node.js + Express |
| Database | SQLite (via sqlite3) |
| Auth | bcrypt password hashing |

---

## Prerequisites

Make sure the following are installed on your machine before you begin:

- **Node.js** v18 or higher — https://nodejs.org
- **npm** v9 or higher (comes with Node.js)
- **Expo Go** app on your phone — install from the App Store or Google Play
- **Git** — https://git-scm.com

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
│   │   ├── subjectController.js
│   │   └── quizController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── subjectRoutes.js
│   │   └── quizRoutes.js
│   └── database/
│       └── database.js       # SQLite table definitions (app.db auto-created)
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
│   ├── SubjectDetailsScreen.js  ← PDF guide URLs and topics live here
│   ├── QuizScreen.js
│   ├── ResultsScreen.js
│   ├── ProgressScreen.js
│   └── admin/
│       ├── AdminDashboardScreen.js
│       ├── AdminSubjectsScreen.js
│       ├── AdminQuestionsScreen.js
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
    └── progress.js           # Fetches and computes per-subject progress
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

### 3. Create your local config file

```bash
cp config.example.js config.js
```

Open `config.js` and replace `YOUR_LOCAL_IP` with your machine's IP address (see [Running on a Physical Android Device](#running-on-a-physical-android-device)). If you are only testing on web, no change is needed.

> `config.js` is gitignored — every developer keeps their own copy with their own IP.

### 4. Install backend dependencies

```bash
cd backend && npm install && cd ..
```

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

The database file `backend/database/app.db` is created automatically on first run.

### 6. Start the Expo app

Open a **second terminal** and run:

```bash
npx expo start
```

- Press **W** to open in a web browser
- Scan the **QR code** with the Expo Go app on your phone
- Press **A** to open in an Android emulator (if one is running)

> Both terminals must stay open while you are testing.

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
const BASE_URL = Platform.OS === 'android'
  ? 'http://192.168.0.5:3000'   // ← replace with YOUR IP
  : 'http://localhost:3000';
```

### Step 3 — Same Wi-Fi network

Your machine and Android phone must be connected to the **same Wi-Fi network**.

### Step 4 — Scan the QR code with Expo Go

Run `npx expo start` and scan the QR code shown in the terminal.

---

## Admin Panel

The app includes a built-in admin panel for managing subjects, quiz questions, and users — no terminal or database access required.

### Granting admin access

Admin accounts are regular accounts with an `is_admin` flag set in the database. Run this once per admin account:

```bash
sqlite3 backend/database/app.db "UPDATE users SET is_admin = 1 WHERE email = 'your@email.com';"
```

Restart the server after making this change.

### Logging in as admin

On the Login screen, tap **Admin** in the Student | Admin toggle, then enter the admin credentials. If the account does not have admin access, login will be blocked with an error message.

### What the admin panel can do

| Screen | Actions |
|---|---|
| **Admin Dashboard** | Overview — total subjects, questions, and users |
| **Subjects** | Add, edit, and delete subjects |
| **Quiz Questions** | Select a subject, then add, edit, and delete questions |
| **Users** | View all registered users, delete accounts |

### Adding a new subject

1. Log in as admin → tap **Subjects**
2. Tap **+ Add Subject**, fill in the name and description, tap **Save**
3. Note the subject ID (visible in the database or returned when listing subjects) — you will need it to add topics and a PDF guide

### Adding quiz questions

1. Log in as admin → tap **Quiz Questions**
2. Select the subject using the chips at the top
3. Tap **+ Add Question**, fill in the question, four options, and select the correct answer (A/B/C/D)
4. Tap **Save**

### Resetting the database

If the database becomes corrupted or you want a clean slate:

```bash
rm backend/database/app.db
node backend/server.js
```

All tables are recreated automatically. You will need to re-grant admin access and re-add subjects and questions.

---

## Adding a PDF Study Guide

PDF study guides are configured per subject in [screens/SubjectDetailsScreen.js](screens/SubjectDetailsScreen.js).

Find the `PDF_GUIDES` map near the top of the file:

```js
const PDF_GUIDES = {
  1: null,  // Mathematics — replace null with a URL when ready
  2: null,  // English
  3: null,  // Science
  4: 'https://learning.richfield.ac.za/mod/resource/view.php?id=558437', // Computer Studies
};
```

Replace `null` with the full URL of the PDF or web page. Supported link types: Google Drive, Dropbox, OneDrive, or any direct public URL.

When a new subject is added via the admin panel, find its ID in the database and add an entry here:

```js
5: 'https://your-guide-url.com/guide.pdf',  // ← new subject id 5
```

Until a URL is added, the button shows "Coming soon" and tapping it displays a friendly alert.

---

## Adding Topics for a Subject

Topics shown on the Subject Details screen are configured in [screens/SubjectDetailsScreen.js](screens/SubjectDetailsScreen.js).

Find the `TOPICS_BY_SUBJECT` map:

```js
const TOPICS_BY_SUBJECT = {
  1: ['Algebra and equations', 'Geometry and shapes', 'Statistics and data', 'Number systems'],
  2: ['Grammar and punctuation', 'Reading comprehension', 'Essay writing', 'Vocabulary building'],
  3: ['Scientific method', 'Biology basics', 'Chemistry fundamentals', 'Physics concepts'],
  4: ['Introduction to programming', 'Data structures', 'Algorithms', 'Databases and SQL'],
};
```

Add a new entry using the subject's ID:

```js
5: ['Ancient civilisations', 'The apartheid era', 'World War history', 'SA political history'],
```

If a subject has no entry in this map, it falls back to a default generic topics list.

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login (returns `is_admin` flag) |
| GET | `/api/auth/users` | List all users |
| DELETE | `/api/auth/users/:id` | Delete a user |
| GET | `/api/subjects` | List all subjects |
| POST | `/api/subjects` | Create a subject |
| PUT | `/api/subjects/:id` | Update a subject |
| DELETE | `/api/subjects/:id` | Delete a subject |
| GET | `/api/quiz` | Get all quiz questions |
| POST | `/api/quiz` | Add a quiz question |
| PUT | `/api/quiz/:id` | Update a quiz question |
| DELETE | `/api/quiz/:id` | Delete a quiz question |
| POST | `/api/submitQuiz` | Submit answers and get score |
| GET | `/api/results` | Get all quiz results |

---

## Testing Checklist

Use this checklist when testing the app end-to-end on a new machine or after a fresh database reset.

### Setup

- [ ] Cloned repo, ran `npm install` and `cd backend && npm install`
- [ ] Copied `config.example.js` to `config.js` and set correct IP
- [ ] Backend starts without errors (`node backend/server.js`)
- [ ] Expo starts without errors (`npx expo start`)
- [ ] App loads on web or device

### Student flow

- [ ] Register a new account on the Register screen
- [ ] Log in using the **Student** toggle
- [ ] Dashboard loads — subjects appear, progress bars show 0%
- [ ] Navigate to a subject — subject details and topics are visible
- [ ] Start a quiz — questions load correctly
- [ ] Answer all questions and submit — Results screen shows score
- [ ] Return to Dashboard — progress bar for that subject has updated
- [ ] Navigate to Progress screen — stats and recent quizzes match Dashboard
- [ ] Tap **View Study Guide** on Computer Studies — opens the link in a browser
- [ ] Tap **View Study Guide** on another subject — shows "Coming soon" alert
- [ ] Forgot Password flow completes without error

### Admin flow

- [ ] Grant admin access: `sqlite3 backend/database/app.db "UPDATE users SET is_admin = 1 WHERE email = 'your@email.com';"`
- [ ] Restart the backend server
- [ ] On the Login screen, switch to the **Admin** toggle and log in
- [ ] Admin Dashboard loads with correct subject, question, and user counts
- [ ] **Subjects** — add a new subject, it appears in the list immediately
- [ ] **Subjects** — edit the subject name, change is reflected
- [ ] **Subjects** — delete the subject, it disappears from the list
- [ ] **Quiz Questions** — select a subject, add a question with correct answer set to B or C (not just A)
- [ ] **Quiz Questions** — edit the question, save, verify the change
- [ ] **Quiz Questions** — delete the question
- [ ] **Users** — all registered users appear in the list
- [ ] **Users** — your own account shows a "You" badge and has no Delete button
- [ ] **Users** — delete another user, confirm they disappear from the list
- [ ] Log out (navigate back to Login) — switch to Student toggle, confirm non-admin accounts cannot log in via Admin toggle

### Edge cases

- [ ] Attempting to log in with wrong password shows an error
- [ ] Attempting Admin login with a non-admin account shows "This account does not have admin access"
- [ ] Taking a quiz for a subject with no questions shows a "No questions found" message
- [ ] Progress bars do not go negative or exceed 100%

---

## Troubleshooting

### "Could not connect to server" on Android

- Check that `config.js` has your machine's current local IP (`ipconfig getifaddr en0` on Mac)
- Both devices must be on the same Wi-Fi network
- Your machine's firewall must allow incoming connections on port 3000

### Login or Register does nothing on web

- The backend must be running (`node backend/server.js` in a separate terminal)
- Check the backend terminal for error messages

### 500 error on login or register

The database may be corrupted. Delete it and restart the server:

```bash
rm backend/database/app.db
node backend/server.js
```

Then re-grant admin access and re-add content via the admin panel.

### Quiz screen shows "No questions found"

No questions have been added for that subject yet. Log in as admin and add questions via the **Quiz Questions** screen.

### Admin toggle not working after login

Make sure you restarted the backend server after running the `UPDATE users SET is_admin` command.

### Port 3000 already in use

```bash
lsof -ti:3000 | xargs kill -9
```

Then restart the backend.

### Progress bars not updating after a quiz

Navigate away and come back — screens use `useFocusEffect` to refresh automatically. If still not updating, check that `POST /api/submitQuiz` returns a `200` response in the backend terminal.
