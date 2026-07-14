const express = require("express");
const router = express.Router();
const { getQuestions, submitQuiz, getResults } = require("../controllers/quizController");
const requireAuth = require("../middleware/authMiddleware");

router.get("/questions", requireAuth, getQuestions);
router.post("/submit", requireAuth, submitQuiz);
router.get("/results", requireAuth, getResults);

module.exports = router;
