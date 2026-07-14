const mongoose = require("mongoose");

const quizAnswerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one submission per user — resubmitting overwrites it
    },
    answers: [
      {
        questionId: { type: String, required: true },
        choice: { type: String, required: true },
        _id: false,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("QuizAnswer", quizAnswerSchema);
