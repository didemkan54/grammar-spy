import { AVATAR_ACCENTS, AVATARS, getAccentById, getAvatarById, renderAvatarSvg } from "./data/avatars.js";
import { createAvatarPicker } from "./components/AvatarPicker.js";
import { createJoinForm } from "./components/JoinForm.js";
import { addPlayerToLobby, normalizePin } from "./lobby-store.js";
import { applyDailyLoginBonus, setActiveContext, upsertStudentProfile } from "./identity-store.js";

const AVATAR_STORAGE_KEY = "gs_student_avatar_id_v1";
const ACCENT_STORAGE_KEY = "gs_student_accent_color_v1";

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

function renderMascot(el, avatarId, accentId) {
  if (!el) return;
  const avatar = getAvatarById(avatarId);
  const accent = getAccentById(accentId);
  el.innerHTML = renderAvatarSvg(avatar, 86, { accentColor: accent.color, rankBadge: "A" });
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

function resolveInitialAvatarId() {
  try {
    const stored = String(localStorage.getItem(AVATAR_STORAGE_KEY) || "").trim();
    if (stored && AVATARS.some((avatar) => avatar.id === stored)) return stored;
    const legacy = JSON.parse(localStorage.getItem("gs_student_classroom") || "null");
    const legacyAvatar = String((legacy && legacy.avatarId) || "").trim();
    if (legacyAvatar && AVATARS.some((avatar) => avatar.id === legacyAvatar)) return legacyAvatar;
  } catch (_err) {}
  return AVATARS[0].id;
}

function resolveInitialAccentId() {
  try {
    const storedColor = String(localStorage.getItem(ACCENT_STORAGE_KEY) || "").trim();
    if (storedColor) {
      const match = AVATAR_ACCENTS.find((row) => row.color === storedColor || row.id === storedColor);
      if (match) return match.id;
    }
    const legacy = JSON.parse(localStorage.getItem("gs_student_classroom") || "null");
    const legacyColor = String((legacy && legacy.accentColor) || "").trim();
    if (legacyColor) {
      const legacyMatch = AVATAR_ACCENTS.find((row) => row.color === legacyColor || row.id === legacyColor);
      if (legacyMatch) return legacyMatch.id;
    }
  } catch (_err) {}
  return AVATAR_ACCENTS[0].id;
}

function init() {
  const form = document.getElementById("joinForm");
  const pinInput = document.getElementById("joinPin");
  const nickInput = document.getElementById("joinNickname");
  const statusEl = document.getElementById("joinStatus");
  const avatarMount = document.getElementById("avatarPicker");
  const joinBtn = document.getElementById("joinButton");
  const mascotEl = document.getElementById("selectedAvatarPreview");
  const accentMount = document.getElementById("accentPicker");
  const randomAvatarBtn = document.getElementById("randomAvatarBtn");
  const confirmation = document.getElementById("joinConfirmation");
  const ctaShell = document.getElementById("joinCtaShell");

  if (!form || !pinInput || !nickInput || !statusEl || !avatarMount || !joinBtn) return;

  const initialPin = resolveInitialPin();
  if (initialPin) pinInput.value = initialPin;

  let selectedAccentId = resolveInitialAccentId();
  const avatarPicker = createAvatarPicker({
    mountEl: avatarMount,
    initialAvatarId: resolveInitialAvatarId(),
    onChange: (avatarId) => {
      renderMascot(mascotEl, avatarId, selectedAccentId);
      playSound("hover");
    }
  });
  renderMascot(mascotEl, avatarPicker.getSelectedAvatarId(), selectedAccentId);

  if (accentMount) {
    accentMount.innerHTML = AVATAR_ACCENTS.map((accent) => {
      const activeClass = accent.id === selectedAccentId ? "is-selected" : "";
      return `<button type="button" class="accent-chip ${activeClass}" data-accent-id="${accent.id}" style="--accent-color:${accent.color};">${accent.label}</button>`;
    }).join("");
    accentMount.querySelectorAll("[data-accent-id]").forEach((button) => {
      button.addEventListener("click", () => {
        selectedAccentId = button.getAttribute("data-accent-id");
        accentMount.querySelectorAll("[data-accent-id]").forEach((chip) => {
          chip.classList.toggle("is-selected", chip.getAttribute("data-accent-id") === selectedAccentId);
        });
        renderMascot(mascotEl, avatarPicker.getSelectedAvatarId(), selectedAccentId);
      });
    });
  }

  if (randomAvatarBtn) {
    randomAvatarBtn.addEventListener("click", () => {
      const randomAvatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
      const randomAccent = AVATAR_ACCENTS[Math.floor(Math.random() * AVATAR_ACCENTS.length)];
      if (randomAvatar) avatarPicker.setSelectedAvatarId(randomAvatar.id);
      if (randomAccent) {
        selectedAccentId = randomAccent.id;
        if (accentMount) {
          accentMount.querySelectorAll("[data-accent-id]").forEach((chip) => {
            chip.classList.toggle("is-selected", chip.getAttribute("data-accent-id") === selectedAccentId);
          });
        }
      }
      renderMascot(mascotEl, avatarPicker.getSelectedAvatarId(), selectedAccentId);
      playSound("levelup");
    });
  }

  const joinForm = createJoinForm({
    formEl: form,
    pinInputEl: pinInput,
    nicknameInputEl: nickInput,
    statusEl,
    joinButtonEl: joinBtn,
    getAvatarId: () => avatarPicker.getSelectedAvatarId(),
    getAccentColor: () => getAccentById(selectedAccentId).color,
    onValidSubmit: async ({ pin, nickname, avatarId, accentColor }) => {
      const { player } = addPlayerToLobby(pin, { nickname, avatarId, accentColor });
      try {
        localStorage.setItem(AVATAR_STORAGE_KEY, avatarId);
        localStorage.setItem(ACCENT_STORAGE_KEY, accentColor);
      } catch (_err) {}
      upsertStudentProfile(player.id, {
        display_name: nickname,
        avatar_id: avatarId,
        accent_color: accentColor,
        class_id: pin,
        identity_ready: true
      });
      setActiveContext(player.id, pin);
      applyDailyLoginBonus(player.id);
      track("student_join_success", { pin, nickname, avatar_id: avatarId });
      playSound("confirm");
      confettiBurst(ctaShell);

      if (confirmation) {
        confirmation.innerHTML = `
          <strong>Welcome, ${player.nickname}.</strong>
          Joining code <strong>${pin}</strong>...
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
