const API_BASE_URL = "";

const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "structure.html";
}

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
};

const loadingState = document.getElementById("loadingState");
const quizSection = document.getElementById("quizSection");

let QUESTIONS = [];
const selectedAnswers = {};

async function init() {
  try {
    const pairRes = await fetch(`${API_BASE_URL}/api/pair/my-code`, { headers });
    const pairData = await pairRes.json();

    if (pairRes.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "structure.html";
      return;
    }
    if (!pairData.paired) {
      window.location.href = "home.html";
      return;
    }

    loadingState.style.display = "none";
    quizSection.style.display = "block";

    await checkResults();
  } catch (err) {
    loadingState.innerHTML = '<p class="title">Could not reach the server.</p>';
  }
}
init();

async function checkResults() {
  const res = await fetch(`${API_BASE_URL}/api/quiz/results`, { headers });
  const data = await res.json();

  if (data.status === "not_started") {
    loadQuestions();
  } else if (data.status === "waiting_for_partner") {
    showWaiting();
  } else if (data.status === "complete") {
    showResults(data);
  }
}

async function loadQuestions() {
  const res = await fetch(`${API_BASE_URL}/api/quiz/questions`, { headers });
  const data = await res.json();
  QUESTIONS = data.questions;
  renderQuizForm();
}

function renderQuizForm() {
  const formEl = document.getElementById("quizForm");
  formEl.style.display = "block";
  document.getElementById("submitQuizBtn").style.display = "block";

  formEl.innerHTML = QUESTIONS.map(
    (q, i) => `
    <div class="quiz-question">
      <p class="quiz-question-text">${i + 1}. ${q.question}</p>
      <div class="quiz-options">
        ${q.options
          .map(
            (opt) => `
          <button type="button" class="quiz-option-btn" data-question="${q.id}" data-choice="${opt}">${opt}</button>`
          )
          .join("")}
      </div>
    </div>`
  ).join("");

  document.querySelectorAll(".quiz-option-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const qId = btn.dataset.question;
      selectedAnswers[qId] = btn.dataset.choice;

      document
        .querySelectorAll(`.quiz-option-btn[data-question="${qId}"]`)
        .forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
    });
  });
}

document.getElementById("submitQuizBtn").addEventListener("click", async () => {
  const msgEl = document.getElementById("quizMsg");
  const answers = QUESTIONS.map((q) => ({ questionId: q.id, choice: selectedAnswers[q.id] }));

  if (answers.some((a) => !a.choice)) {
    msgEl.style.display = "block";
    msgEl.textContent = "Please answer every question before submitting.";
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/quiz/submit`, {
      method: "POST",
      headers,
      body: JSON.stringify({ answers }),
    });
    const data = await res.json();

    if (!res.ok) {
      msgEl.style.display = "block";
      msgEl.textContent = data.message;
      return;
    }

    document.getElementById("quizForm").style.display = "none";
    document.getElementById("submitQuizBtn").style.display = "none";
    msgEl.style.display = "none";
    checkResults();
  } catch (err) {
    msgEl.style.display = "block";
    msgEl.textContent = "Could not reach the server.";
  }
});

function showWaiting() {
  document.getElementById("waitingState").style.display = "block";
}

function showResults(data) {
  document.getElementById("resultsState").style.display = "block";
  document.getElementById("scoreText").textContent = `${data.matches} / ${data.total}`;

  document.getElementById("comparisonList").innerHTML = data.comparison
    .map(
      (c) => `
      <div class="entry-card ${c.isMatch ? "quiz-match" : "quiz-mismatch"}">
        <p class="entry-date">${c.isMatch ? "✅ Match" : "❌ Different"} — ${escapeHtml(c.question)}</p>
        <p class="entry-content">You: ${escapeHtml(c.mine)}<br>Them: ${escapeHtml(c.theirs)}</p>
      </div>`
    )
    .join("");
}

document.getElementById("retakeBtn")?.addEventListener("click", async () => {
  document.getElementById("resultsState").style.display = "none";
  Object.keys(selectedAnswers).forEach((k) => delete selectedAnswers[k]);
  await loadQuestions();
});

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
