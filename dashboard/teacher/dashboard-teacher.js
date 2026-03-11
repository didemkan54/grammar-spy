import { getClassSummary, getLeaderboard } from "/core/progressStore.js";
import { getActiveClassId, setActiveContext } from "/student/identity-store.js";
import { getAvatarById, renderAvatarSvg } from "/student/data/avatars.js";
import {
  assignQuizToClass,
  assignToClass,
  ensureDashboardClassroom,
  generateQuiz,
  generateWorksheet,
  getClassAssignments,
  getClassProgress,
  rotateClassJoinCode,
  saveQuiz,
  saveWorksheet
} from "/core/product-system.js";

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

function renderOverview(summary, classProgress) {
  const wrap = document.getElementById("classOverview");
  if (!wrap) return;
  const progress = classProgress || { assignmentCount: 0, averageCompletion: 0 };
  wrap.innerHTML = `
    <div class="chip-row">
      <span class="chip">Class ${summary.class_id}</span>
      <span class="chip">Games Played ${summary.totals.games_played}</span>
      <span class="chip">Active Students ${summary.totals.active_students}</span>
      <span class="chip">Avg Accuracy ${summary.totals.average_accuracy}%</span>
      <span class="chip">Avg Time ${summary.totals.average_time_spent_seconds}s</span>
      <span class="chip">Assignments ${progress.assignmentCount}</span>
      <span class="chip">Avg Completion ${progress.averageCompletion}%</span>
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

function renderStudentTable(summary, classProgress) {
  const tableWrap = document.getElementById("studentTableWrap");
  if (!tableWrap) return;
  const progressRows = (classProgress?.students || []).map((row) => ({
    student_id: row.id,
    student_name: row.name,
    avatar_id: "spy_hacker",
    accent_color: "#1f8f8f",
    progress_pct: row.completionPercent,
    accuracy_pct: row.accuracy,
    weakest_rule: "n/a",
    streak_days: row.streak,
    xp: row.xpEarned,
    violations: row.tabLeaveCount || 0
  }));
  const summaryRows = [...(summary.students || [])].map((row) => ({ ...row, violations: 0 }));
  const summaryIdSet = new Set(summaryRows.map((row) => row.student_id));
  const rows = [...summaryRows, ...progressRows.filter((row) => !summaryIdSet.has(row.student_id))];
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
            <td>${row.violations || 0}</td>
            <td><a href="/dashboard/teacher/student?student_id=${encodeURIComponent(
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
          <th><button class="btn-soft" data-sort="violations">Violations</button></th>
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

function setupClassTools(classroom) {
  const codeField = document.getElementById("classJoinCode");
  const generateBtn = document.getElementById("generateCodeBtn");
  const copyBtn = document.getElementById("copyCodeBtn");
  const status = document.getElementById("classToolStatus");
  const leaderboardToggle = document.getElementById("leaderboardToggle");
  if (!codeField || !generateBtn || !copyBtn || !status || !leaderboardToggle) return;
  codeField.value = classroom.joinCode;

  generateBtn.addEventListener("click", () => {
    const updated = rotateClassJoinCode(classroom.id, { role: "teacher" });
    codeField.value = updated.joinCode;
    status.textContent = "New join code generated.";
  });

  copyBtn.addEventListener("click", () => {
    copyText(codeField.value).then(() => {
      status.textContent = "Join code copied.";
    });
  });

  leaderboardToggle.href = `/leaderboard/?class_id=${encodeURIComponent(classroom.joinCode)}`;
}

function renderAssignmentList(classroomId) {
  const target = document.getElementById("classAssignmentsList");
  if (!target) return;
  const rows = getClassAssignments(classroomId);
  if (!rows.length) {
    target.innerHTML = '<div class="empty-note">No assignments yet. Create one below.</div>';
    return;
  }
  target.innerHTML = rows
    .slice(0, 8)
    .map(
      (row) => `
      <li class="suggestion-card">
        <strong>${row.title}</strong>
        <p class="panel-sub">${row.type} · ${row.targetId || "n/a"} · ${new Date(row.assignedAt).toLocaleString()}</p>
      </li>
    `
    )
    .join("");
}

function setupAssignmentTools(classroom, classCode) {
  const typeEl = document.getElementById("assignmentType");
  const targetEl = document.getElementById("assignmentTarget");
  const titleEl = document.getElementById("assignmentTitle");
  const dueAtEl = document.getElementById("assignmentDueAt");
  const assignBtn = document.getElementById("assignContentBtn");
  const quizTopicEl = document.getElementById("quizTopic");
  const quizDifficultyEl = document.getElementById("quizDifficulty");
  const quizCountEl = document.getElementById("quizCount");
  const quizBtn = document.getElementById("generateQuizAssignBtn");
  const worksheetBtn = document.getElementById("generateWorksheetAssignBtn");
  const statusEl = document.getElementById("assignmentStatus");
  if (!statusEl) return;

  function refresh() {
    renderAssignmentList(classroom.id);
  }

  if (assignBtn && typeEl && targetEl && titleEl) {
    assignBtn.addEventListener("click", () => {
      const type = typeEl.value || "mission";
      const targetId = String(targetEl.value || "").trim();
      if (!targetId) {
        statusEl.textContent = "Target ID is required.";
        return;
      }
      assignToClass(
        {
          classId: classroom.id,
          type,
          targetId,
          title: String(titleEl.value || "").trim() || `${type} assignment`,
          dueAt: dueAtEl?.value || ""
        },
        { role: "teacher" }
      );
      statusEl.textContent = `Assigned ${type} (${targetId}) to class ${classCode}.`;
      refresh();
    });
  }

  if (quizBtn && quizTopicEl && quizDifficultyEl && quizCountEl) {
    quizBtn.addEventListener("click", async () => {
      quizBtn.disabled = true;
      try {
        const quiz = await generateQuiz(
          {
            topic: quizTopicEl.value || "past tense",
            difficulty: quizDifficultyEl.value || "intermediate",
            count: Number(quizCountEl.value || 10),
            types: ["multiple_choice", "error_correction", "fill_blank"]
          },
          { role: "teacher" }
        );
        const saved = saveQuiz(quiz, { role: "teacher" });
        assignQuizToClass(
          {
            classId: classroom.id,
            quizId: saved.id,
            title: saved.title,
            dueAt: dueAtEl?.value || ""
          },
          { role: "teacher" }
        );
        statusEl.textContent = `Generated + assigned quiz "${saved.title}" (${saved.questions.length} questions).`;
        refresh();
      } catch (err) {
        statusEl.textContent = err?.message || "Could not generate quiz.";
      } finally {
        quizBtn.disabled = false;
      }
    });
  }

  if (worksheetBtn && quizTopicEl && quizDifficultyEl && quizCountEl) {
    worksheetBtn.addEventListener("click", async () => {
      worksheetBtn.disabled = true;
      try {
        const worksheet = await generateWorksheet(
          {
            topic: quizTopicEl.value || "present tense",
            difficulty: quizDifficultyEl.value || "intermediate",
            count: Number(quizCountEl.value || 8),
            type: "practice_worksheet"
          },
          { role: "teacher" }
        );
        const saved = saveWorksheet(worksheet, { role: "teacher" });
        assignToClass(
          {
            classId: classroom.id,
            type: "worksheet",
            targetId: saved.id,
            title: saved.title,
            dueAt: dueAtEl?.value || ""
          },
          { role: "teacher" }
        );
        statusEl.textContent = `Generated + assigned worksheet "${saved.title}".`;
        refresh();
      } catch (err) {
        statusEl.textContent = err?.message || "Could not generate worksheet.";
      } finally {
        worksheetBtn.disabled = false;
      }
    });
  }

  refresh();
}

function init() {
  const params = new URLSearchParams(window.location.search);
  const classCode = String(params.get("class_id") || "").trim().toUpperCase() || getActiveClassId();
  const classroom = ensureDashboardClassroom(classCode, { role: "teacher" });
  setActiveContext("", classroom.joinCode);
  const summary = getClassSummary(classroom.joinCode);
  const classProgress = getClassProgress(classroom.id);
  renderBattleStrip(summary);
  renderOverview(summary, classProgress);
  renderSuggestions(summary);
  renderStudentTable(summary, classProgress);
  renderLeaderboard(summary);
  setupClassTools(classroom);
  setupAssignmentTools(classroom, classroom.joinCode);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
