export const SCHEMA_VERSION = 1;
const STORAGE_KEY = "grammarSpy.profile.v1";

function nowIso() {
  return new Date().toISOString();
}

function baseProfile() {
  return {
    schemaVersion: SCHEMA_VERSION,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    totalXP: 0,
    rank: "Cadet",
    missionsCompleted: 0,
    missionHistory: [],
    skillMastery: {},
    settings: {
      soundOn: true,
      reducedMotion: false
    }
  };
}

function migrateIfNeeded(profile) {
  if (!profile || typeof profile !== "object") return baseProfile();
  if (!profile.schemaVersion || profile.schemaVersion !== SCHEMA_VERSION) {
    const migrated = { ...baseProfile(), ...profile, schemaVersion: SCHEMA_VERSION };
    migrated.updatedAt = nowIso();
    return migrated;
  }
  return profile;
}

export function getProfile() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return baseProfile();
    return migrateIfNeeded(JSON.parse(raw));
  } catch {
    return baseProfile();
  }
}

export function saveProfile(profile) {
  const merged = migrateIfNeeded({ ...baseProfile(), ...profile });
  merged.updatedAt = nowIso();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  return merged;
}

export function resetProfile() {
  const next = baseProfile();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}
