# Offline-First Educational Mobile App

A React Native / Expo mobile application for student learning — featuring subject browsing, quizzes, progress tracking, and PDF study guides.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Prerequisites](#prerequisites)
3. [Project Structure](#project-structure)
4. [Setup & Running the Project](#setup--running-the-project)
5. [Running on a Physical Android Device](#running-on-a-physical-android-device)
6. [Managing Subjects](#managing-subjects)
7. [Managing Quiz Questions](#managing-quiz-questions)
8. [Managing Users](#managing-users)
9. [Adding a PDF Study Guide](#adding-a-pdf-study-guide)
10. [Adding Topics for a Subject](#adding-topics-for-a-subject)
11. [API Reference](#api-reference)
12. [Troubleshooting](#troubleshooting)

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
├── App.js                    # Entry point — wraps app in gesture handler
├── config.js                 # BASE_URL for API (switch between web/Android)
├── index.js                  # Expo entry registration
│
├── backend/
│   ├── server.js             # Express server (port 3000)
│   ├── API.md                # Full API documentation
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── subjectController.js
│   │   └── quizController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── subjectRoutes.js
│   │   └── quizRoutes.js
│   └── database/
│       ├── database.js       # SQLite table definitions
│       └── app.db            # SQLite database file (auto-created)
│
├── navigation/
│   └── AppNavigator.js       # All screen routes registered here
│
├── screens/
│   ├── LoginScreen.js
│   ├── RegisterScreen.js
│   ├── ForgotPasswordScreen.js
│   ├── DashboardScreen.js
│   ├── SubjectScreen.js
│   ├── SubjectDetailsScreen.js  ← topics list + PDF guide URLs live here
│   ├── QuizScreen.js
│   ├── ResultsScreen.js
│   └── ProgressScreen.js
│
├── components/
│   ├── Button.js
│   ├── Card.js
│   ├── Input.js
│   ├── Loader.js
│   ├── BottomNav.js
│   ├── ProgressCard.js
│   ├── StatsCard.js
│   ├── ScoreDashboard.js
│   ├── QuestionCard.js
│   ├── AnswerSelection.js
│   └── SearchSubjects.js
│
├── theme/
│   └── colors.js             # Design system colours
│
└── utils/
    └── progress.js           # Shared helper — fetches & computes progress per subject
```

---

## Setup & Running the Project

### 1. Clone the repository

```bash
git clone https://github.com/Luckyphiri95/OfflineEducationApp.git
cd OfflineEducationApp
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create your local config file

```bash
cp config.example.js config.js
```

Then open `config.js` and replace `YOUR_LOCAL_IP` with your machine's IP address (see [Running on a Physical Android Device](#running-on-a-physical-android-device)). If you are only testing on web, no change is needed.

> `config.js` is gitignored — every developer keeps their own copy with their own IP.

### 4. Install backend dependencies

```bash
cd backend
npm install
cd ..
```

> If there is no `package.json` inside `backend/`, run this from the root instead:
> ```bash
> npm install express cors sqlite3 bcrypt dotenv
> ```

### 4. Start the backend server

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

### 5. Start the Expo app

Open a **second terminal** and run:

```bash
npx expo start
```

- Press **W** to open in a web browser
- Scan the **QR code** with the Expo Go app on your phone
- Press **A** to open in an Android emulator (if one is running)

> **Tip:** Both terminals must stay open while you are testing.

---

## Running on a Physical Android Device

When testing on an Android phone, `localhost` points to the phone itself — not your Mac. You must use your Mac's local IP address.

### Step 1 — Find your Mac's IP

```bash
ipconfig getifaddr en0
```

Example output: `192.168.0.5`

### Step 2 — Update config.js

Open `config.js` in the project root and replace the IP:

```js
const BASE_URL = Platform.OS === 'android'
  ? 'http://192.168.0.5:3000'   // ← replace with YOUR Mac's IP
  : 'http://localhost:3000';
```

### Step 3 — Make sure both devices are on the same Wi-Fi network

Your Mac and Android phone must be connected to the **same Wi-Fi network**.

### Step 4 — Scan the QR code with Expo Go

Run `npx expo start` and scan the QR code shown in the terminal.

---

## Managing Subjects

Subjects are stored in the backend database and displayed dynamically in the app. No code changes are needed to add or remove subjects.

### Add a subject

```bash
curl -X POST http://localhost:3000/api/subjects \
  -H "Content-Type: application/json" \
  -d '{"name": "History", "description": "World and South African history"}'
```

Note the `subjectId` returned — you will need it for quiz questions and topics.

### Edit a subject

```bash
curl -X PUT http://localhost:3000/api/subjects/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Advanced Mathematics", "description": "Updated description"}'
```

### Delete a subject

```bash
curl -X DELETE http://localhost:3000/api/subjects/1
```

### View all subjects

```bash
curl http://localhost:3000/api/subjects
```

---

## Managing Quiz Questions

There is currently no HTTP endpoint to add quiz questions, so questions are added directly to the SQLite database.

### Open the database

```bash
sqlite3 backend/database/app.db
```

### Add a question

```sql
INSERT INTO quiz (subject_id, question, option_a, option_b, option_c, option_d, correct_answer)
VALUES (1, 'What is 2 + 2?', '1', '2', '3', '4', '4');
```

- `subject_id` must match an existing subject's `id`
- `correct_answer` must be the **exact text** of one of the four options

### View all questions

```sql
SELECT * FROM quiz;
```

### View questions for a specific subject

```sql
SELECT * FROM quiz WHERE subject_id = 1;
```

### Delete a question

```sql
DELETE FROM quiz WHERE id = 3;
```

### Exit SQLite

```sql
.exit
```

---

## Managing Users

### View all registered users

```bash
curl http://localhost:3000/api/auth/users
```

### Register a user (same as the app Register screen)

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "Lucky", "email": "lucky@example.com", "password": "password123"}'
```

### Delete a user directly in the database

```bash
sqlite3 backend/database/app.db "DELETE FROM users WHERE email = 'lucky@example.com';"
```

### Reset a corrupted database

If the database behaves unexpectedly (login errors, 500 errors), delete it and restart the server — it will be recreated with empty tables:

```bash
rm backend/database/app.db
node backend/server.js
```

Then re-seed your subjects and quiz questions.

---

## Adding a PDF Study Guide

PDF study guides are configured per subject in `screens/SubjectDetailsScreen.js`.

Open the file and find the `PDF_GUIDES` map near the top:

```js
const PDF_GUIDES = {
  1: null,  // Mathematics — replace null with a URL when ready
  2: null,  // English
  3: null,  // Science
  4: 'https://learning.richfield.ac.za/mod/resource/view.php?id=558437', // Computer Studies
};
```

**To add a guide:** replace `null` with the full URL of the PDF or web page.

**Supported URL types:**
- Google Drive share link — `https://drive.google.com/file/d/FILE_ID/view`
- Dropbox link — `https://www.dropbox.com/s/XXXXX/file.pdf?dl=0`
- OneDrive link
- Direct PDF URL — `https://yourserver.com/guides/maths.pdf`
- Any publicly accessible web page

**For a new subject** added via the API, add its `id` and URL to this map:

```js
const PDF_GUIDES = {
  1: null,
  2: null,
  3: null,
  4: 'https://...',
  5: 'https://...',  // ← new subject with id 5
};
```

Until a URL is added, the button shows "Coming soon" and tapping it shows a friendly alert.

---

## Adding Topics for a Subject

Topics shown on the Subject Details screen are configured in `screens/SubjectDetailsScreen.js`.

Find the `TOPICS_BY_SUBJECT` map:

```js
const TOPICS_BY_SUBJECT = {
  1: ['Algebra and equations', 'Geometry and shapes', 'Statistics and data', 'Number systems'],
  2: ['Grammar and punctuation', 'Reading comprehension', 'Essay writing', 'Vocabulary building'],
  3: ['Scientific method', 'Biology basics', 'Chemistry fundamentals', 'Physics concepts'],
  4: ['Introduction to programming', 'Data structures', 'Algorithms', 'Databases and SQL'],
};
```

Add a new entry using the subject's `id` from the database:

```js
5: ['Ancient civilisations', 'The apartheid era', 'World War history', 'SA political history'],
```

If a subject has no entry in this map, it falls back to a default generic topics list.

---

## API Reference

Full documentation is in `backend/API.md`. Quick reference:

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/users` | List all users |
| GET | `/api/subjects` | List all subjects |
| POST | `/api/subjects` | Create a subject |
| PUT | `/api/subjects/:id` | Update a subject |
| DELETE | `/api/subjects/:id` | Delete a subject |
| GET | `/api/quiz` | Get all quiz questions |
| POST | `/api/submitQuiz` | Submit answers + get score |
| GET | `/api/results` | Get all quiz results |

---

## Troubleshooting

### "Could not connect to server" on Android

- Make sure `config.js` has your Mac's current local IP (run `ipconfig getifaddr en0`)
- Both devices must be on the same Wi-Fi network
- Your Mac firewall must allow incoming connections on port 3000

### Login or Register does nothing on web

- The backend must be running (`node backend/server.js` in a separate terminal)
- Check the terminal for error messages

### 500 error on login/register

The database may be corrupted. Delete it and restart:
```bash
rm backend/database/app.db
node backend/server.js
```

### Quiz screen shows "No questions found"

No questions have been seeded for that subject yet. Add them via SQLite — see [Managing Quiz Questions](#managing-quiz-questions).

### QR code not showing when running `npm run dev`

The `concurrently` script suppresses Expo's interactive display. Run the backend and Expo in **separate terminals** instead:

```bash
# Terminal 1
node backend/server.js

# Terminal 2
npx expo start
```

### Port 3000 already in use

Another process is using port 3000. Find and kill it:
```bash
lsof -ti:3000 | xargs kill -9
```
Then restart the backend.

### Progress bars not updating after a quiz

Pull down to refresh on the Dashboard or Subjects screen. If still not updating, check that `POST /api/submitQuiz` is returning a `200` response in the backend terminal.
