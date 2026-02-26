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
    { label: "Teacher", href: "teacher-home.html" },
    { label: "Mission Library", href: "missions.html" },
    { label: "Training Path", href: "progression.html" },
    { label: "Profile", href: "profile.html" },
    { label: "Blog", href: "insights.html" },
    { label: "Pricing", href: "pricing.html" }
  ];

  const linkStyle = "text-decoration:none;color:#4a5568;font:700 13px Inter,Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase";
  const links = navLinks.map(l => `<a href="${l.href}" style="${linkStyle}">${l.label}</a>`).join("");

  const langSelect = `<select id="gsLangSelect" aria-label="Language" onchange="if(window.GS_I18N)GS_I18N.setLang(this.value)" style="border:1px solid #d9dee6;border-radius:8px;padding:6px 10px;font:700 12px Inter,Arial,sans-serif;color:#4a5568;background:#fff;cursor:pointer;text-transform:uppercase;letter-spacing:.04em">` +
    `<option value="en">\u{1F1FA}\u{1F1F8} English</option><option value="es">\u{1F1EA}\u{1F1F8} Español</option><option value="fr">\u{1F1EB}\u{1F1F7} Français</option>` +
    `<option value="am">\u{1F1EA}\u{1F1F9} አማርኛ</option><option value="tr">\u{1F1F9}\u{1F1F7} Türkçe</option><option value="ar">\u{1F1F8}\u{1F1E6} العربية</option>` +
    `<option value="hi">\u{1F1EE}\u{1F1F3} हिन्दी</option><option value="ur">\u{1F1F5}\u{1F1F0} اردو</option><option value="ps">\u{1F1E6}\u{1F1EB} پښتو</option>` +
    `<option value="vi">\u{1F1FB}\u{1F1F3} Tiếng Việt</option><option value="zh">\u{1F1E8}\u{1F1F3} 中文</option><option value="ko">\u{1F1F0}\u{1F1F7} 한국어</option>` +
    `<option value="so">\u{1F1F8}\u{1F1F4} Soomaali</option><option value="ti">\u{1F1EA}\u{1F1F7} ትግርኛ</option><option value="pt">\u{1F1E7}\u{1F1F7} Português</option>` +
    `</select>`;

  targetEl.innerHTML = `
    <nav aria-label="Primary navigation" style="margin:0 0 16px;padding:12px 40px 14px;display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap;border-bottom:1px solid #d9dee6;background:#ffffff">
      <a href="index.html" style="text-decoration:none;color:#16223a;display:inline-flex;align-items:center;background:transparent">
        <img src="assets/brand/logo-primary.svg" alt="Grammar Spy™" style="height:88px;width:auto;display:block;background:transparent;border:none">
      </a>
      <span style="display:flex;gap:18px;align-items:center;flex-wrap:wrap">
        ${links}
        <span id="gsLangSwitcher" style="display:inline-flex;align-items:center;margin-left:8px;padding-left:12px;border-left:1px solid #d9dee6">
          ${langSelect}
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
        let safeName = session.name;
        if (/[!@#$%^&*(){}[\]|\\<>\/~`+=]/.test(safeName) || safeName.length > 40) safeName = 'My Account';
        const name = safeName.length > 15 ? safeName.slice(0, 15) + '…' : safeName;
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
