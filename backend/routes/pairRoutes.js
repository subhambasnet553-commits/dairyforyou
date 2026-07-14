const express = require("express");
const router = express.Router();
const { getMyCode, pairWithCode } = require("../controllers/pairController");
const requireAuth = require("../middleware/authMiddleware");

router.get("/my-code", requireAuth, getMyCode);
router.post("/connect", requireAuth, pairWithCode);

module.exports = router;
