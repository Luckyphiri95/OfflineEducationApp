const db = require("../database/database");

// ======================
// GET ALL ARTICLES
// ======================
const getArticles = (req, res) => {
    const userId = req.query.user_id ?? null;;

    const query = `
        SELECT
        a.id,
        a.title,
        a.body,
        a.category,
        a.subject_id,
        a.author_id,
        a.created_at,
        u.username AS author_name,

        COUNT(DISTINCT l.id) AS like_count,
        COUNT(DISTINCT c.id) AS comment_count,

        CASE
        WHEN my_like.id IS NULL THEN 0
        ELSE 1
        END AS liked_by_me

        FROM articles a

        LEFT JOIN users u
        ON a.author_id = u.id

        LEFT JOIN article_likes l
        ON a.id = l.article_id

        LEFT JOIN article_comments c
        ON a.id = c.article_id

        LEFT JOIN article_likes my_like
        ON a.id = my_like.article_id
        AND my_like.user_id = ?

        GROUP BY
        a.id,
        a.title,
        a.body,
        a.category,
        a.subject_id,
        a.author_id,
        a.created_at,
        u.username,
        my_like.id

        ORDER BY a.created_at DESC
    `;

    db.all(query, [userId], (err, rows) => {
        if (err) {
        console.error(err);
        return res.status(500).json({
            message: "Database error"
        });
        }

        return res.status(200).json(rows);
    });
    };

// ======================
// CREATE ARTICLE
// ======================
const createArticle = (req, res) => {
  const {
    title,
    body,
    category,
    subject_id,
    author_id
  } = req.body;

  if (!title || !body || !category || !author_id) {
    return res.status(400).json({
      message: "Missing required fields"
    });
  }

  const query = `
    INSERT INTO articles
    (
      title,
      body,
      category,
      subject_id,
      author_id
    )
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(
    query,
    [
      title,
      body,
      category,
      subject_id || null,
      author_id
    ],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({
          message: "Database error"
        });
      }

      return res.status(201).json({
        message: "Article created",
        articleId: this.lastID
      });
    }
  );
};

// ======================
// UPDATE ARTICLE
// ======================
const updateArticle = (req, res) => {
  const { id } = req.params;

  const {
    title,
    body,
    category,
    subject_id
  } = req.body;

  const query = `
    UPDATE articles
    SET
      title = ?,
      body = ?,
      category = ?,
      subject_id = ?
    WHERE id = ?
  `;

  db.run(
    query,
    [
      title,
      body,
      category,
      subject_id || null,
      id
    ],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({
          message: "Database error"
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          message: "Article not found"
        });
      }

      return res.status(200).json({
        message: "Article updated"
      });
    }
  );
};

// ======================
// DELETE ARTICLE
// ======================
const deleteArticle = (req, res) => {
  const { id } = req.params;

  db.run(
    `DELETE FROM articles WHERE id = ?`,
    [id],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({
          message: "Database error"
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          message: "Article not found"
        });
      }

      db.run(`DELETE FROM article_likes WHERE article_id = ?`, [id], () => {});
      db.run(`DELETE FROM article_comments WHERE article_id = ?`, [id], () => {});

      return res.status(200).json({
        message: "Article deleted"
      });
    }
  );
};

// ======================
// TOGGLE ARTICLE LIKE
// ======================
const toggleLike = (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({
      message: "User ID is required"
    });
  }

  const checkQuery = `
    SELECT id
    FROM article_likes
    WHERE article_id = ? AND user_id = ?
  `;

  db.get(checkQuery, [id, user_id], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        message: "Database error"
      });
    }

    if (row) {
      // Unlike
      db.run(
        `DELETE FROM article_likes WHERE id = ?`,
        [row.id],
        function (err) {
          if (err) {
            console.error(err);
            return res.status(500).json({
              message: "Database error"
            });
          }

          return res.status(200).json({
            liked: false
          });
        }
      );
    } else {
      // Like
      db.run(
        `
        INSERT INTO article_likes
        (article_id, user_id)
        VALUES (?, ?)
        `,
        [id, user_id],
        function (err) {
          if (err) {
            console.error(err);
            return res.status(500).json({
              message: "Database error"
            });
          }

          return res.status(201).json({
            liked: true
          });
        }
      );
    }
  });
};

// ======================
// GET ARTICLE COMMENTS
// ======================
const getComments = (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT
      c.id,
      c.body,
      c.created_at,
      c.user_id,
      u.username 
    FROM article_comments c
    LEFT JOIN users u
      ON c.user_id = u.id
    WHERE c.article_id = ?
    ORDER BY c.created_at ASC
  `;

  db.all(query, [id], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        message: "Database error"
      });
    }

    return res.status(200).json(rows);
  });
};

// ======================
// CREATE COMMENT
// ======================
const createComment = (req, res) => {
  const { id } = req.params;

  const {
    user_id,
    body
  } = req.body;

  if (!user_id || !body) {
    return res.status(400).json({
      message: "Missing required fields"
    });
  }

  const query = `
    INSERT INTO article_comments
    (
      article_id,
      user_id,
      body
    )
    VALUES (?, ?, ?)
  `;

  db.run(
    query,
    [
      id,
      user_id,
      body
    ],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({
          message: "Database error"
        });
      }

      return res.status(201).json({
        message: "Comment created",
        commentId: this.lastID
      });
    }
  );
};

// ======================
// DELETE COMMENT
// ======================
const deleteComment = (req, res) => {
  const { id } = req.params;
  const { user_id, is_admin } = req.body;

  db.get(
    `SELECT user_id FROM article_comments WHERE id = ?`,
    [id],
    (err, comment) => {
      if (err) {
        return res.status(500).json({
          message: "Database error"
        });
      }

      if (!comment) {
        return res.status(404).json({
          message: "Comment not found"
        });
      }

      if (!is_admin && comment.user_id !== user_id) {
        return res.status(403).json({
          message: "Not authorized"
        });
      }

      // Delete the comment
      db.run(
        `DELETE FROM article_comments WHERE id = ?`,
        [id],
        function (err) {
          if (err) {
            return res.status(500).json({
              message: "Database error"
            });
          }

          if (this.changes === 0) {
            return res.status(404).json({
              message: "Comment not found"
            });
          }

          return res.status(200).json({
            message: "Comment deleted"
          });
        }
      );
    }
  );
};

module.exports = {
  getArticles,
  createArticle,
  updateArticle,
  deleteArticle,
  toggleLike,
  getComments,
  createComment,
  deleteComment
};