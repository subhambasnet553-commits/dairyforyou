// If already logged in, skip the splash entirely
if (localStorage.getItem("token")) {
  window.location.href = "home.html";
}

function goToLogin() {
  const wrap = document.getElementById("splashWrap");
  wrap.classList.add("splash-fade-out");
  setTimeout(() => {
    window.location.href = "structure.html";
  }, 500);
}

// Auto-advance after the animation plays out
const AUTO_ADVANCE_MS = 4200;
const autoTimer = setTimeout(goToLogin, AUTO_ADVANCE_MS);

// Let people skip it by tapping/clicking anywhere
document.addEventListener("click", () => {
  clearTimeout(autoTimer);
  goToLogin();
});
