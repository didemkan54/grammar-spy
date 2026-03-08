import {
  endSession,
  getSessionByCode,
  joinSession,
  normalizeJoinCode,
  startSession,
  submitAnswer
} from "/core/classroom-session.js";

export function normalizePin(value) {
  return normalizeJoinCode(value);
}

export function resolvePinFromLocation(locationObj = window.location) {
  const params = new URLSearchParams(locationObj.search || "");
  const queryCode = normalizePin(params.get("pin") || params.get("code"));
  if (queryCode) return queryCode;
  const parts = String(locationObj.pathname || "").split("/").filter(Boolean);
  const last = parts[parts.length - 1];
  return normalizePin(last);
}

function toLobbyPlayer(player) {
  return {
    id: player.id,
    nickname: player.agentName || "Agent",
    avatarId: player.avatarId || "spy_hacker",
    accentColor: player.accentColor || "#1f8f8f",
    score: Number(player.xp || 0),
    joinedAt: player.joinedAtMs || Date.now(),
    accuracy: Number(player.accuracy || 0),
    correctAnswers: Number(player.correctAnswers || 0),
    totalAnswers: Number(player.totalAnswers || 0),
    completionStatus: player.completionStatus || "waiting"
  };
}

function toLobbyShape(session) {
  if (!session) return null;
  return {
    pin: session.joinCode,
    sessionId: session.id,
    missionId: session.missionId,
    missionName: session.missionName,
    missionUrl: session.missionUrl,
    teacherName: session.teacherName,
    status: session.status,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    players: (session.players || []).map(toLobbyPlayer)
  };
}

export function getLobby(pin) {
  const code = normalizePin(pin);
  if (!code) return null;
  return toLobbyShape(getSessionByCode(code));
}

export function sortPlayers(players) {
  return [...(players || [])].sort((a, b) => {
    const scoreDiff = Number(b.score || 0) - Number(a.score || 0);
    if (scoreDiff !== 0) return scoreDiff;
    const accuracyDiff = Number(b.accuracy || 0) - Number(a.accuracy || 0);
    if (accuracyDiff !== 0) return accuracyDiff;
    return Number(a.joinedAt || 0) - Number(b.joinedAt || 0);
  });
}

export function addPlayerToLobby(pin, payload) {
  const result = joinSession(pin, payload.nickname, {
    avatarId: payload.avatarId,
    accentColor: payload.accentColor
  });
  return {
    lobby: toLobbyShape(result.session),
    player: toLobbyPlayer(result.player)
  };
}

export function runDemoRound(pin) {
  const code = normalizePin(pin);
  if (!code) return null;
  const session = getSessionByCode(code);
  if (!session) return null;
  if (session.status === "waiting") startSession(session.id);
  (session.players || []).forEach((player) => {
    const xp = 8 + Math.floor(Math.random() * 24);
    submitAnswer(player.id, `demo_${Date.now()}`, {
      isCorrect: Math.random() > 0.25,
      xpEarned: xp,
      scoreDelta: xp
    });
  });
  return getLobby(code);
}

export function clearLobby(pin) {
  const code = normalizePin(pin);
  if (!code) return;
  const session = getSessionByCode(code);
  if (!session) return;
  endSession(session.id, { reason: "clear_lobby" });
}

export function getPodium(pin) {
  const lobby = getLobby(pin);
  if (!lobby) return [];
  return sortPlayers(lobby.players).slice(0, 3);
}
