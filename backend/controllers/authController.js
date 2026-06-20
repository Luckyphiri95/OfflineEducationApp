const bcrypt = require("bcryptjs");
const db = require("../database/database");


// ======================
// REGISTER USER
// ======================
const register = (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const query = `
    INSERT INTO users (username, email, password)
    VALUES (?, ?, ?)
  `;

  db.run(query, [username, email, hashedPassword], function (err) {
    if (err) {
      return res.status(500).json({ message: "User already exists or DB error" });
    }

    return res.status(201).json({
      message: "User registered successfully",
      userId: this.lastID
    });
  });
};


// ======================
// LOGIN USER
// ======================
const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  const query = `SELECT * FROM users WHERE email = ?`;

  db.get(query, [email], (err, user) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = bcrypt.compareSync(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  });
};


// ======================
// GET ALL USERS
// ======================
const getUsers = (req, res) => {
  const query = `SELECT id, username, email, created_at FROM users`;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    return res.status(200).json(rows);
  });
};


module.exports = {
  register,
  login,
  getUsers
};