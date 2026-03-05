import { AVATARS, getAvatarById, renderAvatarSvg } from "./data/avatars.js";
import { createAvatarPicker } from "./components/AvatarPicker.js";
import { createJoinForm } from "./components/JoinForm.js";
import { addPlayerToLobby, normalizePin } from "./lobby-store.js";

function playSound(type) {
  if (window.GSSound && typeof window.GSSound.play === "function") {
    window.GSSound.play(type);
  }
}

function track(eventName, payload) {
  if (window.GSAnalytics && typeof window.GSAnalytics.track === "function") {
    window.GSAnalytics.track(eventName, payload || {});
  }
}

function renderMascot(el, avatarId) {
  if (!el) return;
  const avatar = getAvatarById(avatarId);
  el.innerHTML = renderAvatarSvg(avatar, 86);
}

function confettiBurst(target) {
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || !target) return;

  const layer = document.createElement("div");
  layer.className = "confetti-layer";
  for (let i = 0; i < 16; i += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.setProperty("--x", String((Math.random() - 0.5) * 260));
    piece.style.setProperty("--y", String(120 + Math.random() * 120));
    piece.style.setProperty("--rot", `${Math.random() * 360}deg`);
    piece.style.setProperty("--delay", `${Math.random() * 0.1}s`);
    layer.appendChild(piece);
  }
  target.appendChild(layer);
  window.setTimeout(() => layer.remove(), 1100);
}

function resolveInitialPin() {
  const params = new URLSearchParams(window.location.search);
  const queryPin = normalizePin(params.get("pin"));
  return queryPin || "";
}

function init() {
  const form = document.getElementById("joinForm");
  const pinInput = document.getElementById("joinPin");
  const nickInput = document.getElementById("joinNickname");
  const statusEl = document.getElementById("joinStatus");
  const avatarMount = document.getElementById("avatarPicker");
  const joinBtn = document.getElementById("joinButton");
  const mascotEl = document.getElementById("selectedAvatarPreview");
  const confirmation = document.getElementById("joinConfirmation");
  const ctaShell = document.getElementById("joinCtaShell");

  if (!form || !pinInput || !nickInput || !statusEl || !avatarMount || !joinBtn) return;

  const initialPin = resolveInitialPin();
  if (initialPin) pinInput.value = initialPin;

  const avatarPicker = createAvatarPicker({
    mountEl: avatarMount,
    initialAvatarId: AVATARS[0].id,
    onChange: (avatarId) => {
      renderMascot(mascotEl, avatarId);
      playSound("hover");
    }
  });
  renderMascot(mascotEl, avatarPicker.getSelectedAvatarId());

  const joinForm = createJoinForm({
    formEl: form,
    pinInputEl: pinInput,
    nicknameInputEl: nickInput,
    statusEl,
    joinButtonEl: joinBtn,
    getAvatarId: () => avatarPicker.getSelectedAvatarId(),
    onValidSubmit: async ({ pin, nickname, avatarId }) => {
      const { player } = addPlayerToLobby(pin, { nickname, avatarId });
      track("student_join_success", { pin, nickname, avatar_id: avatarId });
      playSound("confirm");
      confettiBurst(ctaShell);

      if (confirmation) {
        confirmation.innerHTML = `
          <strong>Welcome, ${player.nickname}.</strong>
          Joining PIN <strong>${pin}</strong>...
        `;
        confirmation.classList.add("show");
      }

      window.setTimeout(() => {
        const next = `/lobby/?pin=${encodeURIComponent(pin)}&player=${encodeURIComponent(player.id)}`;
        window.location.href = next;
      }, 620);
    }
  });

  pinInput.addEventListener("input", () => {
    statusEl.textContent = "";
    statusEl.classList.remove("is-error");
  });
  nickInput.addEventListener("input", () => {
    statusEl.textContent = "";
    statusEl.classList.remove("is-error");
  });

  document.querySelectorAll("button, a.btn").forEach((el) => {
    el.addEventListener("mouseenter", () => playSound("hover"));
  });

  window.addEventListener("pageshow", () => joinForm.stopLoading());
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
