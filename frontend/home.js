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
const homeContent = document.getElementById("homeContent");
const pairSection = document.getElementById("pairSection");
const pairedSection = document.getElementById("pairedSection");
const writeBtn = document.getElementById("writeBtn");

let pairedAtMs = null;
let timerInterval = null;

async function init() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/pair/my-code`, { headers });
    const data = await res.json();

    if (res.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "structure.html";
      return;
    }

    loadingState.style.display = "none";
    homeContent.style.display = "block";

    if (data.paired) {
      pairedSection.style.display = "block";
      writeBtn.style.display = "inline-flex";
      document.getElementById("pairedWithText").textContent = `You and ${data.partner.firstName} 💕`;
      pairedAtMs = new Date(data.pairedAt).getTime();
      updateTimer();
      timerInterval = setInterval(updateTimer, 1000);
    } else {
      pairSection.style.display = "block";
      document.getElementById("myCode").textContent = data.pairCode;
    }
  } catch (err) {
    loadingState.innerHTML = '<p class="home-title">Could not reach the server.</p>';
  }
}
init();

function updateTimer() {
  const diffMs = Date.now() - pairedAtMs;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
  const seconds = Math.floor((diffMs / 1000) % 60);

  document.getElementById("timerValue").textContent =
    `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

// ---------- Toggle the pairing panel open when the big button is clicked ----------
document.getElementById("pairToggleBtn")?.addEventListener("click", () => {
  const panel = document.getElementById("pairPanel");
  const isOpen = panel.style.display === "block";
  panel.style.display = isOpen ? "none" : "block";
});

// ---------- Copy code ----------
document.getElementById("copyCodeBtn")?.addEventListener("click", () => {
  const code = document.getElementById("myCode").textContent;
  navigator.clipboard.writeText(code);
  const btn = document.getElementById("copyCodeBtn");
  btn.innerHTML = "<i class='bx bx-check'></i> Copied!";
  setTimeout(() => (btn.innerHTML = "<i class='bx bx-copy'></i> Copy"), 1500);
});

// ---------- Pair form ----------
document.getElementById("pairForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const errEl = document.getElementById("pairError");
  errEl.style.display = "none";
  const code = document.getElementById("partnerCodeInput").value.trim();

  try {
    const res = await fetch(`${API_BASE_URL}/api/pair/connect`, {
      method: "POST",
      headers,
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    if (!res.ok) {
      errEl.textContent = data.message;
      errEl.style.display = "block";
      return;
    }
    window.location.reload();
  } catch (err) {
    errEl.textContent = "Could not reach the server.";
    errEl.style.display = "block";
  }
});

// ---------- Write button ----------
writeBtn?.addEventListener("click", () => {
  window.location.href = "diary.html";
});

// ---------- Calendar & Quiz buttons ----------
document.getElementById("calendarBtn")?.addEventListener("click", () => {
  window.location.href = "calendar.html";
});
document.getElementById("quizBtn")?.addEventListener("click", () => {
  window.location.href = "quiz.html";
});
