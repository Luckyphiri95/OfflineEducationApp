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


// ======================
// PASSWORD RESET REQUESTS
// ======================
// No email sending in this demo — a student submits a request, an admin
// sees it in the admin panel and sets a new password for that account
// directly.
const requestPasswordReset = (req, res) => {
  const { email, message } = req.body;

  if (!email) {
    return res.status(400).json({ message: "email is required" });
  }

  db.run(
    `INSERT INTO password_reset_requests (email, message) VALUES (?, ?)`,
    [email, message || null],
    function (err) {
      if (err) {
        return res.status(500).json({ message: "Database error" });
      }
      return res.status(201).json({ message: "Password reset request sent to admin", id: this.lastID });
    }
  );
};

const getResetRequests = (req, res) => {
  db.all(
    `SELECT * FROM password_reset_requests ORDER BY created_at DESC`,
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ message: "Database error" });
      }
      return res.status(200).json(rows);
    }
  );
};

const resolveResetRequest = (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: "newPassword must be at least 6 characters" });
  }

  db.get(`SELECT email FROM password_reset_requests WHERE id = ?`, [id], (err, request) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    db.run(`UPDATE users SET password = ? WHERE email = ?`, [hashedPassword, request.email], function (userErr) {
      if (userErr) {
        return res.status(500).json({ message: "Database error" });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: "No user found with that email" });
      }

      db.run(`UPDATE password_reset_requests SET status = 'resolved' WHERE id = ?`, [id], () => {
        return res.status(200).json({ message: `Password reset for ${request.email}` });
      });
    });
  });
};


module.exports = {
  register,
  login,
  getUsers,
  promoteToAdmin,
  deleteUser,
  requestPasswordReset,
  getResetRequests,
  resolveResetRequest
};