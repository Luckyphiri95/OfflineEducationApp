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
        email: user.email,
        is_admin: user.is_admin || 0
      }
    });
  });
};


// ======================
// GET ALL USERS
// ======================
const getUsers = (req, res) => {
  const query = `SELECT id, username, email, is_admin, created_at FROM users`;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    return res.status(200).json(rows);
  });
};


// ======================
// PROMOTE USER TO ADMIN
// ======================
// Gated by ADMIN_PROMOTE_SECRET (set as an env var, never committed) since
// there's no other way to grant admin on a hosted deploy with no DB shell
// access (e.g. Render's free tier). Not wired into any UI — call it once via
// curl/Postman for whichever account should be an admin, then stop using it.
const promoteToAdmin = (req, res) => {
  const { email, secret } = req.body;

  if (!process.env.ADMIN_PROMOTE_SECRET) {
    return res.status(503).json({ message: "ADMIN_PROMOTE_SECRET is not configured on this server" });
  }
  if (secret !== process.env.ADMIN_PROMOTE_SECRET) {
    return res.status(403).json({ message: "Invalid secret" });
  }
  if (!email) {
    return res.status(400).json({ message: "email is required" });
  }

  db.run(`UPDATE users SET is_admin = 1 WHERE email = ?`, [email], function (err) {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ message: `${email} is now an admin` });
  });
};


// ======================
// DELETE USER
// ======================
const deleteUser = (req, res) => {
  const { id } = req.params;

  db.run(`DELETE FROM users WHERE id = ?`, [id], function (err) {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ message: "User deleted" });
  });
};


module.exports = {
  register,
  login,
  getUsers,
  promoteToAdmin,
  deleteUser
};