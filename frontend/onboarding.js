const API_BASE_URL = "";

const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "structure.html";
}

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
};

document.getElementById("bioInput").addEventListener("input", (e) => {
  document.getElementById("bioCount").textContent = e.target.value.length;
});

document.getElementById("avatarInput").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    document.getElementById("avatarPreview").src = reader.result;
    document.getElementById("avatarPreview").style.display = "block";
    document.getElementById("avatarPlaceholder").style.display = "none";
  };
  reader.readAsDataURL(file);
});

async function saveAndContinue(skipMsg) {
  const msgEl = document.getElementById("onboardingMsg");
  const bio = document.getElementById("bioInput").value;
  const avatarVisible = document.getElementById("avatarPreview").style.display !== "none";
  const profilePicture = avatarVisible ? document.getElementById("avatarPreview").src : "";

  try {
    await fetch(`${API_BASE_URL}/api/profile`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ bio, profilePicture }),
    });
    window.location.href = "home.html";
  } catch (err) {
    msgEl.style.display = "block";
    msgEl.textContent = "Could not reach the server — you can fill this in later from your profile.";
    setTimeout(() => (window.location.href = "home.html"), 1500);
  }
}

document.getElementById("saveBtn").addEventListener("click", () => saveAndContinue(false));
document.getElementById("skipBtn").addEventListener("click", () => saveAndContinue(true));
