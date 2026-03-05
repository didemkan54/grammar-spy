import { getClassSummary, getLeaderboard } from "/core/progressStore.js";
import { getActiveClassId, setActiveContext } from "/student/identity-store.js";
import { getAvatarById, renderAvatarSvg } from "/student/data/avatars.js";

const CLASS_CODE_KEY = "gs_teacher_class_codes_v1";

function readCodes() {
  try {
    return JSON.parse(localStorage.getItem(CLASS_CODE_KEY) || "{}");
  } catch (_err) {
    return {};
  }
}

function writeCodes(next) {
  localStorage.setItem(CLASS_CODE_KEY, JSON.stringify(next || {}));
}

function randomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

function copyText(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  const input = document.createElement("textarea");
  input.value = text;
  input.style.position = "absolute";
  input.style.left = "-9999px";
  document.body.appendChild(input);
  input.select();
  document.execCommand("copy");
  document.body.removeChild(input);
  return Promise.resolve();
}

function renderOverview(summary) {
  const wrap = document.getElementById("classOverview");
  if (!wrap) return;
  wrap.innerHTML = `
    <div class="chip-row">
      <span class="chip">Class ${summary.class_id}</span>
      <span class="chip">Games Played ${summary.totals.games_played}</span>
      <span class="chip">Active Students ${summary.totals.active_students}</span>
      <span class="chip">Avg Accuracy ${summary.totals.average_accuracy}%</span>
      <span class="chip">Avg Time ${summary.totals.average_time_spent_seconds}s</span>
    </div>
    <div class="progress-group" style="margin-top:10px;">
      ${(summary.by_category || [])
        .map(
          (row) => `
          <article class="progress-item">
            <div class="progress-head">
              <span>${row.category[0].toUpperCase() + row.category.slice(1)}</span>
              <span>${row.accuracy}%</span>
            </div>
            <div class="bar-track"><div class="bar-fill" style="width:${row.accuracy}%"></div></div>
          </article>
        `
        )
        .join("")}
    </div>
  `;
}

function renderBattleStrip(summary) {
  const activeEl = document.getElementById("teacherBattleActive");
  const gamesEl = document.getElementById("teacherBattleGames");
  const accEl = document.getElementById("teacherBattleAccuracy");
  if (!activeEl || !gamesEl || !accEl) return;
  activeEl.textContent = String(summary?.totals?.active_students || 0);
  gamesEl.textContent = String(summary?.totals?.games_played || 0);
  accEl.textContent = `${summary?.totals?.average_accuracy || 0}%`;
}

function renderSuggestions(summary) {
  const target = document.getElementById("teachingSuggestions");
  if (!target) return;
  const weak = summary.weak_rules || [];
  if (!weak.length) {
    target.innerHTML = '<div class="empty-note">No weak-rule signals yet. Once students play, suggestions appear here.</div>';
    return;
  }
  target.innerHTML = weak
    .slice(0, 3)
    .map(
      (row, idx) => `
      <li class="suggestion-card">
        <strong>Teach this next #${idx + 1}: ${row.grammar_rule_id}</strong>
        <p class="panel-sub">Class average on this rule: ${row.accuracy}%.</p>
        <a href="/missions/">Open mission links</a>
      </li>
    `
    )
    .join("");
}

function renderLeaderboard(summary) {
  const target = document.getElementById("leaderboardMini");
  if (!target) return;
  const rows = getLeaderboard(summary.class_id);
  if (!rows.length) {
    target.innerHTML = '<div class="empty-note">No leaderboard data yet.</div>';
    return;
  }
  target.innerHTML = `
    <table class="leader-table">
      <thead><tr><th>#</th><th>Student</th><th>XP</th><th>Acc.</th></tr></thead>
      <tbody>
        ${rows
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

function renderStudentTable(summary) {
  const tableWrap = document.getElementById("studentTableWrap");
  if (!tableWrap) return;
  const rows = [...(summary.students || [])];
  if (!rows.length) {
    tableWrap.innerHTML = '<div class="empty-note">No student attempts yet for this class.</div>';
    return;
  }

  let sortBy = "xp";
  let sortDir = "desc";
  function sortRows(list) {
    return [...list].sort((a, b) => {
      const left = a[sortBy];
      const right = b[sortBy];
      if (typeof left === "number" && typeof right === "number") {
        return sortDir === "asc" ? left - right : right - left;
      }
      return sortDir === "asc"
        ? String(left).localeCompare(String(right))
        : String(right).localeCompare(String(left));
    });
  }

  function renderBody() {
    const body = tableWrap.querySelector("tbody");
    if (!body) return;
    body.innerHTML = sortRows(rows)
      .map((row) => {
        const avatar = getAvatarById(row.avatar_id);
        return `
          <tr>
            <td><span class="table-avatar">${renderAvatarSvg(avatar, 34, { accentColor: row.accent_color, rankBadge: row.xp > 0 ? "XP" : "A" })}</span> ${row.student_name}</td>
            <td>${row.progress_pct}%</td>
            <td>${row.accuracy_pct}%</td>
            <td>${row.weakest_rule}</td>
            <td>${row.streak_days}</td>
            <td>${row.xp}</td>
            <td><a href="/dashboard/teacher/student.html?student_id=${encodeURIComponent(
              row.student_id
            )}&class_id=${encodeURIComponent(summary.class_id)}">View</a></td>
          </tr>
        `;
      })
      .join("");
  }

  tableWrap.innerHTML = `
    <table class="leader-table">
      <thead>
        <tr>
          <th><button class="btn-soft" data-sort="student_name">Student</button></th>
          <th><button class="btn-soft" data-sort="progress_pct">Progress %</button></th>
          <th><button class="btn-soft" data-sort="accuracy_pct">Accuracy %</button></th>
          <th><button class="btn-soft" data-sort="weakest_rule">Weakest Rule</button></th>
          <th><button class="btn-soft" data-sort="streak_days">Streak</button></th>
          <th><button class="btn-soft" data-sort="xp">XP</button></th>
          <th>Detail</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
  `;
  renderBody();

  tableWrap.querySelectorAll("[data-sort]").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.getAttribute("data-sort");
      if (sortBy === key) sortDir = sortDir === "asc" ? "desc" : "asc";
      else {
        sortBy = key;
        sortDir = key === "student_name" ? "asc" : "desc";
      }
      renderBody();
    });
  });
}

function setupClassTools(classId) {
  const codeField = document.getElementById("classJoinCode");
  const generateBtn = document.getElementById("generateCodeBtn");
  const copyBtn = document.getElementById("copyCodeBtn");
  const status = document.getElementById("classToolStatus");
  const leaderboardToggle = document.getElementById("leaderboardToggle");
  if (!codeField || !generateBtn || !copyBtn || !status || !leaderboardToggle) return;

  const store = readCodes();
  if (!store[classId]) {
    store[classId] = randomCode();
    writeCodes(store);
  }
  codeField.value = store[classId];

  generateBtn.addEventListener("click", () => {
    const next = randomCode();
    const copy = readCodes();
    copy[classId] = next;
    writeCodes(copy);
    codeField.value = next;
    status.textContent = "New join code generated.";
  });

  copyBtn.addEventListener("click", () => {
    copyText(codeField.value).then(() => {
      status.textContent = "Join code copied.";
    });
  });

  leaderboardToggle.href = `/leaderboard/?class_id=${encodeURIComponent(classId)}`;
}

function init() {
  const params = new URLSearchParams(window.location.search);
  const classId = String(params.get("class_id") || "").trim().toUpperCase() || getActiveClassId();
  setActiveContext("", classId);
  const summary = getClassSummary(classId);
  renderBattleStrip(summary);
  renderOverview(summary);
  renderSuggestions(summary);
  renderStudentTable(summary);
  renderLeaderboard(summary);
  setupClassTools(classId);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
