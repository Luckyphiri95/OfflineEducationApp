# MzansiGo — Test Cases

Test cases for manually verifying the app. Each case has a numeric ID, steps, and an expected result — mark each Pass/Fail as you go and note the build (web / Expo Go / APK) and backend (local / hosted Render) you tested against.

Prerequisites before starting: see `README.md` for setup, or install the APK from the link provided and confirm `config.js` was pointed at the hosted backend when it was built (see `README.md` → Hosted Backend & Building the APK).

---

## 1. Authentication & Session

| ID | Steps | Expected Result |
|---|---|---|
| 1.1 | Open the app fresh (logged out). Register a new account on the Register screen. | Account is created, no error, redirected to Login. |
| 1.2 | Log in with the account from 1.1 using the **Student** toggle. | The MzansiGo branded loading screen appears briefly, then the Dashboard loads. |
| 1.3 | Attempt to log in with a wrong password. | Clear error message shown; not logged in. |
| 1.4 | Attempt to log in with a non-existent email. | Clear error message shown ("User not found" or similar). |
| 1.5 | Log in as a non-admin account with the **Admin** toggle selected. | Blocked with "This account does not have admin access." |
| 1.6 | While logged in, close and reopen the app (or reload the page on web). | Branded loading screen appears, then you land straight back on the Dashboard/Admin Dashboard — **not** the Login screen. |
| 1.7 | Log out from the Dashboard. Close and reopen the app. | You land on the Login screen (session was cleared). |
| 1.8 | Use "Forgot Password" from the Login screen. | Flow completes without a crash or unhandled error. |

## 2. Student — Subjects & Progress

| ID | Steps | Expected Result |
|---|---|---|
| 2.1 | From the Dashboard, open the Subjects list. | Subjects appear with a progress bar showing either a % or "No Content". |
| 2.2 | Open a subject with content. Confirm all 4 tabs render: Introduction, Activities, Study Guide, Past Papers. | Each tab loads without error. |
| 2.3 | Introduction tab. | Shows the subject's description. |
| 2.4 | Activities tab — start an activity, answer all questions, submit. | Results screen shows the correct score. |
| 2.5 | On the Results screen, tap "Try Again". | Retakes the same activity (not a different one). |
| 2.6 | Answer a question incorrectly during an activity. | An explanation + hint modal appears for that question before moving on; tapping Continue proceeds. |
| 2.7 | Study Guide tab — tap "View Study Guide" (or confirm "Coming soon" if none uploaded for that subject). | PDF opens in-app; subject's progress % increases after this first view. |
| 2.8 | Open the same study guide a second time. | Progress % does not increase again (only counts once). |
| 2.9 | Past Papers tab — open a paper's PDF, and separately its Practice quiz (if available). | PDF viewer opens; Practice launches its own independent quiz. |
| 2.10 | Return to Dashboard after completing something in 2.4–2.9. | That subject's progress bar reflects the update. |
| 2.11 | Open the Progress screen. | "Subject Completion" matches the Dashboard; "Recent Quizzes" lists the attempt by Activity/Paper name; "Avg Score" reflects actual quiz scores. |
| 2.12 | Open an Activity or Past Paper with no questions yet. | Shows a disabled "No questions yet" state — does not crash. |

## 3. Community Board

| ID | Steps | Expected Result |
|---|---|---|
| 3.1 | Open the Community Board from the Dashboard/nav. | Articles list loads, split by category (module / improvement). |
| 3.2 | Open an article. | Full article body renders. |
| 3.3 | Like an article, then tap again to unlike. | Like count updates both times; state persists after navigating away and back. |
| 3.4 | Post a comment on an article. | Comment appears immediately in the list. |
| 3.5 | Delete your own comment. | Comment disappears immediately. |
| 3.6 | Attempt to delete another student's comment (if UI exposes it). | Not permitted for non-admin accounts. |

## 4. Admin Panel

| ID | Steps | Expected Result |
|---|---|---|
| 4.1 | Log in with an admin account. | Admin Dashboard loads with correct subject/question/user counts. |
| 4.2 | Subjects — add a new subject. | Appears in the list immediately. |
| 4.3 | Subjects — edit a subject, upload a Study Guide PDF. | Upload succeeds; PDF is visible/viewable from the student side. |
| 4.4 | Activities — add an activity to a subject, then add a question to it (with explanation + hint filled in). | Question appears only under that activity — not in other activities or past papers. |
| 4.5 | Past Papers — add a paper, upload its PDF, add a practice question. | Appears only under that paper. |
| 4.6 | Community Board — add an article (both category types), then edit and delete it. | All three operations succeed and reflect on the student side. |
| 4.7 | Community Board — delete another user's comment. | Succeeds (admin moderation). |
| 4.8 | Users — view the list, delete a non-self test user. | User disappears from the list and can no longer log in. |
| 4.9 | Log out, switch to Student toggle, confirm the just-deleted admin cannot log in. | Login fails cleanly. |

## 5. Offline Behavior

Run these with Wi-Fi/mobile data actually turned off on the device (not just backgrounding the app), after first loading each screen once while online.

| ID | Steps | Expected Result |
|---|---|---|
| 5.1 | While online, open Dashboard → a subject → Activities tab (to populate the cache). Go offline. Reopen the same subject. | Subjects, activities, and progress still render from cache — no blank/error screen. |
| 5.2 | While offline (per 5.1), the offline banner. | A visible "You're offline — showing saved content" banner appears somewhere on screen. |
| 5.3 | While offline, take an activity quiz you've previously loaded. Answer and submit. | Results screen appears immediately with a locally-computed score (no hang waiting on network). |
| 5.4 | Go back online after 5.3. Wait a few seconds, then navigate anywhere that triggers a network request. | The offline banner disappears; the queued quiz submission silently syncs to the server (verify via admin/Progress screen showing the result, or ask the dev team to check the `results` table). |
| 5.5 | Repeat 5.3–5.4 for liking an article and posting a comment while offline. | Like/comment appear immediately (optimistic UI, comment shows "Sending when back online…"); both sync once reconnected, with no duplicates. |
| 5.6 | While online, open a study guide or past paper PDF once. Go offline. Reopen the same PDF (native app only, not web). | PDF still opens from the on-device cached copy. |
| 5.7 | While offline, open a subject/PDF you have **never** viewed before. | A reasonable empty/error state is shown — no crash. |
| 5.8 | Kill and reopen the app while offline, after having a saved session. | You land on the Dashboard (not Login) even with no connection. |

## 6. Edge Cases

| ID | Steps | Expected Result |
|---|---|---|
| 6.1 | Try to log in with an empty email or password field. | Validation error, no network request sent. |
| 6.2 | Enter a password under 6 characters at login. | Validation error shown before submission. |
| 6.3 | Progress bars after multiple quiz attempts. | Never go negative or exceed 100%. |
| 6.4 | Cross-check Activity and Past Paper question lists for the same subject. | Questions never leak between an Activity and a Past Paper. |
| 6.5 | On the hosted (Render) backend specifically: make the very first request after a period of inactivity. | Response may take ~30-50 seconds (free-tier cold start) — this is expected, not a bug; it should still eventually succeed. |

---

## Reporting a bug

Please include: which build (web / Expo Go / APK version) and which backend (local / hosted Render), the test case ID if applicable, exact steps if different from the case above, and what you expected vs. what happened. Screenshots help a lot for UI issues.
