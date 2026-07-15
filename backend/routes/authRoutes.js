const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getUsers,
  promoteToAdmin,
  deleteUser,
  requestPasswordReset,
  getResetRequests,
  resolveResetRequest
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.get("/users", getUsers);
router.post("/promote-admin", promoteToAdmin);
router.delete("/users/:id", deleteUser);

router.post("/reset-requests", requestPasswordReset);
router.get("/reset-requests", getResetRequests);
router.post("/reset-requests/:id/resolve", resolveResetRequest);

module.exports = router;