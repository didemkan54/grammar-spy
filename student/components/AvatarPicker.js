import { AVATARS, renderAvatarSvg } from "../data/avatars.js";

export function createAvatarPicker(options) {
  const {
    mountEl,
    initialAvatarId = AVATARS[0].id,
    onChange = function () {}
  } = options || {};

  if (!mountEl) {
    throw new Error("AvatarPicker requires mountEl.");
  }

  let selectedId = initialAvatarId;
  mountEl.innerHTML = "";
  mountEl.classList.add("avatar-grid");

  AVATARS.forEach((avatar) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "avatar-tile";
    button.setAttribute("data-avatar-id", avatar.id);
    button.setAttribute("aria-pressed", String(avatar.id === selectedId));
    button.setAttribute("aria-label", `Select avatar ${avatar.label}`);
    button.innerHTML = `
      <span class="avatar-thumb">${renderAvatarSvg(avatar, 56)}</span>
      <span class="avatar-label">${avatar.label}</span>
    `;

    button.addEventListener("click", () => {
      selectedId = avatar.id;
      mountEl.querySelectorAll(".avatar-tile").forEach((el) => {
        const isActive = el.getAttribute("data-avatar-id") === selectedId;
        el.classList.toggle("is-selected", isActive);
        el.setAttribute("aria-pressed", String(isActive));
      });
      onChange(selectedId);
    });

    if (avatar.id === selectedId) {
      button.classList.add("is-selected");
    }

    mountEl.appendChild(button);
  });

  return {
    getSelectedAvatarId() {
      return selectedId;
    },
    setSelectedAvatarId(nextId) {
      if (!AVATARS.some((avatar) => avatar.id === nextId)) return;
      selectedId = nextId;
      mountEl.querySelectorAll(".avatar-tile").forEach((el) => {
        const isActive = el.getAttribute("data-avatar-id") === selectedId;
        el.classList.toggle("is-selected", isActive);
        el.setAttribute("aria-pressed", String(isActive));
      });
      onChange(selectedId);
    }
  };
}
