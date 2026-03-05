import { getLobby, resolvePinFromLocation, sortPlayers } from "./lobby-store.js";
import { getAvatarById, renderAvatarSvg } from "./data/avatars.js";

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

function renderWinnerCard(player) {
  const avatar = getAvatarById(player.avatarId);
  return `
    <article class="winner-main-card">
      <p class="winner-main-kicker">WINNER</p>
      <span class="winner-main-avatar">${renderAvatarSvg(avatar, 110, { accentColor: player.accentColor, rankBadge: 1 })}</span>
      <h2>${player.nickname}</h2>
      <p class="winner-main-score">${player.score} pts</p>
    </article>
  `;
}

function renderPodium(player, index) {
  if (!player) {
    return `<article class="podium-card is-empty"><p>#${index + 2}</p><span>Waiting...</span></article>`;
  }
  const avatar = getAvatarById(player.avatarId);
  return `
    <article class="podium-card rank-${index + 2}">
      <p class="podium-rank">#${index + 2}</p>
      <span class="podium-avatar">${renderAvatarSvg(avatar, 64, { accentColor: player.accentColor, rankBadge: index + 2 })}</span>
      <h3>${player.nickname}</h3>
      <p class="podium-score">${player.score} pts</p>
    </article>
  `;
}

function init() {
  const pin = resolvePinFromLocation(window.location);
  const pinEl = document.getElementById("winnerPin");
  const shell = document.getElementById("winnerShell");
  const podiumEl = document.getElementById("podiumCards");
  const emptyEl = document.getElementById("winnerEmpty");

  if (!pin || !pinEl || !shell || !podiumEl || !emptyEl) return;
  pinEl.textContent = pin;

  const lobby = getLobby(pin);
  if (!lobby || !Array.isArray(lobby.players) || !lobby.players.length) {
    emptyEl.hidden = false;
    return;
  }

  const sorted = sortPlayers(lobby.players);
  const top = sorted[0];
  const second = sorted[1] || null;
  const third = sorted[2] || null;

  shell.innerHTML = renderWinnerCard(top);
  podiumEl.innerHTML = `${renderPodium(second, 0)}${renderPodium(third, 1)}`;
  track("student_lobby_winner_view", {
    pin,
    winner_nickname: top.nickname,
    winner_score: top.score
  });
  playSound("victory");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
