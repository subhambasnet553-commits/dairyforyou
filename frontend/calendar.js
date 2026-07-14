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
const calendarSection = document.getElementById("calendarSection");

const TYPE_ICONS = { birthday: "🎂", anniversary: "💍", special: "✨", plan: "📅" };
const TYPE_LABELS = { birthday: "Birthday", anniversary: "Anniversary", special: "Special Day", plan: "Plan" };

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
      window.location.href = "home.html";
      return;
    }

    loadingState.style.display = "none";
    calendarSection.style.display = "block";
    loadEvents();
  } catch (err) {
    loadingState.innerHTML = '<p class="title">Could not reach the server.</p>';
  }
}
init();

document.getElementById("addEventBtn").addEventListener("click", async () => {
  const msgEl = document.getElementById("eventMsg");
  const type = document.getElementById("eventType").value;
  const title = document.getElementById("eventTitle").value.trim();
  const date = document.getElementById("eventDate").value;

  if (!title || !date) {
    msgEl.style.display = "block";
    msgEl.textContent = "Fill in a title and date first.";
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/calendar/events`, {
      method: "POST",
      headers,
      body: JSON.stringify({ type, title, date }),
    });
    const data = await res.json();
    msgEl.style.display = "block";
    msgEl.textContent = data.message;

    if (res.ok) {
      document.getElementById("eventTitle").value = "";
      document.getElementById("eventDate").value = "";
      loadEvents();
    }
  } catch (err) {
    msgEl.style.display = "block";
    msgEl.textContent = "Could not reach the server.";
  }
});

async function loadEvents() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/calendar/events`, { headers });
    const data = await res.json();

    const pending = data.events.filter((e) => e.type === "plan" && e.status === "pending" && !e.proposedByMe);
    const rest = data.events.filter((e) => !(e.type === "plan" && e.status === "pending" && !e.proposedByMe));

    const pendingEl = document.getElementById("pendingPlans");
    pendingEl.innerHTML = pending
      .map(
        (e) => `
        <div class="entry-card plan-pending">
          <p class="entry-date">📅 Plan proposed: ${formatDate(e.date)}</p>
          <p class="entry-content">${escapeHtml(e.title)}</p>
          <div class="plan-actions">
            <button class="cacc plan-accept-btn" data-id="${e.id}">Accept</button>
            <button class="plan-decline-btn" data-id="${e.id}">Decline</button>
          </div>
        </div>`
      )
      .join("");

    document.querySelectorAll(".plan-accept-btn").forEach((btn) =>
      btn.addEventListener("click", () => respondToPlan(btn.dataset.id, "accept"))
    );
    document.querySelectorAll(".plan-decline-btn").forEach((btn) =>
      btn.addEventListener("click", () => respondToPlan(btn.dataset.id, "decline"))
    );

    const listEl = document.getElementById("eventsList");
    listEl.innerHTML =
      rest
        .map((e) => {
          const statusTag =
            e.type === "plan"
              ? e.status === "pending"
                ? " <span class='status-pill pending'>waiting for reply</span>"
                : e.status === "declined"
                ? " <span class='status-pill declined'>declined</span>"
                : " <span class='status-pill confirmed'>confirmed</span>"
              : "";
          return `
          <div class="entry-card">
            <p class="entry-date">${TYPE_ICONS[e.type]} ${TYPE_LABELS[e.type]} · ${formatDate(e.date)}${statusTag}</p>
            <p class="entry-content">${escapeHtml(e.title)}</p>
          </div>`;
        })
        .join("") || '<p class="empty-msg">No events yet — add your first one above!</p>';
  } catch (err) {
    document.getElementById("eventsList").innerHTML = '<p class="empty-msg">Could not load events.</p>';
  }
}

async function respondToPlan(id, action) {
  try {
    await fetch(`${API_BASE_URL}/api/calendar/events/${id}/respond`, {
      method: "POST",
      headers,
      body: JSON.stringify({ action }),
    });
    loadEvents();
  } catch (err) {
    alert("Could not reach the server.");
  }
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
