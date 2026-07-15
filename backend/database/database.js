const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Create database file
const db = new sqlite3.Database(
  path.resolve(__dirname, "app.db"),
  (err) => {
    if (err) {
      console.error("Database error:", err.message);
    } else {
      console.log("Connected to SQLite database");
    }
  }
);
// ======================
// CREATE USERS TABLE
// ======================
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      is_admin INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  // Add is_admin to existing databases that were created before this column existed
  db.run(`ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0`, () => {});
});

// ======================
// CREATE SUBJECT TABLE
// ======================
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      guide_filename TEXT,
      guide_original_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  // Add guide columns to existing databases that were created before they existed
  db.run(`ALTER TABLE subjects ADD COLUMN guide_filename TEXT`, () => {});
  db.run(`ALTER TABLE subjects ADD COLUMN guide_original_name TEXT`, () => {});
});

// ======================
// CREATE QUIZ TABLE
// ======================
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS quiz (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject_id INTEGER,
      paper_id INTEGER,
      activity_id INTEGER,
      question TEXT NOT NULL,
      option_a TEXT NOT NULL,
      option_b TEXT NOT NULL,
      option_c TEXT NOT NULL,
      option_d TEXT NOT NULL,
      correct_answer TEXT NOT NULL,
      explanation TEXT,
      hint TEXT,
      FOREIGN KEY(subject_id) REFERENCES subjects(id),
      FOREIGN KEY(paper_id) REFERENCES past_papers(id),
      FOREIGN KEY(activity_id) REFERENCES activities(id)
    )
  `);
// Add paper_id/activity_id/explanation/hint to existing databases that were created before these columns existed
db.run(`ALTER TABLE quiz ADD COLUMN paper_id INTEGER`, () => {});
db.run(`ALTER TABLE quiz ADD COLUMN activity_id INTEGER`, () => {});
db.run(`ALTER TABLE quiz ADD COLUMN explanation TEXT`, () => {});
db.run(`ALTER TABLE quiz ADD COLUMN hint TEXT`, () => {});
});

// ======================
// CREATE RESULTS TABLE
// ======================
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      subject_id INTEGER,
      paper_id INTEGER,
      activity_id INTEGER,
      type TEXT,
      score INTEGER,
      total_questions INTEGER,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(subject_id) REFERENCES subjects(id),
      FOREIGN KEY(paper_id) REFERENCES past_papers(id),
      FOREIGN KEY(activity_id) REFERENCES activities(id)
    )
  `);
  // Add paper_id/activity_id/type to existing databases that were created before these columns existed
  db.run(`ALTER TABLE results ADD COLUMN paper_id INTEGER`, () => {});
  db.run(`ALTER TABLE results ADD COLUMN activity_id INTEGER`, () => {});
  db.run(`ALTER TABLE results ADD COLUMN type TEXT`, () => {});
});

// ======================
// CREATE PAST PAPERS TABLE
// ======================
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS past_papers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      year TEXT,
      filename TEXT,
      original_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(subject_id) REFERENCES subjects(id)
    )
  `);
});

// ======================
// CREATE ACTIVITIES TABLE
// ======================
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(subject_id) REFERENCES subjects(id)
    )
  `);
});

// ======================
// CREATE GUIDE VIEWS TABLE (tracks whether a student has opened a subject's study guide)
// ======================
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS guide_views (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      subject_id INTEGER NOT NULL,
      viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, subject_id),
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(subject_id) REFERENCES subjects(id)
    )
  `);
});

// ======================
// BACKFILL: results.type for rows created before this column existed
// ======================
db.serialize(() => {
  db.run(`UPDATE results SET type = 'paper' WHERE paper_id IS NOT NULL AND type IS NULL`, () => {});
  db.run(`UPDATE results SET type = 'activity' WHERE paper_id IS NULL AND type IS NULL`, () => {});
});

// ======================
// ONE-TIME MIGRATION: legacy subject-wide quiz questions/results (no paper_id,
// no activity_id) get grouped into a default "General Quiz" activity per subject.
// Self-guarding: only touches rows where activity_id IS NULL, so it's a no-op
// once migrated.
// ======================
db.serialize(() => {
  db.all(
    `SELECT DISTINCT subject_id FROM quiz WHERE paper_id IS NULL AND activity_id IS NULL`,
    [],
    (err, rows) => {
      if (err || !rows) return;
      rows.forEach((row) => {
        const subjectId = row.subject_id;
        if (!subjectId) return;

        const applyMigration = (activityId) => {
          db.run(
            `UPDATE quiz SET activity_id = ? WHERE subject_id = ? AND paper_id IS NULL AND activity_id IS NULL`,
            [activityId, subjectId]
          );
          db.run(
            `UPDATE results SET activity_id = ? WHERE subject_id = ? AND paper_id IS NULL AND activity_id IS NULL`,
            [activityId, subjectId]
          );
        };

        db.get(
          `SELECT id FROM activities WHERE subject_id = ? AND title = 'General Quiz'`,
          [subjectId],
          (err2, existing) => {
            if (err2) return;
            if (existing) {
              applyMigration(existing.id);
            } else {
              db.run(
                `INSERT INTO activities (subject_id, title) VALUES (?, 'General Quiz')`,
                [subjectId],
                function (err3) {
                  if (err3) return;
                  applyMigration(this.lastID);
                }
              );
            }
          }
        );
      });
    }
  );
});

// ======================
// CREATE ARTICLES TABLE
// ======================
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    category TEXT NOT NULL,
    subject_id INTEGER,
    author_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(subject_id) REFERENCES subjects(id),
    FOREIGN KEY(author_id) REFERENCES users(id)
    )
  `);
});

// ======================
// CREATE ARTICLE LIKES TABLE
// ======================
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS article_likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      article_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(article_id, user_id),
      FOREIGN KEY(article_id) REFERENCES articles(id),
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);
});

// ======================
// CREATE ARTICLE COMMENTS TABLE
// ======================
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS article_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      article_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      body TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(article_id) REFERENCES articles(id),
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);
});

// ======================
// CREATE ARTICLE REPORTS TABLE
// ======================
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS article_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      article_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(article_id, user_id),
      FOREIGN KEY(article_id) REFERENCES articles(id),
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);
});

// ======================
// CREATE PASSWORD RESET REQUESTS TABLE
// ======================
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS password_reset_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      message TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});




module.exports = db;