const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// FIXED DB PATH (CRITICAL)
const db = new sqlite3.Database(
  path.join(__dirname, 'database', 'app.db')
);

console.log("🌱 Starting CAPS Grade 12 seeding...");

const subjects = [
  "Mathematics",
  "Mathematical Literacy",
  "Physical Sciences",
  "Life Sciences"
];

// 12 CAPS-aligned modules per subject
const modules = {
  Mathematics: [
    "Algebra", "Functions", "Equations", "Sequences and Series",
    "Trigonometry", "Analytical Geometry", "Calculus Basics",
    "Probability", "Statistics", "Finance Mathematics",
    "Measurement", "Graphs"
  ],
  "Mathematical Literacy": [
    "Basic Numeracy", "Finance", "Interest Calculations", "Tariffs",
    "Data Handling", "Measurement", "Maps and Scale",
    "Probability Basics", "Graphs", "Budgeting",
    "Tax Systems", "Consumer Maths"
  ],
  "Physical Sciences": [
    "Mechanics", "Newton’s Laws", "Waves", "Optics",
    "Electricity", "Magnetism", "Chemical Bonding",
    "Stoichiometry", "Acids and Bases", "Organic Chemistry",
    "Thermodynamics", "Energy Systems"
  ],
  "Life Sciences": [
    "Cell Biology", "DNA and Genetics", "Evolution",
    "Human Systems", "Respiration", "Photosynthesis",
    "Ecology", "Biodiversity", "Homeostasis",
    "Reproduction", "Microorganisms", "Human Impact"
  ]
};

// ---------------------------
// CREATE TABLES (SAFE)
// ---------------------------
db.serialize(() => {

  db.run(`
    CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS modules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject_id INTEGER,
      name TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS quizzes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      module_id INTEGER,
      question TEXT,
      option_a TEXT,
      option_b TEXT,
      option_c TEXT,
      option_d TEXT,
      answer TEXT
    )
  `);

  // ---------------------------
  // INSERT SUBJECTS
  // ---------------------------
  subjects.forEach((subject) => {
    db.run(`INSERT OR IGNORE INTO subjects (name) VALUES (?)`, [subject]);
  });

  console.log("✔ Subjects inserted");

  // ---------------------------
  // INSERT MODULES + QUIZZES
  // ---------------------------
  setTimeout(() => {

    db.all(`SELECT * FROM subjects`, (err, rows) => {

      rows.forEach((subjectRow) => {
        const subjectName = subjectRow.name;
        const subjectId = subjectRow.id;

        const subjectModules = modules[subjectName];

        subjectModules.forEach((mod) => {

          db.run(
            `INSERT INTO modules (subject_id, name) VALUES (?, ?)`,
            [subjectId, mod],
            function () {

              const moduleId = this.lastID;

              // ---------------------------
              // LESSON QUIZZES (5)
              // ---------------------------
              for (let i = 1; i <= 5; i++) {
                db.run(`
                  INSERT INTO quizzes (module_id, question, option_a, option_b, option_c, option_d, answer)
                  VALUES (?, ?, ?, ?, ?, ?, ?)
                `,
                [
                  moduleId,
                  `${mod} Lesson Question ${i}: What is the core concept?`,
                  "Option A", "Option B", "Option C", "Option D",
                  "Option A"
                ]);
              }

              // ---------------------------
              // TEST QUIZZES (10)
              // ---------------------------
              for (let i = 1; i <= 10; i++) {
                db.run(`
                  INSERT INTO quizzes (module_id, question, option_a, option_b, option_c, option_d, answer)
                  VALUES (?, ?, ?, ?, ?, ?, ?)
                `,
                [
                  moduleId,
                  `${mod} Test Question ${i}: Apply your knowledge`,
                  "A", "B", "C", "D",
                  "B"
                ]);
              }

            }
          );

        });

      });

    });

  }, 500);

});

setTimeout(() => {
  console.log("🎓 CAPS Grade 12 seed COMPLETE!");
  db.close();
}, 5000);