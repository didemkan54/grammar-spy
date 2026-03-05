import MISSIONS_DATA from "/data/missions.js";
import {
  applyDailyLoginBonus,
  awardXp,
  getActiveClassId,
  getActiveStudentId,
  getStudentProfile,
  listStudentProfiles,
  markDailyPlay,
  rankFromLevel,
  setActiveContext,
  upsertStudentProfile
} from "/student/identity-store.js";

const ATTEMPTS_KEY = "gs_progress_attempts_v1";
const MAX_ATTEMPTS = 12000;

function nowIso() {
  return new Date().toISOString();
}

function clamp(num, low, high) {
  return Math.max(low, Math.min(high, num));
}

function canUseStorage() {
  try {
    const probe = "__gs_progress_probe__";
    localStorage.setItem(probe, "1");
    localStorage.removeItem(probe);
    return true;
  } catch (_err) {
    return false;
  }
}

function readAttempts() {
  if (!canUseStorage()) return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(ATTEMPTS_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (_err) {
    return [];
  }
}

function writeAttempts(rows) {
  if (!canUseStorage()) return;
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify((rows || []).slice(-MAX_ATTEMPTS)));
}

function gameLookup() {
  const map = {};
  (MISSIONS_DATA.missions || []).forEach((mission) => {
    (mission.subskills || []).forEach((subskill) => {
      (subskill.games || []).forEach((game) => {
        map[`${mission.id}::${game.id}`] = { mission, subskill, game };
      });
    });
  });
  return map;
}

const GAME_LOOKUP = gameLookup();

function missionCategoryFromMission(mission) {
  const text = String(mission?.subtitle || mission?.title || "").toLowerCase();
  if (text.includes("present")) return "present";
  if (text.includes("past")) return "past";
  if (text.includes("future")) return "future";
  return "mixed";
}

function summarizeAccuracy(rows) {
  if (!rows.length) return 0;
  const avg = rows.reduce((sum, row) => sum + Number(row.accuracy || 0), 0) / rows.length;
  return Math.round(avg);
}

function averageTime(rows) {
  if (!rows.length) return 0;
  return Math.round(rows.reduce((sum, row) => sum + Number(row.time_spent_seconds || 0), 0) / rows.length);
}

function attemptsForStudentGame(rows, studentId, gameId) {
  return rows.filter((row) => row.student_id === studentId && row.game_id === gameId).length;
}

function ruleStats(rows) {
  const byRule = {};
  rows.forEach((row) => {
    const ruleId = String(row.grammar_rule_id || "unknown");
    if (!byRule[ruleId]) {
      byRule[ruleId] = { grammar_rule_id: ruleId, attempts: 0, accuracy_total: 0, best_accuracy: 0 };
    }
    byRule[ruleId].attempts += 1;
    byRule[ruleId].accuracy_total += Number(row.accuracy || 0);
    byRule[ruleId].best_accuracy = Math.max(byRule[ruleId].best_accuracy, Number(row.accuracy || 0));
  });
  return Object.values(byRule)
    .map((row) => ({
      ...row,
      accuracy: Math.round(row.accuracy_total / Math.max(1, row.attempts))
    }))
    .sort((a, b) => a.accuracy - b.accuracy);
}

function categoryStats(rows) {
  const seed = {
    present: { played: 0, completed: 0, accuracy_total: 0 },
    past: { played: 0, completed: 0, accuracy_total: 0 },
    future: { played: 0, completed: 0, accuracy_total: 0 }
  };
  rows.forEach((row) => {
    const cat = seed[row.mission_category] ? row.mission_category : "present";
    seed[cat].played += 1;
    seed[cat].completed += Number(row.accuracy || 0) >= 70 ? 1 : 0;
    seed[cat].accuracy_total += Number(row.accuracy || 0);
  });
  return Object.keys(seed).map((key) => {
    const set = seed[key];
    return {
      category: key,
      played: set.played,
      completed: set.completed,
      accuracy: set.played ? Math.round(set.accuracy_total / set.played) : 0,
      progress_pct: set.played ? Math.round((set.completed / set.played) * 100) : 0
    };
  });
}

function recommendationRows(studentId) {
  const attempts = readAttempts().filter((row) => row.student_id === studentId);
  if (!attempts.length) {
    return [
      {
        type: "diagnostic",
        label: "Start with Diagnostic",
        reason: "No history yet. Begin with one short baseline mission.",
        href: "/missions/"
      }
    ];
  }

  const weakRules = ruleStats(attempts).filter((row) => row.accuracy < 60).slice(0, 3);
  if (!weakRules.length) {
    return [
      {
        type: "mastery",
        label: "Advance to next mission",
        reason: "Strong accuracy across recent rules.",
        href: "/missions/"
      }
    ];
  }

  return weakRules.map((rule) => {
    const match = Object.values(GAME_LOOKUP).find((row) => row.subskill.id === rule.grammar_rule_id);
    if (!match) {
      return {
        type: "rule_practice",
        grammar_rule_id: rule.grammar_rule_id,
        label: `Rule practice: ${rule.grammar_rule_id}`,
        reason: `Accuracy ${rule.accuracy}% — practice this rule next.`,
        href: "/missions/"
      };
    }
    const playHref = `/play/?mission=${encodeURIComponent(match.mission.id)}&subskill=${encodeURIComponent(
      match.subskill.id
    )}&game=${encodeURIComponent(match.game.id)}`;
    return {
      type: "rule_practice",
      grammar_rule_id: rule.grammar_rule_id,
      label: `Rule: ${match.subskill.title}`,
      reason: `Accuracy ${rule.accuracy}% — recommend ${match.game.title}.`,
      href: playHref
    };
  });
}

export function recordAttempt(payload) {
  const rows = readAttempts();
  const studentId = String(payload?.student_id || getActiveStudentId()).trim() || "student_local";
  const classId = String(payload?.class_id || getActiveClassId()).trim().toUpperCase() || "DEMO";
  const missionId = String(payload?.mission_id || "unknown");
  const gameId = String(payload?.game_id || "unknown");
  const grammarRuleId = String(payload?.grammar_rule_id || payload?.subskill_id || "unknown");
  const accuracy = clamp(Number(payload?.accuracy || 0), 0, 100);
  const score = Math.max(0, Number(payload?.score || 0));
  const timeSpent = Math.max(0, Number(payload?.time_spent_seconds || 0));

  const lookup = GAME_LOOKUP[`${missionId}::${gameId}`];
  const missionCategory = lookup ? missionCategoryFromMission(lookup.mission) : "mixed";
  const attemptsCount = attemptsForStudentGame(rows, studentId, gameId) + 1;

  const entry = {
    id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    student_id: studentId,
    class_id: classId,
    mission_id: missionId,
    game_id: gameId,
    grammar_rule_id: grammarRuleId,
    score,
    accuracy,
    attempts_count: attemptsCount,
    time_spent_seconds: timeSpent,
    created_at: payload?.created_at || nowIso(),
    mission_category: missionCategory,
    play_url: String(payload?.play_url || "")
  };

  rows.push(entry);
  writeAttempts(rows);

  const profileSeed = upsertStudentProfile(studentId, {
    display_name: payload?.display_name || studentId,
    avatar_id: payload?.avatar_id || "rookie",
    class_id: classId
  });
  setActiveContext(studentId, classId);

  // XP rules
  const correctCount = Math.max(0, Number(payload?.correct_count ?? score));
  const correctXp = correctCount * 10;
  const finishXp = 50;
  const perfectXp = accuracy === 100 ? 100 : 0;

  markDailyPlay(studentId);
  const loginBonus = applyDailyLoginBonus(studentId);
  let leveledUp = false;
  let updated = awardXp(studentId, correctXp + finishXp + perfectXp, {
    display_name: profileSeed.display_name,
    avatar_id: profileSeed.avatar_id,
    class_id: classId
  });
  leveledUp = leveledUp || updated.leveledUp;

  if (loginBonus.granted) {
    const extra = awardXp(studentId, 20, {
      display_name: profileSeed.display_name,
      avatar_id: profileSeed.avatar_id,
      class_id: classId
    });
    leveledUp = leveledUp || extra.leveledUp;
    updated = extra;
  }

  return {
    attempt: entry,
    xp_awarded: correctXp + finishXp + perfectXp + (loginBonus.granted ? 20 : 0),
    leveled_up: leveledUp,
    profile: updated.profile
  };
}

export function getStudentSummary(studentId) {
  const id = String(studentId || "").trim() || getActiveStudentId();
  const attempts = readAttempts().filter((row) => row.student_id === id);
  const profile = getStudentProfile(id) || upsertStudentProfile(id, { display_name: id });
  const byRule = ruleStats(attempts);
  const categories = categoryStats(attempts);
  const recent = attempts.slice(-5).reverse();
  const classLeaderboard = getLeaderboard(profile.class_id || "DEMO");
  const rankRow = classLeaderboard.find((row) => row.student_id === id);

  return {
    student_id: id,
    class_id: profile.class_id || "DEMO",
    profile: {
      ...profile,
      rank: rankFromLevel(profile.level),
      next_level_xp: profile.level * 200,
      xp_to_next_level: Math.max(0, profile.level * 200 - Number(profile.total_xp || 0))
    },
    totals: {
      attempts: attempts.length,
      average_accuracy: summarizeAccuracy(attempts),
      average_time_seconds: averageTime(attempts)
    },
    mission_categories: categories,
    by_rule: byRule,
    recent_activity: recent,
    rank_in_class: rankRow ? rankRow.rank : null,
    recommendations: recommendationRows(id)
  };
}

export function getClassSummary(classId) {
  const safeClassId = String(classId || getActiveClassId()).toUpperCase();
  const attempts = readAttempts().filter((row) => row.class_id === safeClassId);
  const studentIds = Array.from(new Set(attempts.map((row) => row.student_id)));
  const byCategory = categoryStats(attempts);
  const byRule = ruleStats(attempts);
  const weakRules = byRule.slice(0, 3);

  const studentRows = studentIds.map((studentId) => {
    const studentAttempts = attempts.filter((row) => row.student_id === studentId);
    const profile = getStudentProfile(studentId) || upsertStudentProfile(studentId, { class_id: safeClassId });
    const weakest = ruleStats(studentAttempts)[0];
    return {
      student_id: studentId,
      student_name: profile.display_name || studentId,
      avatar_id: profile.avatar_id || "rookie",
      progress_pct: studentAttempts.length ? Math.min(100, Math.round((studentAttempts.length / 30) * 100)) : 0,
      accuracy_pct: summarizeAccuracy(studentAttempts),
      weakest_rule: weakest ? weakest.grammar_rule_id : "n/a",
      streak_days: Number(profile.streak_days || 0),
      xp: Number(profile.total_xp || 0)
    };
  });

  return {
    class_id: safeClassId,
    totals: {
      games_played: attempts.length,
      active_students: studentIds.length,
      average_accuracy: summarizeAccuracy(attempts),
      average_time_spent_seconds: averageTime(attempts)
    },
    by_category: byCategory,
    weak_rules: weakRules,
    students: studentRows
  };
}

export function getLeaderboard(classId) {
  const safeClassId = String(classId || getActiveClassId()).toUpperCase();
  const attempts = readAttempts().filter((row) => row.class_id === safeClassId);
  const profiles = listStudentProfiles().filter((row) => String(row.class_id || "").toUpperCase() === safeClassId);
  const ids = new Set([...attempts.map((row) => row.student_id), ...profiles.map((row) => row.student_id)]);

  const rows = Array.from(ids)
    .map((studentId) => {
      const studentAttempts = attempts.filter((row) => row.student_id === studentId);
      const profile = getStudentProfile(studentId) || upsertStudentProfile(studentId, { class_id: safeClassId });
      return {
        student_id: studentId,
        student_name: profile.display_name || studentId,
        avatar_id: profile.avatar_id || "rookie",
        xp: Number(profile.total_xp || 0),
        average_accuracy: summarizeAccuracy(studentAttempts),
        streak_days: Number(profile.streak_days || 0),
        level: Number(profile.level || 1)
      };
    })
    .sort((a, b) => {
      if (b.xp !== a.xp) return b.xp - a.xp;
      if (b.average_accuracy !== a.average_accuracy) return b.average_accuracy - a.average_accuracy;
      return a.student_name.localeCompare(b.student_name);
    })
    .slice(0, 10)
    .map((row, idx) => ({ ...row, rank: idx + 1 }));

  return rows;
}

export function getRecommendations(studentId) {
  const id = String(studentId || "").trim() || getActiveStudentId();
  return recommendationRows(id);
}

export function getAllAttempts() {
  return readAttempts().slice().sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)));
}

export function getStudentAttempts(studentId) {
  const id = String(studentId || "").trim();
  return readAttempts()
    .filter((row) => row.student_id === id)
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
}

if (typeof window !== "undefined") {
  window.GSProgress = {
    recordAttempt,
    getStudentSummary,
    getClassSummary,
    getLeaderboard,
    getRecommendations,
    getAllAttempts,
    getStudentAttempts
  };
}
