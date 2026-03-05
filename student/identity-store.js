const PROFILE_KEY = "gs_student_profiles_v1";
const ACTIVE_STUDENT_KEY = "gs_active_student_id_v1";
const ACTIVE_CLASS_KEY = "gs_active_class_id_v1";

const RANK_STEPS = [
  { minLevel: 1, label: "Rookie Agent" },
  { minLevel: 3, label: "Field Agent" },
  { minLevel: 5, label: "Investigator" },
  { minLevel: 7, label: "Elite Agent" },
  { minLevel: 9, label: "Director" }
];

function nowIso() {
  return new Date().toISOString();
}

function dayStamp(dateObj = new Date()) {
  return dateObj.toISOString().slice(0, 10);
}

function canUseStorage() {
  try {
    const probe = "__gs_profile_probe__";
    localStorage.setItem(probe, "1");
    localStorage.removeItem(probe);
    return true;
  } catch (_err) {
    return false;
  }
}

function readProfilesStore() {
  if (!canUseStorage()) return {};
  try {
    const parsed = JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (_err) {
    return {};
  }
}

function writeProfilesStore(store) {
  if (!canUseStorage()) return;
  localStorage.setItem(PROFILE_KEY, JSON.stringify(store || {}));
}

export function levelFromXp(totalXp) {
  return Math.max(1, Math.floor(Number(totalXp || 0) / 200) + 1);
}

export function rankFromLevel(level) {
  const safe = Number(level || 1);
  let selected = RANK_STEPS[0].label;
  RANK_STEPS.forEach((step) => {
    if (safe >= step.minLevel) selected = step.label;
  });
  return selected;
}

function baseProfile(studentId, fields = {}) {
  const totalXp = Number(fields.total_xp || 0);
  const level = levelFromXp(totalXp);
  return {
    student_id: studentId,
    display_name: String(fields.display_name || "Agent"),
    avatar_id: String(fields.avatar_id || "rookie"),
    class_id: String(fields.class_id || "DEMO"),
    total_xp: totalXp,
    level,
    rank: rankFromLevel(level),
    streak_days: Number(fields.streak_days || 0),
    last_played_day: String(fields.last_played_day || ""),
    last_login_bonus_day: String(fields.last_login_bonus_day || ""),
    created_at: String(fields.created_at || nowIso()),
    updated_at: nowIso()
  };
}

export function getStudentProfile(studentId) {
  const id = String(studentId || "").trim();
  if (!id) return null;
  const store = readProfilesStore();
  const row = store[id];
  if (!row) return null;
  return baseProfile(id, row);
}

export function upsertStudentProfile(studentId, fields = {}) {
  const id = String(studentId || "").trim();
  if (!id) throw new Error("student_id is required.");
  const store = readProfilesStore();
  const merged = {
    ...(store[id] || {}),
    ...fields
  };
  const next = baseProfile(id, merged);
  store[id] = next;
  writeProfilesStore(store);
  return next;
}

export function listStudentProfiles() {
  const store = readProfilesStore();
  return Object.keys(store).map((id) => baseProfile(id, store[id]));
}

export function setActiveContext(studentId, classId) {
  if (!canUseStorage()) return;
  if (studentId) localStorage.setItem(ACTIVE_STUDENT_KEY, String(studentId));
  if (classId) localStorage.setItem(ACTIVE_CLASS_KEY, String(classId).toUpperCase());
}

export function getActiveStudentId() {
  if (!canUseStorage()) return "student_local";
  const explicit = String(localStorage.getItem(ACTIVE_STUDENT_KEY) || "").trim();
  if (explicit) return explicit;
  const legacyName = String(localStorage.getItem("gs_active_student_v1") || "").trim();
  if (legacyName) {
    return `name_${legacyName.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || "student"}`;
  }
  return "student_local";
}

export function getActiveClassId() {
  if (!canUseStorage()) return "DEMO";
  const id = String(localStorage.getItem(ACTIVE_CLASS_KEY) || "").trim().toUpperCase();
  return id || "DEMO";
}

export function awardXp(studentId, amount, metadata = {}) {
  const current = upsertStudentProfile(studentId, metadata);
  const prevLevel = current.level;
  const nextXp = Math.max(0, Number(current.total_xp || 0) + Number(amount || 0));
  const nextLevel = levelFromXp(nextXp);
  const next = upsertStudentProfile(studentId, {
    ...current,
    ...metadata,
    total_xp: nextXp,
    level: nextLevel,
    rank: rankFromLevel(nextLevel)
  });
  return {
    profile: next,
    leveledUp: nextLevel > prevLevel,
    previousLevel: prevLevel,
    nextLevel
  };
}

export function applyDailyLoginBonus(studentId) {
  const today = dayStamp();
  const profile = upsertStudentProfile(studentId);
  if (profile.last_login_bonus_day === today) {
    return { profile, granted: false, amount: 0 };
  }
  const awarded = awardXp(studentId, 20, { last_login_bonus_day: today });
  return { profile: awarded.profile, granted: true, amount: 20, leveledUp: awarded.leveledUp };
}

export function markDailyPlay(studentId) {
  const today = dayStamp();
  const profile = upsertStudentProfile(studentId);

  if (profile.last_played_day === today) {
    return profile;
  }

  let streak = 1;
  if (profile.last_played_day) {
    const prev = new Date(`${profile.last_played_day}T00:00:00Z`);
    const current = new Date(`${today}T00:00:00Z`);
    const diffDays = Math.round((current - prev) / 86400000);
    if (diffDays === 1) streak = Number(profile.streak_days || 0) + 1;
  }

  return upsertStudentProfile(studentId, {
    ...profile,
    streak_days: streak,
    last_played_day: today
  });
}
