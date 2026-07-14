const express = require("express");
const router = express.Router();

const {
  getArticles,
  createArticle,
  updateArticle,
  deleteArticle,
  toggleLike,
  getComments,
  createComment,
  deleteComment
} = require("../controllers/articleController");

// ======================
// ARTICLE ROUTES
// ======================

router.get("/articles", getArticles);
router.post("/articles", createArticle);
router.put("/articles/:id", updateArticle);
router.delete("/articles/:id", deleteArticle);

router.post("/articles/:id/like", toggleLike);

router.get("/articles/:id/comments", getComments);
router.post("/articles/:id/comments", createComment);
router.delete("/comments/:id", deleteComment);

module.exports = router;