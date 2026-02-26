export const RANKS = [
  "Cadet",
  "Rookie Agent",
  "Field Agent",
  "Senior Agent",
  "Director"
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function avg(list) {
  if (!list.length) return 0;
  return list.reduce((sum, n) => sum + n, 0) / list.length;
}

function hasDecreasingTrend(values) {
  if (values.length < 3) return false;
  const latest = values.slice(-3);
  return latest[2] <= latest[1] && latest[1] <= latest[0];
}

function uniqueMissionCountByLevel(history, level) {
  const ids = new Set(
    history
      .filter((row) => Number(row.cognitiveLevel) === Number(level) && row.masteryAchieved)
      .map((row) => row.missionId)
  );
  return ids.size;
}

export function computeXP(event) {
  const correct = Boolean(event.correct);
  const base = correct ? 50 : 0;
  const streakBonus = correct ? Math.max(0, Number(event.streak || 0)) * 10 : 0;

  let speedBonus = 0;
  if (correct && event.timerEnabled) {
    const targetMs = Math.max(1, Number(event.targetTimeMs || 0));
    const responseMs = Math.max(1, Number(event.responseTimeMs || targetMs));
    const speedRatio = clamp((targetMs - responseMs) / targetMs, 0, 1);
    speedBonus = Math.round(speedRatio * 30);
  }

  const repeatedPenalty = event.repeatedError ? 15 : 0;
  const xp = Math.max(0, base + streakBonus + speedBonus - repeatedPenalty);

  return { xp, base, streakBonus, speedBonus, repeatedPenalty };
}

export function awardXP(profile, xp) {
  const next = { ...profile };
  next.totalXP = Math.max(0, Number(next.totalXP || 0) + Number(xp || 0));
  return next;
}

export function updateSkillMastery(profile, skillTag, result) {
  if (!skillTag) return profile;
  const next = { ...profile, skillMastery: { ...(profile.skillMastery || {}) } };
  const existing = next.skillMastery[skillTag] || {
    attempts: 0,
    correct: 0,
    bestStreak: 0,
    repeatedErrors: 0,
    errorTypes: {},
    mastered: false
  };

  const entry = { ...existing, errorTypes: { ...(existing.errorTypes || {}) } };
  entry.attempts += 1;
  if (result.correct) entry.correct += 1;
  entry.bestStreak = Math.max(entry.bestStreak, Number(result.streak || 0));
  if (result.repeatedError) entry.repeatedErrors += 1;
  if (!result.correct && result.errorType) {
    entry.errorTypes[result.errorType] = (entry.errorTypes[result.errorType] || 0) + 1;
  }

  const accuracy = entry.attempts ? (entry.correct / entry.attempts) * 100 : 0;
  const repeatedErrorRate = entry.attempts ? entry.repeatedErrors / entry.attempts : 0;
  entry.mastered = entry.attempts >= 20 && accuracy >= 85 && repeatedErrorRate <= 0.2;

  next.skillMastery[skillTag] = entry;
  return next;
}

export function updateRank(profile) {
  const next = { ...profile };
  const history = Array.isArray(next.missionHistory) ? next.missionHistory : [];
  const missionsCompleted = Number(next.missionsCompleted || history.length || 0);
  const accuracyValues = history.map((row) => Number(row.accuracy || 0));
  const avgAccuracy = avg(accuracyValues);
  const streakQualified = history.filter((row) => Number(row.bestStreak || 0) >= 5).length;
  const repeatedRates = history.map((row) => Number(row.repeatedErrorRate || 0)).filter((v) => !Number.isNaN(v));
  const decreasingRepeatedErrors = hasDecreasingTrend(repeatedRates);

  let rank = "Cadet";
  if (missionsCompleted >= 1) rank = "Cadet";
  if (history.length >= 3 && avgAccuracy >= 70) rank = "Rookie Agent";
  if (avgAccuracy >= 80 && streakQualified >= 2) rank = "Field Agent";
  if (avgAccuracy >= 85 && decreasingRepeatedErrors) rank = "Senior Agent";
  if (
    avgAccuracy >= 90 &&
    uniqueMissionCountByLevel(history, 2) >= 2 &&
    uniqueMissionCountByLevel(history, 3) >= 1
  ) {
    rank = "Director";
  }

  next.rank = rank;
  return next;
}

export function getRecommendations(profile, lastMissionSummary, missionManifest) {
  const rows = Array.isArray(missionManifest) ? missionManifest : [];
  const recent = lastMissionSummary || {};
  const weakFromSummary = Array.isArray(recent.topErrorPatterns)
    ? recent.topErrorPatterns
        .map((row) => row?.skillTag || row?.tag || row)
        .filter(Boolean)
        .slice(0, 3)
    : [];

  let weakSkills = weakFromSummary;
  if (!weakSkills.length) {
    const mastery = profile.skillMastery || {};
    weakSkills = Object.entries(mastery)
      .map(([skill, data]) => {
        const attempts = Number(data.attempts || 0);
        const correct = Number(data.correct || 0);
        const acc = attempts ? (correct / attempts) * 100 : 100;
        return { skill, acc };
      })
      .sort((a, b) => a.acc - b.acc)
      .slice(0, 3)
      .map((row) => row.skill);
  }

  const suggestions = rows
    .filter((mission) => mission.missionId !== recent.missionId)
    .map((mission) => {
      const missionSkills = mission.skills || [];
      const overlap = weakSkills.filter((skill) => missionSkills.includes(skill));
      return { mission, overlapCount: overlap.length };
    })
    .filter((row) => row.overlapCount > 0)
    .sort((a, b) => b.overlapCount - a.overlapCount)
    .slice(0, 3)
    .map((row) => ({
      missionId: row.mission.missionId,
      missionName: row.mission.missionName,
      reason: `Targets skill gaps: ${(row.mission.skills || []).filter((s) => weakSkills.includes(s)).join(", ")}`
    }));

  return suggestions;
}
