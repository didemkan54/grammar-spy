import { getAvatarById, renderAvatarSvg } from "../data/avatars.js";

function canAnimate() {
  return !(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
}

export function sortPlayers(players) {
  return [...(players || [])].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.joinedAt - b.joinedAt;
  });
}

export function createLobbyRanking(options) {
  const { mountEl } = options || {};
  if (!mountEl) throw new Error("LobbyRanking requires mountEl.");

  let currentById = new Map();

  function render(players) {
    const sorted = sortPlayers(players);
    const beforePositions = new Map();
    if (canAnimate()) {
      mountEl.querySelectorAll(".rank-row").forEach((node) => {
        beforePositions.set(node.getAttribute("data-player-id"), node.getBoundingClientRect().top);
      });
    }

    mountEl.innerHTML = "";
    if (!sorted.length) {
      mountEl.innerHTML =
        '<div class="empty-state">No players joined yet. Use <strong>/join</strong> to enter this PIN.</div>';
      return sorted;
    }

    const fragment = document.createDocumentFragment();
    sorted.forEach((player, idx) => {
      const avatar = getAvatarById(player.avatarId);
      const row = document.createElement("article");
      row.className = "rank-row";
      row.setAttribute("data-player-id", player.id);
      if (idx < 3) row.classList.add(`rank-top-${idx + 1}`);
      row.innerHTML = `
        <span class="rank-num">#${idx + 1}</span>
        <span class="rank-avatar">${renderAvatarSvg(avatar, 44)}</span>
        <span class="rank-name">${player.nickname}</span>
        <span class="rank-score">${player.score}</span>
      `;
      fragment.appendChild(row);
    });
    mountEl.appendChild(fragment);

    if (canAnimate()) {
      mountEl.querySelectorAll(".rank-row").forEach((node) => {
        const id = node.getAttribute("data-player-id");
        if (!beforePositions.has(id)) return;
        const oldTop = beforePositions.get(id);
        const newTop = node.getBoundingClientRect().top;
        const deltaY = oldTop - newTop;
        if (!deltaY) return;
        node.animate(
          [{ transform: `translateY(${deltaY}px)` }, { transform: "translateY(0)" }],
          { duration: 380, easing: "cubic-bezier(.22,1,.36,1)" }
        );
      });
    }

    currentById = new Map(sorted.map((player) => [player.id, player]));
    return sorted;
  }

  return {
    render,
    hasPlayer(playerId) {
      return currentById.has(playerId);
    }
  };
}
