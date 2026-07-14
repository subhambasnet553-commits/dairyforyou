// Shared source of truth for the couple's quiz. If you add/remove questions,
// update the matching QUIZ_QUESTIONS array in frontend/quiz.js too so the IDs line up.
const QUIZ_QUESTIONS = [
  {
    id: "q1",
    question: "My idea of a perfect date is...",
    options: ["Cozy movie night in", "An outdoor adventure", "A fancy dinner out", "Just talking for hours"],
  },
  {
    id: "q2",
    question: "My love language is mostly...",
    options: ["Words of affirmation", "Quality time", "Acts of service", "Physical touch"],
  },
  {
    id: "q3",
    question: "If we traveled anywhere together, I'd pick...",
    options: ["A beach paradise", "A mountain cabin", "A big city", "A countryside road trip"],
  },
  {
    id: "q4",
    question: "My favorite way to spend a lazy Sunday is...",
    options: ["Sleeping in", "Cooking together", "Binge-watching a show", "Going for a walk"],
  },
  {
    id: "q5",
    question: "The thing I value most in us is...",
    options: ["Trust", "Humor", "Support", "Honesty"],
  },
  {
    id: "q6",
    question: "My go-to comfort food is...",
    options: ["Something sweet", "Something spicy", "Something cheesy", "Something homemade"],
  },
  {
    id: "q7",
    question: "If we got a pet together, I'd want...",
    options: ["A dog", "A cat", "Something exotic", "No pets, thanks"],
  },
  {
    id: "q8",
    question: "My idea of the perfect gift is...",
    options: ["Something handmade", "Something practical", "An experience together", "A surprise"],
  },
];

module.exports = QUIZ_QUESTIONS;
