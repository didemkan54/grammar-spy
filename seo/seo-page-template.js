import { SEO_PAGE_DATA, SEO_PAGE_SEEDS } from "/seo/seo-page-data.js";

function esc(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function slugToLabel(slug) {
  return String(slug || "")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function defaultActivities(keyword) {
  const base = keyword || "grammar practice";
  return [
    {
      icon: "🕵️",
      title: `${slugToLabel(base)} Detective`,
      description: "Students identify the exact grammar error and explain how to repair the sentence.",
      tip: "Ask for evidence language before revealing answers."
    },
    {
      icon: "🛠️",
      title: "Sentence Repair Drill",
      description: "Teams revise flawed lines and compare the strongest correction choices.",
      tip: "Keep one grammar target per round for clarity."
    },
    {
      icon: "⏱️",
      title: "Timed Error Hunt",
      description: "Short countdown rounds keep students focused on rapid error recognition.",
      tip: "Debrief missed items to turn speed into learning."
    },
    {
      icon: "🧪",
      title: "Transformation Task",
      description: "Students transform sentence structures while preserving meaning and grammar accuracy.",
      tip: "Use speaking checks to reinforce form."
    },
    {
      icon: "🛰️",
      title: "Grammar Spy Mission Extension",
      description: "Move from paper practice into interactive mission rounds with instant feedback.",
      tip: "Use mission summaries to plan your next lesson."
    }
  ];
}

function createSeedPage(seedKey) {
  const seed = SEO_PAGE_SEEDS[seedKey];
  if (!seed) return null;
  return {
    slug: seedKey,
    title: seed.title,
    metaDescription: `Teacher-ready ${seed.keyword} with classroom activities, quick practice ideas, and interactive Grammar Spy mission extensions.`,
    h1: seed.h1,
    intro: [
      `Looking for ${seed.keyword} that are classroom-ready and engaging? This page template gives you a fast way to publish SEO-focused teaching resources while keeping the Grammar Spy brand and mission-first approach.`,
      "Each generated page includes practical activities, implementation tips, and an interactive mission CTA so teachers can move from discovery to classroom use quickly."
    ],
    activities: defaultActivities(seed.keyword),
    grammarTips: [
      {
        title: "Template tip",
        body: "Replace the introduction copy with your local classroom context and standards language."
      },
      {
        title: "SEO tip",
        body: "Use your target keyword naturally in the title, H1, intro, and one activity heading."
      }
    ],
    teacherNote: {
      title: "Teacher Note",
      body: "Publish with one clear grammar target and one clear mission CTA for best conversion."
    },
    missionCta: {
      title: "Launch matching Grammar Spy missions",
      body: "Turn teacher search traffic into active classroom practice with one click.",
      label: "Start a Mission",
      href: "/missions/"
    }
  };
}

function ActivityList(items) {
  return `
    <div class="seo-grid">
      ${(items || []).map((item) => `
        <article class="seo-activity-card">
          <div class="seo-activity-head">
            <span class="seo-activity-icon" aria-hidden="true">${esc(item.icon || "🧭")}</span>
            <h3>${esc(item.title)}</h3>
          </div>
          <p>${esc(item.description)}</p>
          ${item.tip ? `<p class="seo-activity-tip">Classroom move: ${esc(item.tip)}</p>` : ""}
        </article>
      `).join("")}
    </div>
  `;
}

function GrammarTipCard(tip) {
  return `
    <article class="seo-tip-card">
      <h3>${esc(tip.title)}</h3>
      <p>${esc(tip.body)}</p>
    </article>
  `;
}

function TeacherNote(note) {
  if (!note) return "";
  return `
    <aside class="seo-note" aria-label="Teacher note">
      <h3>${esc(note.title || "Teacher Note")}</h3>
      <p>${esc(note.body || "")}</p>
    </aside>
  `;
}

function MissionCTA(cta) {
  if (!cta) return "";
  return `
    <section class="seo-mission-cta" aria-label="Grammar Spy mission call to action">
      <h3>${esc(cta.title || "Try Grammar Spy Missions")}</h3>
      <p>${esc(cta.body || "")}</p>
      <p style="margin:12px 0 0">
        <a class="seo-btn seo-btn-primary" href="${esc(cta.href || "/missions/")}">${esc(cta.label || "Start a Mission")}</a>
      </p>
    </section>
  `;
}

function DownloadList(items) {
  if (!Array.isArray(items) || !items.length) return "";
  return `
    <section class="seo-section" aria-label="Downloadable grammar resources">
      <h2>Downloadable Resources</h2>
      <div class="seo-download-list">
        ${items.map((item) => `
          <article class="seo-download-card">
            <h3>${esc(item.title)}</h3>
            <p>${esc(item.description)}</p>
            <p style="margin-top:6px">
              <a class="seo-btn seo-btn-ghost" href="${esc(item.href)}" download>${esc(item.label || "Download")}</a>
            </p>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function ScreenshotPlaceholders(items) {
  if (!Array.isArray(items) || !items.length) return "";
  return `
    <section class="seo-section" aria-label="Interactive grammar screenshots">
      <h2>Classroom View Snapshots</h2>
      <p class="seo-section-intro">Screenshot placeholders you can replace with live platform captures.</p>
      <div class="seo-gallery">
        ${items.map((label) => `
          <div class="seo-placeholder">
            <span aria-hidden="true" style="font-size:26px;line-height:1">🗂️</span>
            <span>${esc(label)}</span>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function updateSeoMeta(page) {
  if (page.title) document.title = page.title;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc && page.metaDescription) metaDesc.setAttribute("content", page.metaDescription);
}

function renderSeoPage(slug, options = {}) {
  const page = SEO_PAGE_DATA[slug] || createSeedPage(slug);
  const mountEl = options.mountEl || document.getElementById("seoPageMount");
  if (!page || !mountEl) return;
  updateSeoMeta(page);

  mountEl.innerHTML = `
    <main class="seo-main">
      <section class="seo-hero">
        <p class="seo-eyebrow">Teacher Resource Intel</p>
        <h1>${esc(page.h1)}</h1>
        <p class="seo-breadcrumb"><a href="/index.html">Grammar Spy Home</a> / ${esc(page.slug)}</p>
      </section>

      <section class="seo-section">
        <h2>${esc(page.h1)}</h2>
        ${(page.intro || []).map((paragraph) => `<p class="seo-section-intro">${esc(paragraph)}</p>`).join("")}
      </section>

      <section class="seo-section" aria-label="Grammar activity list">
        <h2>Classroom Activity Ideas</h2>
        ${ActivityList(page.activities || [])}
      </section>

      ${DownloadList(page.downloads)}
      ${ScreenshotPlaceholders(page.screenshots)}

      <section class="seo-section seo-components" aria-label="Teacher implementation notes">
        ${(page.grammarTips || []).map(GrammarTipCard).join("")}
        ${TeacherNote(page.teacherNote)}
        ${MissionCTA(page.missionCta)}
      </section>

      <section class="seo-final-link">
        <h2>Ready to make grammar practice more engaging?</h2>
        <p>Bring your class into mission-based grammar practice with fast setup and clear progress feedback.</p>
        <p style="margin:12px 0 0">
          <a class="seo-btn seo-btn-primary" href="/index.html">Launch Grammar Spy</a>
        </p>
      </section>
    </main>
  `;
}

function initSeoPage() {
  const slug = document.body.getAttribute("data-seo-page");
  if (!slug) return;
  renderSeoPage(slug);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSeoPage);
} else {
  initSeoPage();
}

window.GSSeoTemplate = {
  ActivityList,
  GrammarTipCard,
  MissionCTA,
  TeacherNote,
  renderSeoPage
};
