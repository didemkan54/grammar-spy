export const ROUTES = [
  { id: "home", label: "Home", href: "/index.html" },
  { id: "missions", label: "Missions", href: "/packs.html" },
  { id: "missionLaunch", label: "Mission Launch", href: "/missions.html" },
  { id: "progression", label: "Training Path", href: "/progression.html" },
  { id: "clues", label: "CLUES", href: "/clues.html" },
  { id: "profile", label: "Profile", href: "/profile.html" },
  { id: "launch", label: "Launch", href: "/games/launch.html" }
];

export function resolveRouteIdFromPath(pathname = window.location.pathname) {
  const page = pathname.split("/").filter(Boolean).pop() || "index.html";
  const route = ROUTES.find((r) => r.href.endsWith(page));
  return route ? route.id : "home";
}

export function renderTopNav(targetEl, activeRouteId = resolveRouteIdFromPath()) {
  if (!targetEl) return;

  const currentPage = (window.location.pathname.split("/").filter(Boolean).pop() || "index.html").toLowerCase();
  const navLinkStyle = "text-decoration:none;font:700 13px Inter,Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase";
  const dropdownLinkStyle = "display:block;padding:8px 10px;border-radius:8px;text-decoration:none;color:#24303f;font:700 12px Inter,Arial,sans-serif;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap";
  const menuSummaryStyle = "cursor:pointer;border:1px solid #d9dee6;border-radius:999px;padding:6px 12px;background:#fff;color:#4a5568;font:700 12px Inter,Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;display:inline-flex;align-items:center;gap:6px";
  const menuPanelStyle = "position:absolute;right:0;top:calc(100% + 8px);display:block;min-width:180px;background:#fff;border:1px solid #d9dee6;border-radius:12px;padding:8px;box-shadow:0 10px 26px rgba(11,16,32,.14);z-index:30";

  const primaryLinks = [
    { label: "Home", href: "index.html" }
  ];
  const missionMenuLinks = [
    { label: "Missions", href: "packs.html" },
    { label: "Training Path", href: "progression.html" },
    { label: "CLUES", href: "clues.html" }
  ];
  const moreLinks = [
    { label: "Teacher", href: "teacher-home.html" },
    { label: "Community", href: "community.html" },
    { label: "Profile", href: "profile.html" },
    { label: "Blog", href: "insights.html" },
    { label: "Pricing", href: "pricing.html" }
  ];

  const buildPrimaryLink = (link) => {
    const isActive = currentPage === link.href.toLowerCase();
    const color = isActive ? "#0f5c5c" : "#4a5568";
    return `<a href="${link.href}" style="${navLinkStyle};color:${color}">${link.label}</a>`;
  };
  const missionMenuIsActive = missionMenuLinks.some((l) => currentPage === l.href.toLowerCase());
  const missionMenuSummaryStyle = `${menuSummaryStyle};color:${missionMenuIsActive ? "#0f5c5c" : "#4a5568"};border-color:${missionMenuIsActive ? "#1f5f63" : "#d9dee6"}`;
  const missionMenuLinksHtml = missionMenuLinks.map((l) => {
    const isActive = currentPage === l.href.toLowerCase();
    const activeStyle = isActive ? "background:#e8f4f5;color:#0f5c5c;" : "";
    return `<a href="${l.href}" style="${dropdownLinkStyle};${activeStyle}">${l.label}</a>`;
  }).join("");
  const primaryLinksHtml = primaryLinks.map(buildPrimaryLink).join("") +
    `<details style="position:relative"><summary style="${missionMenuSummaryStyle}">Missions &#9662;</summary><span style="${menuPanelStyle}">${missionMenuLinksHtml}</span></details>`;
  const moreLinksHtml = moreLinks.map((l) => `<a href="${l.href}" style="${dropdownLinkStyle}">${l.label}</a>`).join("");

  const langSelect = `<select id="gsLangSelect" aria-label="Language" onchange="if(window.GS_I18N)GS_I18N.setLang(this.value)" style="border:1px solid #d9dee6;border-radius:8px;padding:6px 10px;font:700 12px Inter,Arial,sans-serif;color:#4a5568;background:#fff;cursor:pointer;text-transform:uppercase;letter-spacing:.04em">` +
    `<option value="en">\u{1F1FA}\u{1F1F8} English</option><option value="es">\u{1F1EA}\u{1F1F8} Español</option><option value="fr">\u{1F1EB}\u{1F1F7} Français</option>` +
    `<option value="am">\u{1F1EA}\u{1F1F9} አማርኛ</option><option value="tr">\u{1F1F9}\u{1F1F7} Türkçe</option><option value="ar">\u{1F1F8}\u{1F1E6} العربية</option>` +
    `<option value="hi">\u{1F1EE}\u{1F1F3} हिन्दी</option><option value="ur">\u{1F1F5}\u{1F1F0} اردو</option><option value="ps">\u{1F1E6}\u{1F1EB} پښتو</option>` +
    `<option value="vi">\u{1F1FB}\u{1F1F3} Tiếng Việt</option><option value="zh">\u{1F1E8}\u{1F1F3} 中文</option><option value="ko">\u{1F1F0}\u{1F1F7} 한국어</option>` +
    `<option value="so">\u{1F1F8}\u{1F1F4} Soomaali</option><option value="ti">\u{1F1EA}\u{1F1F7} ትግርኛ</option><option value="pt">\u{1F1E7}\u{1F1F7} Português</option>` +
    `</select>`;

  targetEl.innerHTML = `
    <nav aria-label="Primary navigation" style="margin:0 0 16px;padding:12px 40px 14px;display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;border-bottom:1px solid #d9dee6;background:#ffffff">
      <a href="index.html" style="text-decoration:none;color:#16223a;display:inline-flex;align-items:center;background:transparent">
        <img src="assets/brand/logo-primary.svg" alt="Grammar Spy™" style="height:88px;width:auto;display:block;background:transparent;border:none">
      </a>
      <span style="display:flex;flex:1 1 420px;gap:16px;align-items:center;flex-wrap:wrap;justify-content:center">
        ${primaryLinksHtml}
      </span>
      <span style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-left:auto">
        <details style="position:relative">
          <summary style="${menuSummaryStyle}">More &#9662;</summary>
          <span style="${menuPanelStyle}">
            ${moreLinksHtml}
          </span>
        </details>
        <span id="gsLangSwitcher" style="display:inline-flex;align-items:center">
          ${langSelect}
        </span>
        <details id="gsAccountMenu" style="position:relative">
          <summary id="gsAccountLabel" style="${menuSummaryStyle}">Account &#9662;</summary>
          <span id="gsAccountPanel" style="${menuPanelStyle}">
            <a href="auth.html?mode=signin" style="${dropdownLinkStyle}">Sign In</a>
            <a href="auth.html?mode=create" style="${dropdownLinkStyle}">Create account</a>
          </span>
        </details>
      </span>
    </nav>
  `;

  try {
    const session = JSON.parse(localStorage.getItem('gs_auth_session'));
    const authLabel = targetEl.querySelector('#gsAccountLabel');
    const authPanel = targetEl.querySelector('#gsAccountPanel');
    if (authLabel && authPanel && session && session.name) {
      let safeName = session.name;
      if (/[!@#$%^&*(){}[\]|\\<>\/~`+=]/.test(safeName) || safeName.length > 40) safeName = 'My Account';
      const name = safeName.length > 14 ? safeName.slice(0, 14) + '…' : safeName;
      authLabel.textContent = `${name} ▼`;
      authPanel.innerHTML = `
        <a href="profile.html" style="${dropdownLinkStyle}">Profile</a>
        <a href="#" style="${dropdownLinkStyle}" onclick="localStorage.removeItem('gs_auth_session');localStorage.removeItem('gs_account_v1');localStorage.removeItem('gs_student_classroom');localStorage.removeItem('gs_use_context_v3');localStorage.removeItem('gs_active_student_v1');localStorage.removeItem('gs_credentials');location.href='index.html';return false;">Sign Out</a>
      `;
    }
  } catch(e) {}

  try {
    const ctx = localStorage.getItem('gs_use_context_v3');
    const studentClassroom = localStorage.getItem('gs_student_classroom');
    const isStudent = ctx === 'individual' || studentClassroom;
    if (isStudent) {
      targetEl.querySelectorAll('a').forEach((a) => {
        const href = (a.getAttribute('href') || '').toLowerCase();
        if (href.includes('teacher-home') || href.includes('teacher-mode')) a.style.display = 'none';
      });
    }
  } catch (e) {}
}

export function applyReducedMotion(enabled) {
  document.body.classList.toggle("gs-reduced-motion", Boolean(enabled));
}

export function readQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const out = {};
  params.forEach((value, key) => {
    out[key] = value;
  });
  return out;
}
