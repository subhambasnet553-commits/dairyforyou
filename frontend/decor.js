// Scatters a handful of soft floating hearts and sparkles across the page.
// Purely decorative — matches the pink/white gradient theme.

const DECOR_ICONS = ["bx bxs-heart", "bx bx-heart", "bx bxs-star"];

function spawnDecor() {
  const positions = [
    { top: "8%", left: "6%" },
    { top: "15%", left: "88%" },
    { top: "80%", left: "10%" },
    { top: "85%", left: "85%" },
    { top: "45%", left: "3%" },
    { top: "50%", left: "94%" },
    { top: "10%", left: "45%" },
    { top: "90%", left: "50%" },
  ];

  positions.forEach((pos, i) => {
    const el = document.createElement("i");
    const icon = DECOR_ICONS[i % DECOR_ICONS.length];
    el.className = `decor-item ${icon}`;
    el.style.top = pos.top;
    el.style.left = pos.left;
    el.style.fontSize = `${18 + (i % 3) * 10}px`;
    el.style.animationDelay = `${i * 0.6}s`;
    el.style.animationDuration = `${7 + (i % 4)}s`;
    document.body.appendChild(el);
  });
}

document.addEventListener("DOMContentLoaded", spawnDecor);
