const API_BASE_URL = "";

const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "structure.html"; // not logged in, send to login
}

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
};

const loadingState = document.getElementById("loadingState");
const diarySection = document.getElementById("diarySection");

// ---------- Init: check pairing status ----------
async function init() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/pair/my-code`, { headers });
    const data = await res.json();

    if (res.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "structure.html";
      return;
    }

    if (!data.paired) {
      window.location.href = "home.html"; // pairing lives on the home page
      return;
    }

    loadingState.style.display = "none";
    diarySection.style.display = "block";
    document.getElementById("pairedWithText").textContent =
      `Paired with ${data.partner.firstName} since ${new Date(data.pairedAt).toLocaleDateString()}`;
    loadMyEntries();
  } catch (err) {
    loadingState.innerHTML = '<p class="title">Could not reach the server.</p>';
  }
}
init();

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

// ---------- Write today's entry ----------
document.getElementById("submitEntryBtn")?.addEventListener("click", async () => {
  const msgEl = document.getElementById("writeMsg");
  const content = document.getElementById("entryText").value;

  try {
    const res = await fetch(`${API_BASE_URL}/api/diary/entries`, {
      method: "POST",
      headers,
      body: JSON.stringify({ content }),
    });
    const data = await res.json();
    msgEl.style.display = "block";
    msgEl.textContent = data.message;

    if (res.ok) {
      document.getElementById("entryText").value = "";
      document.getElementById("submitEntryBtn").disabled = true;
      loadMyEntries();
    }
  } catch (err) {
    msgEl.style.display = "block";
    msgEl.textContent = "Could not reach the server.";
  }
});

// ---------- Tabs ----------
const tabMine = document.getElementById("tabMine");
const tabPartner = document.getElementById("tabPartner");
const mineList = document.getElementById("mineList");
const partnerList = document.getElementById("partnerList");

tabMine?.addEventListener("click", () => {
  tabMine.classList.add("active");
  tabPartner.classList.remove("active");
  mineList.style.display = "block";
  partnerList.style.display = "none";
});

tabPartner?.addEventListener("click", () => {
  tabPartner.classList.add("active");
  tabMine.classList.remove("active");
  partnerList.style.display = "block";
  mineList.style.display = "none";
  loadPartnerEntries();
});

// ---------- Load entries ----------
async function loadMyEntries() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/diary/mine`, { headers });
    const data = await res.json();

    if (data.wroteToday) {
      document.getElementById("submitEntryBtn").disabled = true;
      document.getElementById("entryText").placeholder = "You've already written today. See you tomorrow!";
    }

    mineList.innerHTML = data.entries
      .map(
        (e) => `
        <div class="entry-card">
          <p class="entry-date">${formatDate(e.entryDate)}</p>
          <p class="entry-content">${escapeHtml(e.content)}</p>
        </div>`
      )
      .join("") || '<p class="empty-msg">No entries yet. Write your first one above!</p>';
  } catch (err) {
    mineList.innerHTML = '<p class="empty-msg">Could not load entries.</p>';
  }
}

async function loadPartnerEntries() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/diary/partner`, { headers });
    const data = await res.json();

    partnerList.innerHTML = data.entries
      .map((e) => {
        if (e.unlocked) {
          return `
            <div class="entry-card">
              <p class="entry-date">${formatDate(e.entryDate)}</p>
              <p class="entry-content">${escapeHtml(e.content)}</p>
            </div>`;
        }
        return `
          <div class="entry-card locked">
            <p class="entry-date">${formatDate(e.entryDate)}</p>
            <p class="entry-content locked-content"><i class='bx bx-lock-alt'></i> Unlocks in ${e.daysUntilUnlock} day${e.daysUntilUnlock === 1 ? "" : "s"}</p>
          </div>`;
      })
      .join("") || '<p class="empty-msg">No entries from your partner yet.</p>';
  } catch (err) {
    partnerList.innerHTML = '<p class="empty-msg">Could not load entries.</p>';
  }
}

function formatDate(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
