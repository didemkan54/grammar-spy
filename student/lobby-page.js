import { createLobbyRanking, sortPlayers } from "./components/LobbyRanking.js";
import { getLobby, resolvePinFromLocation, runDemoRound } from "./lobby-store.js";
import { getAvatarById, renderAvatarSvg } from "./data/avatars.js";
import { setActiveContext } from "./identity-store.js";

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

function parseParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    demo: params.get("demo") === "1",
    playerId: String(params.get("player") || "").trim()
  };
}

function winnerPreviewCard(player) {
  if (!player) {
    return '<p class="winner-preview-empty">Waiting for players...</p>';
  }
  const avatar = getAvatarById(player.avatarId);
  return `
    <div class="winner-preview-card">
      <span class="winner-preview-avatar">${renderAvatarSvg(avatar, 56)}</span>
      <div>
        <p class="winner-preview-kicker">Current leader</p>
        <p class="winner-preview-name">${player.nickname}</p>
      </div>
      <p class="winner-preview-score">${player.score}</p>
    </div>
  `;
}

function init() {
  const pin = resolvePinFromLocation(window.location);
  const pinEl = document.getElementById("lobbyPin");
  const playersCountEl = document.getElementById("playersCount");
  const statusEl = document.getElementById("lobbyStatus");
  const listEl = document.getElementById("rankingList");
  const demoBtn = document.getElementById("demoRoundBtn");
  const demoHint = document.getElementById("demoModeHint");
  const winnerBtn = document.getElementById("winnerPageBtn");
  const winnerPreviewEl = document.getElementById("winnerPreview");
  const liveRegion = document.getElementById("lobbyLiveRegion");

  if (!pin || !pinEl || !playersCountEl || !statusEl || !listEl || !winnerBtn || !winnerPreviewEl) {
    return;
  }

  const params = parseParams();
  if (params.playerId) {
    setActiveContext(params.playerId, pin);
  }
  if (params.demo && demoHint) demoHint.hidden = false;
  if (demoBtn) demoBtn.hidden = !params.demo;

  pinEl.textContent = pin;
  winnerBtn.href = `/winner/?pin=${encodeURIComponent(pin)}`;

  const ranking = createLobbyRanking({ mountEl: listEl });
  let previousLeadId = null;
  let previousOrder = "";

  function refresh() {
    const lobby = getLobby(pin);
    if (!lobby) {
      statusEl.textContent = "Lobby not found yet. Ask players to join using this PIN.";
      playersCountEl.textContent = "0";
      ranking.render([]);
      winnerPreviewEl.innerHTML = winnerPreviewCard(null);
      return;
    }

    const sorted = sortPlayers(lobby.players);
    const lead = sorted[0] || null;
    playersCountEl.textContent = String(sorted.length);
    statusEl.textContent = "Same-device live demo mode. Rankings update from local storage.";
    ranking.render(sorted);
    winnerPreviewEl.innerHTML = winnerPreviewCard(lead);

    const order = sorted.map((player) => `${player.id}:${player.score}`).join("|");
    if (order !== previousOrder) {
      if (liveRegion) {
        liveRegion.textContent = `Lobby updated. ${sorted.length} players.`;
      }
      previousOrder = order;
    }

    if (lead && previousLeadId && previousLeadId !== lead.id) {
      playSound("confirm");
    }
    previousLeadId = lead ? lead.id : null;
  }

  refresh();
  const poll = window.setInterval(refresh, 1200);
  window.addEventListener("beforeunload", () => window.clearInterval(poll));

  if (demoBtn) {
    demoBtn.addEventListener("click", () => {
      const updated = runDemoRound(pin);
      playSound("confirm");
      track("student_lobby_demo_round", {
        pin,
        players: updated.players.length
      });
      refresh();
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
