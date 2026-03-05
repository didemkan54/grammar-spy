import { getRecommendations, getStudentAttempts, getStudentSummary } from "/core/progressStore.js";
import { getAvatarById, renderAvatarSvg } from "/student/data/avatars.js";

function renderHeader(summary) {
  const target = document.getElementById("studentHeader");
  if (!target) return;
  const profile = summary.profile || {};
  const avatar = getAvatarById(profile.avatar_id || "spy_hacker");
  target.innerHTML = `
    <div class="agent-card">
      <span class="agent-avatar">${renderAvatarSvg(avatar, 76, { accentColor: profile.accent_color, rankBadge: profile.level })}</span>
      <div>
        <p class="agent-name">${profile.display_name || summary.student_id}</p>
        <p class="agent-rank">${profile.rank} · Level ${profile.level} · Streak ${profile.streak_days} days</p>
      </div>
      <div class="agent-metric">
        <strong>${summary.totals.average_accuracy}%</strong>
        <span>Avg Accuracy</span>
      </div>
    </div>
  `;
}

function renderRuleBars(summary) {
  const target = document.getElementById("detailRuleBars");
  if (!target) return;
  if (!summary.by_rule.length) {
    target.innerHTML = '<div class="empty-note">No rule attempts yet.</div>';
    return;
  }
  target.innerHTML = summary.by_rule
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

function renderAttempts(studentId) {
  const target = document.getElementById("attemptTimeline");
  if (!target) return;
  const rows = getStudentAttempts(studentId);
  if (!rows.length) {
    target.innerHTML = '<div class="empty-note">No attempts recorded yet.</div>';
    return;
  }
  target.innerHTML = rows
    .slice(0, 20)
    .map((row) => {
      const when = new Date(row.created_at).toLocaleString();
      return `
      <li class="activity-card">
        <strong>${row.game_id}</strong> · ${row.accuracy}% · ${row.score} pts
        <p class="panel-sub">${row.grammar_rule_id} · ${when} · ${row.time_spent_seconds}s</p>
      </li>
    `;
    })
    .join("");
}

function renderRecommendations(studentId) {
  const target = document.getElementById("detailRecommendations");
  if (!target) return;
  const rows = getRecommendations(studentId);
  target.innerHTML = rows
    .map(
      (row) => `
      <li class="recommend-card">
        <strong>${row.label}</strong>
        <p class="panel-sub">${row.reason}</p>
        <a href="${row.href}">Assign</a>
      </li>
    `
    )
    .join("");
}

function init() {
  const params = new URLSearchParams(window.location.search);
  const studentId = String(params.get("student_id") || "").trim();
  if (!studentId) return;
  const summary = getStudentSummary(studentId);
  renderHeader(summary);
  renderRuleBars(summary);
  renderAttempts(studentId);
  renderRecommendations(studentId);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
