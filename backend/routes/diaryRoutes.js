const express = require("express");
const router = express.Router();
const { writeEntry, getMyEntries, getPartnerEntries } = require("../controllers/diaryController");
const requireAuth = require("../middleware/authMiddleware");

router.post("/entries", requireAuth, writeEntry);
router.get("/mine", requireAuth, getMyEntries);
router.get("/partner", requireAuth, getPartnerEntries);

module.exports = router;
