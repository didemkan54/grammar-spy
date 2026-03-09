const STORAGE_KEY = "gs_classroom_sessions_v1";
const CODE_ALPHABET = "0123456789";
let memoryStore = null;

function canUseStorage() {
  try {
    const probe = "__gs_session_probe__";
    localStorage.setItem(probe, "1");
    localStorage.removeItem(probe);
    return true;
  } catch (_err) {
    return false;
  }
}

function nowIso() {
  return new Date().toISOString();
}

function nowMs() {
  return Date.now();
}

function createEmptyStore() {
  return {
    sessionsById: {},
    joinCodeToSessionId: {},
    playerToSessionId: {},
    updatedAt: nowIso()
  };
}

function readMemoryStore() {
  if (!memoryStore) memoryStore = createEmptyStore();
  return clone(memoryStore);
}

function writeMemoryStore(store) {
  memoryStore = clone(store && typeof store === "object" ? store : createEmptyStore());
}

function readStore() {
  if (!canUseStorage()) return readMemoryStore();
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    if (!parsed || typeof parsed !== "object") return createEmptyStore();
    const sessionsById = parsed.sessionsById && typeof parsed.sessionsById === "object" ? parsed.sessionsById : {};
    const joinCodeToSessionId = parsed.joinCodeToSessionId && typeof parsed.joinCodeToSessionId === "object" ? parsed.joinCodeToSessionId : {};
    const playerToSessionId = parsed.playerToSessionId && typeof parsed.playerToSessionId === "object" ? parsed.playerToSessionId : {};
    return {
      sessionsById,
      joinCodeToSessionId,
      playerToSessionId,
      updatedAt: parsed.updatedAt || nowIso()
    };
  } catch (_err) {
    return createEmptyStore();
  }
}

function writeStore(store) {
  if (!canUseStorage()) {
    writeMemoryStore(store);
    return;
  }
  const next = store && typeof store === "object" ? store : createEmptyStore();
  next.updatedAt = nowIso();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function randomId(prefix) {
  return `${prefix}_${nowMs().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function cleanName(value, fallback) {
  const raw = String(value || "").replace(/\s+/g, " ").trim();
  if (!raw) return fallback || "";
  return raw.slice(0, 32);
}

export function normalizeJoinCode(value) {
  const raw = String(value || "").replace(/\D+/g, "");
  return /^\d{6}$/.test(raw) ? raw : "";
}

function toSessionPlayer(player) {
  const totalAnswers = Math.max(0, Number(player.totalAnswers || 0));
  const correctAnswers = Math.max(0, Number(player.correctAnswers || 0));
  const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;
  return {
    id: String(player.id || ""),
    sessionId: String(player.sessionId || ""),
    agentName: cleanName(player.agentName, "Agent"),
    avatarId: String(player.avatarId || "spy_hacker"),
    accentColor: String(player.accentColor || "#1f8f8f"),
    xp: Math.max(0, Number(player.xp || 0)),
    score: Math.max(0, Number(player.score || 0)),
    joinedAt: player.joinedAt || nowIso(),
    joinedAtMs: Number(player.joinedAtMs || nowMs()),
    correctAnswers,
    totalAnswers,
    accuracy,
    completionStatus: String(player.completionStatus || "waiting"),
    completionTimeSeconds: Number(player.completionTimeSeconds || 0),
    completedAt: player.completedAt || "",
    answers: Array.isArray(player.answers) ? player.answers : []
  };
}

function sortScoreboard(players) {
  return [...players]
    .sort((a, b) => {
      if ((b.xp || 0) !== (a.xp || 0)) return (b.xp || 0) - (a.xp || 0);
      if ((b.accuracy || 0) !== (a.accuracy || 0)) return (b.accuracy || 0) - (a.accuracy || 0);
      return (a.joinedAtMs || 0) - (b.joinedAtMs || 0);
    })
    .map((player, index) => ({
      rank: index + 1,
      playerId: player.id,
      agentName: player.agentName,
      avatarId: player.avatarId,
      accentColor: player.accentColor,
      xp: player.xp,
      score: player.score,
      correctAnswers: player.correctAnswers,
      totalAnswers: player.totalAnswers,
      accuracy: player.accuracy,
      completionStatus: player.completionStatus,
      completionTimeSeconds: player.completionTimeSeconds
    }));
}

function updateSessionScoreboard(session) {
  session.players = (session.players || []).map(toSessionPlayer);
  session.scoreboard = sortScoreboard(session.players);
  session.updatedAt = nowIso();
  return session;
}

export function generateJoinCode(existingStore) {
  const store = existingStore && typeof existingStore === "object" ? existingStore : readStore();
  for (let attempt = 0; attempt < 50; attempt += 1) {
    let code = "";
    for (let i = 0; i < 6; i += 1) {
      code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
    }
    if (!store.joinCodeToSessionId[code]) return code;
  }
  throw new Error("Could not generate a unique join code. Please try again.");
}

export function createSession(missionId, options = {}) {
  const missionKey = String(missionId || options.missionId || "").trim();
  if (!missionKey) throw new Error("missionId is required to create a session.");
  const store = readStore();
  const id = randomId("session");
  const joinCode = generateJoinCode(store);
  const createdAt = nowIso();
  const teacherName = cleanName(options.teacherName, "Teacher");
  const teacherId = String(options.teacherId || "teacher_local");
  const missionName = cleanName(options.missionName, missionKey);
  const missionUrl = String(options.missionUrl || "").trim();
  const session = {
    id,
    teacherId,
    teacherName,
    missionId: missionKey,
    missionName,
    missionUrl,
    joinCode,
    status: "waiting",
    players: [],
    scoreboard: [],
    createdAt,
    createdAtMs: nowMs(),
    startedAt: "",
    endedAt: "",
    updatedAt: createdAt
  };
  store.sessionsById[id] = session;
  store.joinCodeToSessionId[joinCode] = id;
  writeStore(store);
  return clone(session);
}

export function getSessionById(sessionId) {
  const id = String(sessionId || "").trim();
  if (!id) return null;
  const store = readStore();
  const session = store.sessionsById[id];
  if (!session) return null;
  return clone(updateSessionScoreboard(session));
}

export function getSessionByCode(code) {
  const joinCode = normalizeJoinCode(code);
  if (!joinCode) return null;
  const store = readStore();
  const sessionId = store.joinCodeToSessionId[joinCode];
  if (!sessionId) return null;
  const session = store.sessionsById[sessionId];
  if (!session) return null;
  return clone(updateSessionScoreboard(session));
}

export function joinSession(code, agentName, options = {}) {
  const joinCode = normalizeJoinCode(code);
  if (!joinCode) throw new Error("Enter a valid 6-digit join code.");
  const cleanAgentName = cleanName(agentName, "");
  if (cleanAgentName.length < 2) throw new Error("Agent name must be at least 2 characters.");

  const store = readStore();
  const sessionId = store.joinCodeToSessionId[joinCode];
  if (!sessionId || !store.sessionsById[sessionId]) throw new Error("Session code not found.");
  const session = store.sessionsById[sessionId];
  if (session.status !== "waiting") throw new Error("Mission already started. Ask your teacher for the latest code.");

  const duplicate = (session.players || []).some((player) => String(player.agentName || "").toLowerCase() === cleanAgentName.toLowerCase());
  if (duplicate) throw new Error("That agent name is already in this session.");

  const player = toSessionPlayer({
    id: randomId("player"),
    sessionId: session.id,
    agentName: cleanAgentName,
    avatarId: String(options.avatarId || "spy_hacker"),
    accentColor: String(options.accentColor || "#1f8f8f"),
    xp: 0,
    score: 0,
    joinedAt: nowIso(),
    joinedAtMs: nowMs(),
    correctAnswers: 0,
    totalAnswers: 0,
    completionStatus: "waiting",
    completionTimeSeconds: 0,
    answers: []
  });
  session.players = [...(session.players || []), player];
  updateSessionScoreboard(session);
  store.playerToSessionId[player.id] = session.id;
  store.sessionsById[session.id] = session;
  writeStore(store);
  return {
    session: clone(session),
    player: clone(player),
    scoreboard: clone(session.scoreboard || [])
  };
}

export function startSession(sessionId) {
  const id = String(sessionId || "").trim();
  if (!id) throw new Error("sessionId is required.");
  const store = readStore();
  const session = store.sessionsById[id];
  if (!session) throw new Error("Session not found.");
  if (session.status === "ended") throw new Error("Session already ended.");

  session.status = "active";
  if (!session.startedAt) session.startedAt = nowIso();
  session.players = (session.players || []).map((player) => {
    const next = toSessionPlayer(player);
    if (next.completionStatus === "waiting") next.completionStatus = "playing";
    return next;
  });
  updateSessionScoreboard(session);
  store.sessionsById[id] = session;
  writeStore(store);
  return clone(session);
}

function getMutableSessionByPlayerId(store, playerId) {
  const id = String(playerId || "").trim();
  if (!id) return { session: null, playerIndex: -1 };
  const sessionId = store.playerToSessionId[id];
  if (!sessionId || !store.sessionsById[sessionId]) return { session: null, playerIndex: -1 };
  const session = store.sessionsById[sessionId];
  const playerIndex = (session.players || []).findIndex((entry) => entry && entry.id === id);
  return { session, playerIndex };
}

export function submitAnswer(playerId, questionId, answer = {}) {
  const store = readStore();
  const lookup = getMutableSessionByPlayerId(store, playerId);
  if (!lookup.session || lookup.playerIndex < 0) throw new Error("Player is not in an active session.");

  const session = lookup.session;
  if (session.status !== "active") throw new Error("Session is not active yet.");
  const player = toSessionPlayer(session.players[lookup.playerIndex]);
  const xpEarned = Math.max(0, Number(answer.xpEarned || answer.xp || 0));
  const scoreDelta = Math.max(0, Number(answer.scoreDelta || xpEarned));
  const isCorrect = Boolean(answer.isCorrect);
  const answeredAt = nowIso();
  const answerRecord = {
    id: randomId("ans"),
    questionId: String(questionId || answer.questionId || "").trim() || "unknown",
    submittedAnswer: answer.submittedAnswer || answer.answer || "",
    isCorrect,
    xpEarned,
    scoreDelta,
    skipped: Boolean(answer.skipped),
    answeredAt
  };

  player.totalAnswers += 1;
  if (isCorrect) player.correctAnswers += 1;
  player.xp += xpEarned;
  player.score += scoreDelta;
  player.answers = [...player.answers, answerRecord];
  player.accuracy = player.totalAnswers > 0 ? Math.round((player.correctAnswers / player.totalAnswers) * 100) : 0;
  if (player.completionStatus === "waiting") player.completionStatus = "playing";
  if (answer.completed) {
    player.completionStatus = "completed";
    player.completedAt = answeredAt;
    player.completionTimeSeconds = Math.max(0, Number(answer.completionTimeSeconds || player.completionTimeSeconds || 0));
  }

  session.players[lookup.playerIndex] = player;
  updateSessionScoreboard(session);
  store.sessionsById[session.id] = session;
  writeStore(store);
  return {
    session: clone(session),
    player: clone(player),
    scoreboard: clone(session.scoreboard || [])
  };
}

export function updateScoreboard(sessionId) {
  const id = String(sessionId || "").trim();
  if (!id) throw new Error("sessionId is required.");
  const store = readStore();
  const session = store.sessionsById[id];
  if (!session) throw new Error("Session not found.");
  updateSessionScoreboard(session);
  store.sessionsById[id] = session;
  writeStore(store);
  return clone(session.scoreboard || []);
}

export function endSession(sessionId, options = {}) {
  const id = String(sessionId || "").trim();
  if (!id) throw new Error("sessionId is required.");
  const store = readStore();
  const session = store.sessionsById[id];
  if (!session) throw new Error("Session not found.");
  session.status = "ended";
  if (!session.endedAt) session.endedAt = nowIso();
  session.endReason = String(options.reason || "teacher_end");
  session.players = (session.players || []).map((player) => {
    const next = toSessionPlayer(player);
    if (next.completionStatus !== "completed") next.completionStatus = "ended";
    return next;
  });
  updateSessionScoreboard(session);
  store.sessionsById[id] = session;
  writeStore(store);
  return clone(session);
}

export function getSessionForPlayer(playerId) {
  const store = readStore();
  const lookup = getMutableSessionByPlayerId(store, playerId);
  if (!lookup.session) return null;
  updateSessionScoreboard(lookup.session);
  return clone(lookup.session);
}

export const GSClassroomSession = {
  createSession,
  endSession,
  generateJoinCode,
  getSessionByCode,
  getSessionById,
  getSessionForPlayer,
  joinSession,
  normalizeJoinCode,
  startSession,
  submitAnswer,
  updateScoreboard
};

if (typeof window !== "undefined") {
  window.GSClassroomSession = GSClassroomSession;
}

export default GSClassroomSession;
