// Empty string = relative to whatever domain the page is currently on.
// Works automatically on localhost during development and on your real
// domain once deployed (e.g. Render) — no need to change this later.
const API_BASE_URL = "";

function showError(el, message) {
  el.textContent = message;
  el.style.display = "block";
}

function hideError(el) {
  el.style.display = "none";
}

// ---------- SIGN UP ----------
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorMsg = document.getElementById("errorMsg");
    hideError(errorMsg);

    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
      showError(errorMsg, "Passwords do not match.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        showError(errorMsg, data.message || "Could not create account.");
        return;
      }

      // Save token so the user is logged in right after signing up
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      window.location.href = "onboarding.html";
    } catch (err) {
      showError(errorMsg, "Could not reach the server. Is the backend running?");
    }
  });
}

// ---------- LOGIN ----------
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorMsg = document.getElementById("errorMsg");
    hideError(errorMsg);

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        showError(errorMsg, data.message || "Login failed.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      window.location.href = data.user.onboarded ? "home.html" : "onboarding.html";
    } catch (err) {
      showError(errorMsg, "Could not reach the server. Is the backend running?");
    }
  });
}
