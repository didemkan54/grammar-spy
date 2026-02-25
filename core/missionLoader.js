const MANIFEST_URL = new URL("../missions/manifest.json", import.meta.url);

let manifestCache = null;
const missionCache = new Map();

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

async function fetchJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load ${url}`);
  }
  return response.json();
}

export async function listAllMissions() {
  if (!manifestCache) {
    const manifest = await fetchJson(MANIFEST_URL);
    manifestCache = Array.isArray(manifest.missions) ? manifest.missions : [];
  }
  return clone(manifestCache);
}

export async function loadMission(missionId) {
  if (!missionId) throw new Error("missionId is required");

  if (missionCache.has(missionId)) {
    return clone(missionCache.get(missionId));
  }

  const manifest = await listAllMissions();
  const row = manifest.find((entry) => entry.missionId === missionId);
  if (!row) throw new Error(`Mission not found: ${missionId}`);

  const missionUrl = new URL(`../${row.path}`, import.meta.url);
  const mission = await fetchJson(missionUrl);
  missionCache.set(missionId, mission);
  return clone(mission);
}

export async function filterMissions(criteria = {}) {
  const {
    gradeBand = "",
    cognitiveLevel = "",
    skills = [],
    retrievalType = "",
    grammarFocus = "",
    missionName = ""
  } = criteria;

  const selectedSkills = Array.isArray(skills)
    ? skills.filter(Boolean).map((s) => s.toLowerCase())
    : [];
  const all = await listAllMissions();

  return all.filter((mission) => {
    if (gradeBand && mission.gradeBand !== gradeBand) return false;
    if (cognitiveLevel && Number(mission.cognitiveLevel) !== Number(cognitiveLevel)) return false;
    if (retrievalType && mission.retrievalType !== retrievalType) return false;
    if (grammarFocus && mission.grammarFocus !== grammarFocus) return false;
    if (missionName && !mission.missionName.toLowerCase().includes(missionName.toLowerCase())) return false;

    if (selectedSkills.length) {
      const missionSkills = (mission.skills || []).map((s) => s.toLowerCase());
      const hasAtLeastOne = selectedSkills.some((skill) => missionSkills.includes(skill));
      if (!hasAtLeastOne) return false;
    }

    return true;
  });
}

export function getTierItems(mission, tier, count, shuffle = true) {
  if (!mission || !mission.items) return [];
  const tierKey = String(tier || "field").toLowerCase();
  const ids = mission.difficultyTiers?.[tierKey] || [];
  const idSet = new Set(ids);

  const source = ids.length
    ? mission.items.filter((item) => idSet.has(item.id))
    : mission.items.slice();

  const list = source.slice();
  if (shuffle) {
    for (let i = list.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
  }

  const targetCount = Number(count) > 0 ? Number(count) : list.length;
  return clone(list.slice(0, Math.min(targetCount, list.length)));
}

export function getManifestSummary(manifestRows) {
  const rows = manifestRows || [];
  const grammarFocus = [...new Set(rows.map((r) => r.grammarFocus).filter(Boolean))].sort();
  const retrievalTypes = [...new Set(rows.map((r) => r.retrievalType).filter(Boolean))].sort();
  const skills = [...new Set(rows.flatMap((r) => r.skills || []))].sort();
  return { grammarFocus, retrievalTypes, skills };
}
