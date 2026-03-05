import { getMissionProgress, listMissions } from "/core/missions-catalog.js";
import { getLeaderboard, getStudentSummary } from "/core/progressStore.js";
import {
  applyDailyLoginBonus,
  getActiveClassId,
  getActiveStudentId,
  setActiveContext,
  upsertStudentProfile
} from "/student/identity-store.js";
import { AVATAR_ACCENTS, AVATARS, getAvatarById, renderAvatarSvg } from "/student/data/avatars.js";

const DAILY_KEY = "gs_daily_challenge_state_v1";
const BOSS_KEY = "gs_boss_mission_state_v1";

function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}

function readJson(key, fallback) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "null");
    return parsed == null ? fallback : parsed;
  } catch (_err) {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function playSound(type) {
  if (window.GSSound && typeof window.GSSound.play === "function") {
    window.GSSound.play(type);
  }
}

function renderAgentSetup(summary) {
  const shell = document.getElementById("agentSetupPanel");
  if (!shell) return;
  const profile = summary.profile || {};
  const needsSetup = !profile.identity_ready;
  if (!needsSetup) {
    shell.hidden = true;
    return;
  }
  shell.hidden = false;
  const nameInput = document.getElementById("setupName");
  const avatarSelect = document.getElementById("setupAvatar");
  const accentSelect = document.getElementById("setupAccent");
  const saveBtn = document.getElementById("setupSaveBtn");
  const status = document.getElementById("setupStatus");
  if (!nameInput || !avatarSelect || !accentSelect || !saveBtn || !status) return;

  avatarSelect.innerHTML = AVATARS.map((row) => `<option value="${row.id}">${row.label}</option>`).join("");
  accentSelect.innerHTML = AVATAR_ACCENTS.map((row) => `<option value="${row.color}">${row.label}</option>`).join("");
  saveBtn.addEventListener("click", () => {
    const cleanName = String(nameInput.value || "").trim();
    if (cleanName.length < 2) {
      status.textContent = "Name must be at least 2 characters.";
      return;
    }
    const avatarId = avatarSelect.value || "spy_hacker";
    const accentColor = accentSelect.value || "#1f8f8f";
    const studentId = summary.student_id || getActiveStudentId();
    upsertStudentProfile(studentId, {
      display_name: cleanName,
      avatar_id: avatarId,
      accent_color: accentColor,
      class_id: summary.class_id || getActiveClassId(),
      identity_ready: true
    });
    setActiveContext(studentId, summary.class_id || getActiveClassId());
    status.textContent = "Agent profile saved.";
    window.location.reload();
  });
}

function renderOverview(summary) {
  const target = document.getElementById("agentCard");
  if (!target) return;
  const profile = summary.profile;
  const avatar = getAvatarById(profile.avatar_id);
  const nextLevelXp = Number(profile.next_level_xp || 200);
  const pctToNext = Math.max(
    0,
    Math.min(100, Math.round(((profile.total_xp % 200) / Math.max(1, nextLevelXp - (nextLevelXp - 200))) * 100))
  );

  target.innerHTML = `
    <span class="agent-avatar">${renderAvatarSvg(avatar, 76, { accentColor: profile.accent_color, rankBadge: profile.level })}</span>
    <div>
      <p class="agent-name">${profile.display_name || "Agent"}</p>
      <p class="agent-rank">${profile.rank} · Level ${profile.level}</p>
      <div class="chip-row">
        <span class="chip">XP ${profile.total_xp}</span>
        <span class="chip">Streak ${profile.streak_days} day${profile.streak_days === 1 ? "" : "s"}</span>
        <span class="chip">Class Rank #${summary.rank_in_class || "--"}</span>
      </div>
      <div class="bar-track" style="margin-top:8px;"><div class="bar-fill" style="width:${pctToNext}%"></div></div>
    </div>
    <div class="agent-metric">
      <strong>${summary.totals.average_accuracy}%</strong>
      <span>Avg Accuracy</span>
    </div>
  `;
}

function renderBattleStrip(summary) {
  const profile = summary.profile || {};
  const streakEl = document.getElementById("dashBattleStreak");
  const xpEl = document.getElementById("dashBattleXp");
  const rankEl = document.getElementById("dashBattleRank");
  if (!streakEl || !xpEl || !rankEl) return;
  streakEl.textContent = String(profile.streak_days || 0);
  xpEl.textContent = String(profile.total_xp || 0);
  rankEl.textContent = summary.rank_in_class ? `#${summary.rank_in_class}` : "#--";
}

function renderCategoryProgress(summary) {
  const target = document.getElementById("categoryProgress");
  if (!target) return;
  target.innerHTML = (summary.mission_categories || [])
    .map(
      (row) => `
      <article class="progress-item">
        <div class="progress-head">
          <span>${row.category[0].toUpperCase() + row.category.slice(1)} Tenses</span>
          <span>${row.progress_pct}%</span>
        </div>
        <div class="bar-track"><div class="bar-fill" style="width:${row.progress_pct}%"></div></div>
      </article>
    `
    )
    .join("");
}

function renderRuleBars(summary) {
  const target = document.getElementById("ruleBars");
  if (!target) return;
  if (!summary.by_rule.length) {
    target.innerHTML = '<div class="empty-note">No rule history yet. Play one mission game to populate this panel.</div>';
    return;
  }
  target.innerHTML = summary.by_rule
    .slice(0, 8)
    .map(
      (row) => `
      <article class="rule-row">
        <div class="rule-row-head"><span>${row.grammar_rule_id}</span><span>${row.accuracy}%</span></div>
        <div class="bar-track"><div class="bar-fill" style="width:${row.accuracy}%"></div></div>
      </article>
    `
    )
    .join("");
}

function renderRecommendations(summary) {
  const target = document.getElementById("recommendList");
  if (!target) return;
  target.innerHTML = (summary.recommendations || [])
    .slice(0, 3)
    .map(
      (rec) => `
      <li class="recommend-card">
        <strong>${rec.label}</strong>
        <p class="panel-sub">${rec.reason}</p>
        <a href="${rec.href}">Open Recommendation</a>
      </li>
    `
    )
    .join("");
}

function renderRecentActivity(summary) {
  const target = document.getElementById("activityList");
  if (!target) return;
  if (!summary.recent_activity.length) {
    target.innerHTML = '<div class="empty-note">No recent activity yet.</div>';
    return;
  }
  target.innerHTML = summary.recent_activity
    .map((row) => {
      const when = new Date(row.created_at).toLocaleString();
      const href = row.play_url || "/missions/";
      return `
      <li class="activity-card">
        <strong>${row.game_id}</strong> · ${row.score} pts · ${row.accuracy}% accuracy
        <p class="panel-sub">${when}</p>
        <a href="${href}">Try again</a>
      </li>
    `;
    })
    .join("");
}

function renderMissionMap() {
  const target = document.getElementById("missionMap");
  if (!target) return;
  const missions = listMissions();
  let unlocked = true;
  target.innerHTML = missions
    .map((mission) => {
      const totalGames = (mission.subskills || []).reduce((sum, skill) => sum + (skill.games || []).length, 0);
      const progress = getMissionProgress(mission.id);
      const completed = Object.keys(progress.completedGames || {}).length;
      let state = "locked";
      if (completed >= totalGames && totalGames > 0) state = "completed";
      else if (completed > 0 || unlocked) state = "in-progress";
      if (state !== "completed") unlocked = false;
      return `
        <article class="mission-card">
          <h3>${mission.title}</h3>
          <p class="panel-sub">${mission.subtitle}</p>
          <span class="status-pill ${state}">${state.replace("-", " ")}</span>
          <div class="panel-sub" style="margin-top:8px">${completed}/${totalGames} games complete</div>
          <a href="/missions/hub.html?mission=${mission.id}" class="btn-soft" style="margin-top:8px;">Open</a>
        </article>
      `;
    })
    .join("");
}

function confettiBurst(container) {
  if (!container) return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  for (let i = 0; i < 16; i += 1) {
    const piece = document.createElement("span");
    piece.className = "boss-confetti";
    piece.style.setProperty("--x", `${(Math.random() - 0.5) * 260}px`);
    piece.style.setProperty("--y", `${120 + Math.random() * 130}px`);
    piece.style.setProperty("--r", `${Math.random() * 360}deg`);
    container.appendChild(piece);
    window.setTimeout(() => piece.remove(), 900);
  }
}

function setupDailyChallenge(summary) {
  const target = document.getElementById("dailyChallengeCard");
  if (!target) return;
  const state = readJson(DAILY_KEY, {});
  const studentId = summary.student_id;
  const key = `${studentId}_${todayStamp()}`;
  const done = Boolean(state[key]);
  const prompt = document.getElementById("dailyChallengePrompt");
  const actions = document.getElementById("dailyChallengeActions");
  if (!prompt || !actions) return;

  if (done) {
    prompt.textContent = "Daily Spy Challenge complete. Come back tomorrow for a new 5-question set.";
    actions.innerHTML = "";
    return;
  }

  prompt.textContent = "Complete a 5-question challenge today to earn +80 XP.";
  actions.innerHTML = '<button class="btn-primary" id="runDailyBtn">Run Daily Challenge</button>';
  const button = document.getElementById("runDailyBtn");
  button.addEventListener("click", () => {
    state[key] = true;
    writeJson(DAILY_KEY, state);
    upsertStudentProfile(studentId);
    import("/student/identity-store.js").then((mod) => {
      mod.awardXp(studentId, 80, { class_id: summary.class_id });
      playSound("missioncomplete");
      window.location.reload();
    });
  });
}

function setupBossMission(summary) {
  const target = document.getElementById("bossMissionCard");
  if (!target) return;
  const statusEl = document.getElementById("bossMissionStatus");
  const actionEl = document.getElementById("bossMissionAction");
  if (!statusEl || !actionEl) return;

  const missions = listMissions();
  const anyUnlocked = missions.some((mission) => {
    const total = (mission.subskills || []).reduce((sum, skill) => sum + (skill.games || []).length, 0);
    const complete = Object.keys(getMissionProgress(mission.id).completedGames || {}).length;
    return total > 0 && complete >= total;
  });
  const state = readJson(BOSS_KEY, {});
  const key = `${summary.student_id}_${todayStamp()}`;

  if (!anyUnlocked) {
    statusEl.textContent = "Boss Mission locked: complete one full mission set first.";
    actionEl.innerHTML = "";
    return;
  }
  if (state[key]) {
    statusEl.textContent = "Boss Mission completed today. Reward claimed.";
    actionEl.innerHTML = "";
    return;
  }

  statusEl.textContent = "Boss Mission unlocked: 20 mixed items, +200 XP bonus.";
  actionEl.innerHTML = '<button class="btn-primary" id="runBossBtn">Complete Boss Mission</button>';
  const button = document.getElementById("runBossBtn");
  button.addEventListener("click", () => {
    state[key] = true;
    writeJson(BOSS_KEY, state);
    import("/student/identity-store.js").then((mod) => {
      const result = mod.awardXp(summary.student_id, 200, { class_id: summary.class_id });
      confettiBurst(target);
      playSound(result.leveledUp ? "levelup" : "missioncomplete");
      window.setTimeout(() => window.location.reload(), 350);
    });
  });
}

function renderLeaderboardPreview(summary) {
  const table = document.getElementById("leaderboardPreview");
  if (!table) return;
  const rows = getLeaderboard(summary.class_id || "DEMO");
  if (!rows.length) {
    table.innerHTML = '<div class="empty-note">No class leaderboard data yet.</div>';
    return;
  }
  table.innerHTML = `
    <table class="leader-table">
      <thead><tr><th>#</th><th>Agent</th><th>XP</th><th>Accuracy</th></tr></thead>
      <tbody>
        ${rows
          .slice(0, 5)
          .map((row) => {
            const avatar = getAvatarById(row.avatar_id);
            return `<tr><td>${row.rank}</td><td><span class="table-avatar">${renderAvatarSvg(avatar, 34, { accentColor: row.accent_color, rankBadge: row.rank })}</span> ${
              row.student_name
            }</td><td>${row.xp}</td><td>${row.average_accuracy}%</td></tr>`;
          })
          .join("")}
      </tbody>
    </table>
  `;
}

function init() {
  const params = new URLSearchParams(window.location.search);
  const studentId = String(params.get("student_id") || "").trim() || getActiveStudentId();
  const classId = String(params.get("class_id") || "").trim().toUpperCase() || getActiveClassId();
  setActiveContext(studentId, classId);

  applyDailyLoginBonus(studentId);
  const summary = getStudentSummary(studentId);
  renderAgentSetup(summary);
  renderOverview(summary);
  renderBattleStrip(summary);
  renderCategoryProgress(summary);
  renderRuleBars(summary);
  renderRecommendations(summary);
  renderRecentActivity(summary);
  renderMissionMap();
  renderLeaderboardPreview(summary);
  setupDailyChallenge(summary);
  setupBossMission(summary);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
