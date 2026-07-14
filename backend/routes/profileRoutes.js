const express = require("express");
const router = express.Router();
const {
  getProfile,
  updateProfile,
  changePassword,
  changeEmail,
  updatePreferences,
  unpair,
  deleteAccount,
  getSummary,
  getStats,
} = require("../controllers/profileController");
const requireAuth = require("../middleware/authMiddleware");

router.get("/me", requireAuth, getProfile);
router.get("/summary", requireAuth, getSummary);
router.get("/stats", requireAuth, getStats);
router.put("/", requireAuth, updateProfile);
router.put("/password", requireAuth, changePassword);
router.put("/email", requireAuth, changeEmail);
router.put("/preferences", requireAuth, updatePreferences);
router.post("/unpair", requireAuth, unpair);
router.delete("/", requireAuth, deleteAccount);

module.exports = router;
