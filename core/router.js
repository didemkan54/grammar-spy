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
  targetEl.classList.add("gs-topbar");
  const links = ROUTES.map((route) => {
    const current = route.id === activeRouteId ? ' aria-current="page"' : "";
    return `<a class="gs-nav-link" href="${route.href}"${current}>${route.label}</a>`;
  }).join("");

  targetEl.innerHTML = `
    <a class="gs-brand" href="/index.html">
      <span class="gs-brand-badge">GS</span>
      <span class="gs-brand-label">Grammar Spy™</span>
    </a>
    <nav class="gs-nav" aria-label="Primary navigation">
      ${links}
    </nav>
  `;
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
