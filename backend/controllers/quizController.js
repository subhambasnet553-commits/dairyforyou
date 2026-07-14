const User = require("../models/User");
const QuizAnswer = require("../models/QuizAnswer");
const QUIZ_QUESTIONS = require("../constants/quizQuestions");

// GET /api/quiz/questions
exports.getQuestions = async (req, res) => {
  res.status(200).json({ questions: QUIZ_QUESTIONS });
};

// POST /api/quiz/submit  { answers: [{questionId, choice}, ...] }
exports.submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body;
    if (!Array.isArray(answers) || answers.length !== QUIZ_QUESTIONS.length) {
      return res.status(400).json({ message: "Please answer every question." });
    }

    const validIds = new Set(QUIZ_QUESTIONS.map((q) => q.id));
    for (const a of answers) {
      if (!validIds.has(a.questionId) || !a.choice) {
        return res.status(400).json({ message: "Invalid answer submitted." });
      }
    }

    await QuizAnswer.findOneAndUpdate(
      { user: req.userId },
      { user: req.userId, answers },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: "Quiz submitted!" });
  } catch (err) {
    console.error("submitQuiz error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

// GET /api/quiz/results
exports.getResults = async (req, res) => {
  try {
    const me = await User.findById(req.userId);
    if (!me.partner) {
      return res.status(400).json({ message: "You need to pair with someone first." });
    }

    const myAnswers = await QuizAnswer.findOne({ user: req.userId });
    if (!myAnswers) {
      return res.status(200).json({ status: "not_started" });
    }

    const partnerAnswers = await QuizAnswer.findOne({ user: me.partner });
    if (!partnerAnswers) {
      return res.status(200).json({ status: "waiting_for_partner" });
    }

    const partnerMap = new Map(partnerAnswers.answers.map((a) => [a.questionId, a.choice]));
    let matches = 0;

    const comparison = QUIZ_QUESTIONS.map((q) => {
      const mine = myAnswers.answers.find((a) => a.questionId === q.id)?.choice;
      const theirs = partnerMap.get(q.id);
      const isMatch = mine === theirs;
      if (isMatch) matches++;
      return { questionId: q.id, question: q.question, mine, theirs, isMatch };
    });

    res.status(200).json({
      status: "complete",
      matches,
      total: QUIZ_QUESTIONS.length,
      comparison,
    });
  } catch (err) {
    console.error("getResults error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};
