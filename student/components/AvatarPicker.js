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
  const byPack = AVATARS.reduce((acc, avatar) => {
    const key = avatar.pack || "Agents";
    if (!acc[key]) acc[key] = [];
    acc[key].push(avatar);
    return acc;
  }, {});

  Object.keys(byPack).forEach((packName) => {
    const pack = document.createElement("section");
    pack.className = "avatar-pack";
    pack.innerHTML = `<p class="avatar-pack-title">${packName}</p><div class="avatar-pack-grid"></div>`;
    const grid = pack.querySelector(".avatar-pack-grid");
    byPack[packName].forEach((avatar) => {
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
      grid.appendChild(button);
    });
    mountEl.appendChild(pack);
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
