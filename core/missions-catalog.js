import MISSIONS_DATA from "/data/missions.js";

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
  return mission.hubPath || `/missions/hub.html?mission=${encodeURIComponent(mission.id)}`;
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
  if (maybeSlug && maybeSlug !== "hub.html") {
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
