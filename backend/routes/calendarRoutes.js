const express = require("express");
const router = express.Router();
const { createEvent, listEvents, respondToPlan } = require("../controllers/calendarController");
const requireAuth = require("../middleware/authMiddleware");

router.post("/events", requireAuth, createEvent);
router.get("/events", requireAuth, listEvents);
router.post("/events/:id/respond", requireAuth, respondToPlan);

module.exports = router;
