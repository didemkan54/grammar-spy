function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function ensureAnalytics(profile) {
  const next = { ...profile };
  if (!next.analytics) {
    next.analytics = {
      missionAttempts: {},
      skillAttempts: {},
      errorPatterns: {},
      recentMissionIds: []
    };
  }
  return next;
}

export function logItemEvent(profile, event) {
  const next = ensureAnalytics(profile);
  const analytics = next.analytics;
  const missionId = event.missionId || "unknown";
  const skillTag = event.skillTag || "unspecified";
  const errorType = event.errorType || "none";

  if (!analytics.missionAttempts[missionId]) {
    analytics.missionAttempts[missionId] = {
      attempts: 0,
      correct: 0,
      incorrect: 0,
      lastPlayedAt: null
    };
  }
  const missionStats = analytics.missionAttempts[missionId];
  missionStats.attempts += 1;
  missionStats.correct += event.correct ? 1 : 0;
  missionStats.incorrect += event.correct ? 0 : 1;
  missionStats.lastPlayedAt = new Date().toISOString();

  if (!analytics.skillAttempts[skillTag]) {
    analytics.skillAttempts[skillTag] = {
      attempts: 0,
      correct: 0,
      incorrect: 0,
      repeatedErrors: 0
    };
  }
  const skillStats = analytics.skillAttempts[skillTag];
  skillStats.attempts += 1;
  skillStats.correct += event.correct ? 1 : 0;
  skillStats.incorrect += event.correct ? 0 : 1;
  skillStats.repeatedErrors += event.repeatedError ? 1 : 0;

  if (!event.correct) {
    analytics.errorPatterns[errorType] = (analytics.errorPatterns[errorType] || 0) + 1;
  }

  return next;
}

export function logMissionAttempt(profile, summary) {
  const next = ensureAnalytics(profile);
  const analytics = next.analytics;
  const missionId = summary.missionId || "unknown";

  if (!Array.isArray(next.missionHistory)) next.missionHistory = [];
  next.missionHistory.push(summary);
  next.missionsCompleted = (next.missionsCompleted || 0) + 1;

  analytics.recentMissionIds = [missionId, ...(analytics.recentMissionIds || []).filter((id) => id !== missionId)].slice(0, 10);
  return next;
}

export function getTopErrorPatterns(profile, limit = 2) {
  const patterns = profile.analytics?.errorPatterns || {};
  return Object.entries(patterns)
    .map(([errorType, count]) => ({ errorType, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, Math.max(1, limit));
}

export function getRecentMissions(profile, limit = 8) {
  const history = Array.isArray(profile.missionHistory) ? profile.missionHistory : [];
  return clone(history.slice(-Math.max(1, limit)).reverse());
}

export function getMissionStats(profile, missionId) {
  const stats = profile.analytics?.missionAttempts?.[missionId] || null;
  return stats ? clone(stats) : null;
}
