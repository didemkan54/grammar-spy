import MISSIONS_DATA from "/data/missions.js";

const MISSION_PROGRESS_KEY = "gs_mission_progress_v1";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function slugToMissionId(slug) {
  return String(slug || "").trim().toLowerCase().replace(/-/g, "_");
}

function missionIdToSlug(missionId) {
  return String(missionId || "").trim().toLowerCase().replace(/_/g, "-");
}

export function listMissions() {
  return clone(MISSIONS_DATA.missions || []);
}

export function getMissionById(missionId) {
  if (!missionId) return null;
  const id = String(missionId).trim();
  const mission = (MISSIONS_DATA.missions || []).find((row) => row.id === id);
  return mission ? clone(mission) : null;
}

export function getMissionBySlug(slug) {
  if (!slug) return null;
  const normalized = String(slug).trim().toLowerCase();
  const mission = (MISSIONS_DATA.missions || []).find((row) => {
    return String(row.slug || missionIdToSlug(row.id)) === normalized;
  });
  return mission ? clone(mission) : getMissionById(slugToMissionId(slug));
}

export function getSubskillById(mission, subskillId) {
  if (!mission || !Array.isArray(mission.subskills)) return null;
  const subskill = mission.subskills.find((row) => row.id === subskillId);
  return subskill ? clone(subskill) : null;
}

export function getGameById(subskill, gameId) {
  if (!subskill || !Array.isArray(subskill.games)) return null;
  const game = subskill.games.find((row) => row.id === gameId);
  return game ? clone(game) : null;
}

export function buildPlayUrl(params) {
  const query = new URLSearchParams();
  query.set("mission", params.missionId);
  query.set("subskill", params.subskillId);
  query.set("game", params.gameId);
  return `/play/?${query.toString()}`;
}

export function buildHubUrl(mission) {
  if (!mission) return "/missions/";
  return mission.hubPath || `/missions/hub?mission=${encodeURIComponent(mission.id)}`;
}

export function resolveMissionForHub(searchParams = new URLSearchParams(window.location.search), pathname = window.location.pathname) {
  const missionFromQuery = String(searchParams.get("mission") || "").trim();
  if (missionFromQuery) {
    return getMissionById(missionFromQuery) || getMissionBySlug(missionFromQuery);
  }

  const parts = String(pathname || "")
    .split("/")
    .filter(Boolean);
  const maybeSlug = parts.length >= 2 && parts[0] === "missions" ? parts[1] : "";
  if (maybeSlug && maybeSlug !== "hub") {
    return getMissionBySlug(maybeSlug);
  }

  return null;
}

export function flattenGameOrder(mission) {
  if (!mission || !Array.isArray(mission.subskills)) return [];
  const rows = [];
  mission.subskills.forEach((subskill) => {
    (subskill.games || []).forEach((game) => {
      rows.push({
        missionId: mission.id,
        subskillId: subskill.id,
        gameId: game.id
      });
    });
  });
  return rows;
}

export function getNextGamePointer(mission, subskillId, gameId) {
  const order = flattenGameOrder(mission);
  const idx = order.findIndex((row) => row.subskillId === subskillId && row.gameId === gameId);
  if (idx < 0 || idx + 1 >= order.length) return null;
  return order[idx + 1];
}

export function formatGameTypeLabel(gameType) {
  const lookup = {
    multiple_choice: "Multiple Choice",
    sentence_builder: "Sentence Builder",
    drag_sort: "Drag Sort",
    error_spotter: "Error Fix"
  };
  return lookup[gameType] || String(gameType || "").replace(/_/g, " ");
}

export function buildMissionProgressGameKey(subskillId, gameId) {
  return `${String(subskillId || "").trim()}::${String(gameId || "").trim()}`;
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readProgressStore() {
  if (!canUseStorage()) return {};
  try {
    const raw = window.localStorage.getItem(MISSION_PROGRESS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (_err) {
    return {};
  }
}

function writeProgressStore(store) {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(MISSION_PROGRESS_KEY, JSON.stringify(store));
  } catch (_err) {}
}

export function getMissionProgress(missionId) {
  if (!missionId) return { completedGames: {} };
  const store = readProgressStore();
  const row = store[missionId];
  if (!row || typeof row !== "object") return { completedGames: {} };
  const completedGames =
    row.completedGames && typeof row.completedGames === "object" ? row.completedGames : {};
  return { completedGames };
}

export function markMissionGameCompleted(payload) {
  const missionId = String(payload?.missionId || "").trim();
  const subskillId = String(payload?.subskillId || "").trim();
  const gameId = String(payload?.gameId || "").trim();
  if (!missionId || !subskillId || !gameId) return;

  const store = readProgressStore();
  if (!store[missionId] || typeof store[missionId] !== "object") {
    store[missionId] = { completedGames: {} };
  }
  if (!store[missionId].completedGames || typeof store[missionId].completedGames !== "object") {
    store[missionId].completedGames = {};
  }

  const gameKey = buildMissionProgressGameKey(subskillId, gameId);
  store[missionId].completedGames[gameKey] = {
    completedAt: new Date().toISOString(),
    accuracy: Number(payload?.accuracy) || 0,
    score: Number(payload?.score) || 0,
    total: Number(payload?.total) || 0
  };
  writeProgressStore(store);
}
