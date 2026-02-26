export const ROUTES = [
  { id: "home", label: "Home", href: "/index.html" },
  { id: "missions", label: "Mission Library", href: "/missions.html" },
  { id: "progression", label: "Training Path", href: "/progression.html" },
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

  const navLinks = [
    { label: "Home", href: "index.html" },
    { label: "Missions", href: "packs.html" },
    { label: "Mission Library", href: "missions.html" },
    { label: "Training Path", href: "progression.html" },
    { label: "Profile", href: "profile.html" },
    { label: "Blog", href: "insights.html" },
    { label: "Pricing", href: "pricing.html" }
  ];

  const linkStyle = "text-decoration:none;color:#4a5568;font:700 13px Inter,Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase";
  const links = navLinks.map(l => `<a href="${l.href}" style="${linkStyle}">${l.label}</a>`).join("");

  const langBtns = ["EN", "ES", "FR"].map(lang =>
    `<button type="button" aria-label="${lang}" data-lang="${lang.toLowerCase()}" class="gs-lang-btn" style="border:0;background:transparent;color:#4a5568;font:700 11px Inter,Arial,sans-serif;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;padding:4px 6px;border-radius:4px">${lang}</button>`
  ).join("");

  targetEl.innerHTML = `
    <nav aria-label="Primary navigation" style="margin:0 0 16px;padding:12px 40px 14px;display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap;border-bottom:1px solid #d9dee6;background:#ffffff">
      <a href="index.html" style="text-decoration:none;color:#16223a;display:inline-flex;align-items:center;background:transparent">
        <img src="assets/brand/logo-primary.svg" alt="Grammar Spy™" style="height:88px;width:auto;display:block;background:transparent;border:none">
      </a>
      <span style="display:flex;gap:18px;align-items:center;flex-wrap:wrap">
        ${links}
        <span id="gsLangSwitcher" style="display:inline-flex;gap:4px;align-items:center;margin-left:8px;padding-left:12px;border-left:1px solid #d9dee6">
          ${langBtns}
        </span>
      </span>
      <span id="gsAuthButtons" style="display:inline-flex;gap:6px">
        <a href="auth.html?mode=create" style="text-decoration:none;border:1px solid #194f53;border-radius:999px;padding:6px 12px;font:700 13px Inter,Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#fff;background:#1f5f63">Create account</a>
        <a href="auth.html?mode=signin" style="text-decoration:none;color:#4a5568;font:700 13px Inter,Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;border:1px solid #d9dee6;border-radius:999px;padding:6px 12px">Sign In</a>
      </span>
    </nav>
  `;

  try {
    const session = JSON.parse(localStorage.getItem('gs_auth_session'));
    if (session && session.name) {
      const authEl = targetEl.querySelector('#gsAuthButtons');
      if (authEl) {
        const name = session.name.length > 15 ? session.name.slice(0, 15) + '…' : session.name;
        authEl.innerHTML = `
          <a href="profile.html" style="text-decoration:none;border:1px solid #194f53;border-radius:999px;padding:6px 12px;font:700 13px Inter,Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#fff;background:#1f5f63">${name}</a>
          <a href="#" onclick="localStorage.removeItem('gs_auth_session');localStorage.removeItem('gs_account_v1');location.reload();return false;" style="text-decoration:none;color:#4a5568;font:700 13px Inter,Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;border:1px solid #d9dee6;border-radius:999px;padding:6px 12px">Sign Out</a>
        `;
      }
    }
  } catch(e) {}
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
