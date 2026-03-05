const LOBBY_STORE_KEY = "gs_student_lobbies_v1";

function canUseStorage() {
  try {
    const key = "__gs_lobby_probe__";
    localStorage.setItem(key, "1");
    localStorage.removeItem(key);
    return true;
  } catch (_err) {
    return false;
  }
}

function readStore() {
  if (!canUseStorage()) return {};
  try {
    const parsed = JSON.parse(localStorage.getItem(LOBBY_STORE_KEY) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (_err) {
    return {};
  }
}

function writeStore(store) {
  if (!canUseStorage()) return;
  localStorage.setItem(LOBBY_STORE_KEY, JSON.stringify(store || {}));
}

export function normalizePin(value) {
  const raw = String(value || "").trim().toUpperCase();
  if (raw === "DEMO") return "DEMO";
  if (/^\d{6}$/.test(raw)) return raw;
  return "";
}

export function resolvePinFromLocation(locationObj = window.location) {
  const queryPin = normalizePin(new URLSearchParams(locationObj.search || "").get("pin"));
  if (queryPin) return queryPin;
  const parts = String(locationObj.pathname || "")
    .split("/")
    .filter(Boolean);
  const last = parts[parts.length - 1];
  return normalizePin(last);
}

export function getLobby(pin) {
  const normalizedPin = normalizePin(pin);
  if (!normalizedPin) return null;
  const store = readStore();
  return store[normalizedPin] || null;
}

function defaultLobby(pin) {
  return {
    pin,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    players: []
  };
}

export function upsertLobby(pin, updater) {
  const normalizedPin = normalizePin(pin);
  if (!normalizedPin) throw new Error("Invalid PIN.");
  const store = readStore();
  const existing = store[normalizedPin] || defaultLobby(normalizedPin);
  const next = typeof updater === "function" ? updater(existing) : existing;
  next.pin = normalizedPin;
  next.updatedAt = Date.now();
  if (!Array.isArray(next.players)) next.players = [];
  store[normalizedPin] = next;
  writeStore(store);
  return next;
}

function generatePlayerId() {
  return `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function sortPlayers(players) {
  return [...(players || [])].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.joinedAt - b.joinedAt;
  });
}

export function addPlayerToLobby(pin, payload) {
  const nickname = String(payload.nickname || "").trim();
  const avatarId = String(payload.avatarId || "spy_hacker").trim();
  const accentColor = String(payload.accentColor || "#1f8f8f").trim();

  let createdPlayer = null;
  const lobby = upsertLobby(pin, (existing) => {
    const dupe = existing.players.some(
      (player) => player.nickname.toLowerCase() === nickname.toLowerCase()
    );
    if (dupe) {
      throw new Error("Nickname already joined this lobby. Try another one.");
    }
    createdPlayer = {
      id: generatePlayerId(),
      nickname,
      avatarId,
      accentColor,
      score: 0,
      joinedAt: Date.now()
    };
    return {
      ...existing,
      players: [...existing.players, createdPlayer]
    };
  });
  return { lobby, player: createdPlayer };
}

export function runDemoRound(pin) {
  return upsertLobby(pin, (existing) => {
    const players = existing.players.map((player) => {
      const gain = Math.floor(Math.random() * 101);
      return { ...player, score: player.score + gain };
    });
    return { ...existing, players };
  });
}

export function clearLobby(pin) {
  const normalizedPin = normalizePin(pin);
  if (!normalizedPin) return;
  const store = readStore();
  delete store[normalizedPin];
  writeStore(store);
}

export function getPodium(pin) {
  const lobby = getLobby(pin);
  if (!lobby) return [];
  return sortPlayers(lobby.players).slice(0, 3);
}
