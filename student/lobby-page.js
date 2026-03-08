import { createLobbyRanking, sortPlayers } from "./components/LobbyRanking.js";
import { getLobby, resolvePinFromLocation, runDemoRound } from "./lobby-store.js";
import { getAvatarById, renderAvatarSvg } from "./data/avatars.js";
import { setActiveContext } from "./identity-store.js";
import { startSession } from "/core/classroom-session.js";

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
    playerId: String(params.get("player") || "").trim(),
    isHost: params.get("host") === "1"
  };
}

function winnerPreviewCard(player) {
  if (!player) {
    return '<p class="winner-preview-empty">Waiting for players...</p>';
  }
  const avatar = getAvatarById(player.avatarId);
  return `
    <div class="winner-preview-card">
      <span class="winner-preview-avatar">${renderAvatarSvg(avatar, 56, { accentColor: player.accentColor, rankBadge: 1 })}</span>
      <div>
        <p class="winner-preview-kicker">Current leader</p>
        <p class="winner-preview-name">${player.nickname}</p>
      </div>
      <p class="winner-preview-score">${player.score} XP</p>
    </div>
  `;
}

function init() {
  const pin = resolvePinFromLocation(window.location);
  const pinEl = document.getElementById("lobbyPin");
  const missionEl = document.getElementById("lobbyMissionName");
  const teacherEl = document.getElementById("lobbyTeacherName");
  const playersCountEl = document.getElementById("playersCount");
  const statusEl = document.getElementById("lobbyStatus");
  const listEl = document.getElementById("rankingList");
  const demoBtn = document.getElementById("demoRoundBtn");
  const demoHint = document.getElementById("demoModeHint");
  const winnerBtn = document.getElementById("winnerPageBtn");
  const startBtn = document.getElementById("startMissionBtn");
  const launchBtn = document.getElementById("launchMissionBtn");
  const winnerPreviewEl = document.getElementById("winnerPreview");
  const liveRegion = document.getElementById("lobbyLiveRegion");
  const battleMeterValue = document.getElementById("battleMeterValue");
  const battleMeterFill = document.getElementById("battleMeterFill");

  if (!pin || !pinEl || !playersCountEl || !statusEl || !listEl || !winnerBtn || !winnerPreviewEl) {
    return;
  }

  const params = parseParams();
  if (params.playerId) {
    setActiveContext(params.playerId, pin);
  }
  if (params.demo && demoHint) demoHint.hidden = false;
  if (demoBtn) demoBtn.hidden = !params.demo;
  if (startBtn) startBtn.hidden = !params.isHost;
  if (launchBtn) launchBtn.hidden = !params.isHost;

  pinEl.textContent = pin;
  winnerBtn.href = `/winner/?pin=${encodeURIComponent(pin)}`;

  const ranking = createLobbyRanking({ mountEl: listEl });
  let previousLeadId = null;
  let previousOrder = "";
  let redirectedToMission = false;

  function missionUrlForLobby(lobby) {
    if (!lobby || !lobby.missionUrl) return "";
    try {
      const url = new URL(lobby.missionUrl, window.location.origin);
      url.searchParams.set("session_id", lobby.sessionId);
      url.searchParams.set("code", lobby.pin);
      if (params.playerId) url.searchParams.set("player_id", params.playerId);
      return `${url.pathname}${url.search}`;
    } catch (_err) {
      return "";
    }
  }

  function refresh() {
    const lobby = getLobby(pin);
    if (!lobby) {
      statusEl.textContent = "Session not found yet. Ask your teacher to launch the mission first.";
      if (missionEl) missionEl.textContent = "Mission loading...";
      if (teacherEl) teacherEl.textContent = "Teacher: --";
      playersCountEl.textContent = "0";
      ranking.render([]);
      winnerPreviewEl.innerHTML = winnerPreviewCard(null);
      return;
    }

    const sorted = sortPlayers(lobby.players);
    const lead = sorted[0] || null;
    playersCountEl.textContent = String(sorted.length);
    if (missionEl) missionEl.textContent = lobby.missionName || lobby.missionId || "Mission";
    if (teacherEl) teacherEl.textContent = `Teacher: ${lobby.teacherName || "Teacher"}`;
    if (lobby.status === "waiting") {
      statusEl.textContent = params.isHost
        ? "Waiting room live. Add students, then press Start Mission."
        : "Waiting room live. Your teacher will start the mission soon.";
    } else if (lobby.status === "active") {
      statusEl.textContent = "Mission in progress. Scoreboard updates live.";
    } else {
      statusEl.textContent = "Mission ended. Review final standings or open Winner Board.";
    }
    ranking.render(sorted);
    winnerPreviewEl.innerHTML = winnerPreviewCard(lead);
    if (battleMeterValue && battleMeterFill) {
      const topScore = lead ? Number(lead.score || 0) : 0;
      const meter = Math.max(0, Math.min(100, Math.round(sorted.length * 10 + topScore / 6)));
      battleMeterValue.textContent = `${meter}%`;
      battleMeterFill.style.width = `${meter}%`;
    }

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

    if (startBtn) {
      startBtn.hidden = !params.isHost || lobby.status !== "waiting";
      startBtn.disabled = sorted.length === 0;
    }
    if (launchBtn) {
      const missionUrl = missionUrlForLobby(lobby);
      launchBtn.hidden = !params.isHost || lobby.status !== "active" || !missionUrl;
      launchBtn.href = missionUrl || "#";
    }

    const missionLink = missionUrlForLobby(lobby);
    if (!params.isHost && params.playerId && lobby.status === "active" && missionLink && !redirectedToMission) {
      redirectedToMission = true;
      statusEl.textContent = "Mission started. Launching your mission now...";
      window.setTimeout(() => {
        window.location.href = missionLink;
      }, 650);
    }
  }

  refresh();
  const poll = window.setInterval(refresh, 1200);
  window.addEventListener("beforeunload", () => window.clearInterval(poll));

  if (demoBtn) {
    demoBtn.addEventListener("click", () => {
      const updated = runDemoRound(pin);
      if (!updated) return;
      playSound("confirm");
      track("student_lobby_demo_round", {
        pin,
        players: updated.players.length
      });
      refresh();
    });
  }
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      const lobby = getLobby(pin);
      if (!lobby) return;
      try {
        startSession(lobby.sessionId);
        playSound("confirm");
        track("classroom_session_started", {
          code: pin,
          session_id: lobby.sessionId,
          mission_id: lobby.missionId
        });
      } catch (err) {
        statusEl.textContent = err && err.message ? err.message : "Could not start mission.";
      }
      refresh();
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
