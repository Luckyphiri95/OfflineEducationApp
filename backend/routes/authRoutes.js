const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getUsers,
  promoteToAdmin,
  deleteUser
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.get("/users", getUsers);
router.post("/promote-admin", promoteToAdmin);
router.delete("/users/:id", deleteUser);

module.exports = router;