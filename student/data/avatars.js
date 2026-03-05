export const AVATARS = [
  { id: "rookie", label: "Rookie", tone: "#8ccfd6", accent: "#1f5f63" },
  { id: "field_agent", label: "Field Agent", tone: "#9ddbe1", accent: "#0f4b59" },
  { id: "analyst", label: "Analyst", tone: "#b8e6ea", accent: "#245a76" },
  { id: "tracker", label: "Tracker", tone: "#a8d7cb", accent: "#1f6a5f" },
  { id: "cipher", label: "Cipher", tone: "#aed4e8", accent: "#215d8b" },
  { id: "shadow", label: "Shadow", tone: "#97c4d8", accent: "#34485f" },
  { id: "sentinel", label: "Sentinel", tone: "#b8dfc7", accent: "#37684c" },
  { id: "radar", label: "Radar", tone: "#d3e8f1", accent: "#21617c" },
  { id: "scout", label: "Scout", tone: "#d7f0e3", accent: "#26735b" },
  { id: "signal", label: "Signal", tone: "#c7dff2", accent: "#2d5d94" },
  { id: "vanguard", label: "Vanguard", tone: "#d2ecef", accent: "#1f5f63" },
  { id: "stealth", label: "Stealth", tone: "#c4d6e3", accent: "#40536b" }
];

export function getAvatarById(id) {
  return AVATARS.find((avatar) => avatar.id === id) || AVATARS[0];
}

export function renderAvatarSvg(avatar, size = 52) {
  const safe = avatar || AVATARS[0];
  const eyeY = Math.round(size * 0.42);
  const eyeDX = Math.round(size * 0.13);
  const centerX = Math.round(size / 2);
  const faceY = Math.round(size * 0.46);
  const faceR = Math.round(size * 0.2);
  const shoulderY = Math.round(size * 0.73);

  return `
<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="bg-${safe.id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${safe.tone}" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.85" />
    </linearGradient>
  </defs>
  <circle cx="${centerX}" cy="${centerX}" r="${Math.round(size * 0.47)}" fill="url(#bg-${safe.id})" />
  <ellipse cx="${centerX}" cy="${Math.round(size * 0.3)}" rx="${Math.round(size * 0.18)}" ry="${Math.round(size * 0.08)}" fill="${safe.accent}" opacity="0.95" />
  <circle cx="${centerX}" cy="${faceY}" r="${faceR}" fill="#f7f9fb" />
  <rect x="${Math.round(size * 0.27)}" y="${Math.round(size * 0.38)}" width="${Math.round(size * 0.46)}" height="${Math.round(size * 0.1)}" rx="${Math.round(size * 0.04)}" fill="${safe.accent}" />
  <circle cx="${centerX - eyeDX}" cy="${eyeY}" r="${Math.max(2, Math.round(size * 0.03))}" fill="#0b1020" />
  <circle cx="${centerX + eyeDX}" cy="${eyeY}" r="${Math.max(2, Math.round(size * 0.03))}" fill="#0b1020" />
  <path d="M ${Math.round(size * 0.42)} ${Math.round(size * 0.56)} Q ${centerX} ${Math.round(size * 0.6)} ${Math.round(size * 0.58)} ${Math.round(size * 0.56)}" stroke="#3f495a" stroke-width="1.5" fill="none" />
  <ellipse cx="${centerX}" cy="${shoulderY}" rx="${Math.round(size * 0.24)}" ry="${Math.round(size * 0.1)}" fill="${safe.accent}" opacity="0.7" />
</svg>
`.trim();
}
