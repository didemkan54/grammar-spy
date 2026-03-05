import { getLeaderboard } from "/core/progressStore.js";
import { getActiveClassId } from "/student/identity-store.js";
import { getAvatarById, renderAvatarSvg } from "/student/data/avatars.js";

function init() {
  const params = new URLSearchParams(window.location.search);
  const classId = String(params.get("class_id") || "").trim().toUpperCase() || getActiveClassId();
  const label = document.getElementById("leaderboardClassLabel");
  const tableWrap = document.getElementById("leaderboardTable");
  if (!tableWrap || !label) return;
  label.textContent = classId;

  const rows = getLeaderboard(classId);
  if (!rows.length) {
    tableWrap.innerHTML = '<div class="empty-note">No leaderboard data yet. Join a class and play a game first.</div>';
    return;
  }

  tableWrap.innerHTML = `
    <table class="leader-table">
      <thead>
        <tr><th>Rank</th><th>Agent</th><th>XP</th><th>Accuracy</th><th>Streak</th><th>Level</th></tr>
      </thead>
      <tbody>
        ${rows
          .map((row) => {
            const avatar = getAvatarById(row.avatar_id);
            return `
              <tr>
                <td>#${row.rank}</td>
                <td><span class="table-avatar">${renderAvatarSvg(avatar, 36)}</span> ${row.student_name}</td>
                <td>${row.xp}</td>
                <td>${row.average_accuracy}%</td>
                <td>${row.streak_days}</td>
                <td>${row.level}</td>
              </tr>
            `;
          })
          .join("")}
      </tbody>
    </table>
  `;
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
