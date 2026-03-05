export const AVATAR_ACCENTS = [
  { id: "teal", label: "Teal", color: "#1f8f8f" },
  { id: "gold", label: "Gold", color: "#c79a2f" },
  { id: "blue", label: "Blue", color: "#2f69c7" },
  { id: "purple", label: "Purple", color: "#7b43c7" }
];

export const AVATAR_PACKS = [
  {
    id: "spy_roles",
    label: "Spy Roles",
    subtitle: "Field-ready specialists",
    glow: "#1f8f8f"
  },
  {
    id: "agency_badges",
    label: "Agency Badges",
    subtitle: "Elite credential emblems",
    glow: "#2f69c7"
  },
  {
    id: "cyber_masks",
    label: "Cyber Masks",
    subtitle: "Stealth + signal tech",
    glow: "#7b43c7"
  },
  {
    id: "animal_agents",
    label: "Animal Agents",
    subtitle: "Instinct-driven operatives",
    glow: "#c79a2f"
  }
];

export const AVATARS = [
  { id: "spy_hacker", label: "Hacker", pack: "Spy Roles", pack_id: "spy_roles", tier: "epic", asset: "/assets/avatars/spy_hacker.svg" },
  { id: "spy_analyst", label: "Analyst", pack: "Spy Roles", pack_id: "spy_roles", tier: "rare", asset: "/assets/avatars/spy_analyst.svg" },
  { id: "spy_scout", label: "Scout", pack: "Spy Roles", pack_id: "spy_roles", tier: "rare", asset: "/assets/avatars/spy_scout.svg" },
  { id: "spy_forensics", label: "Forensics", pack: "Spy Roles", pack_id: "spy_roles", tier: "legend", asset: "/assets/avatars/spy_forensics.svg" },
  { id: "spy_interrogator", label: "Interrogator", pack: "Spy Roles", pack_id: "spy_roles", tier: "epic", asset: "/assets/avatars/spy_interrogator.svg" },
  { id: "spy_strategist", label: "Strategist", pack: "Spy Roles", pack_id: "spy_roles", tier: "rare", asset: "/assets/avatars/spy_strategist.svg" },

  { id: "badge_orbit", label: "Orbit Badge", pack: "Agency Badges", pack_id: "agency_badges", tier: "rare", asset: "/assets/avatars/badge_orbit.svg" },
  { id: "badge_vector", label: "Vector Badge", pack: "Agency Badges", pack_id: "agency_badges", tier: "epic", asset: "/assets/avatars/badge_vector.svg" },
  { id: "badge_guard", label: "Guard Badge", pack: "Agency Badges", pack_id: "agency_badges", tier: "rare", asset: "/assets/avatars/badge_guard.svg" },
  { id: "badge_cipher", label: "Cipher Badge", pack: "Agency Badges", pack_id: "agency_badges", tier: "legend", asset: "/assets/avatars/badge_cipher.svg" },
  { id: "badge_signal", label: "Signal Badge", pack: "Agency Badges", pack_id: "agency_badges", tier: "epic", asset: "/assets/avatars/badge_signal.svg" },
  { id: "badge_command", label: "Command Badge", pack: "Agency Badges", pack_id: "agency_badges", tier: "legend", asset: "/assets/avatars/badge_command.svg" },

  { id: "cyber_mask_neon", label: "Neon Mask", pack: "Cyber Masks", pack_id: "cyber_masks", tier: "epic", asset: "/assets/avatars/cyber_mask_neon.svg" },
  { id: "cyber_mask_stealth", label: "Stealth Mask", pack: "Cyber Masks", pack_id: "cyber_masks", tier: "rare", asset: "/assets/avatars/cyber_mask_stealth.svg" },
  { id: "cyber_mask_echo", label: "Echo Mask", pack: "Cyber Masks", pack_id: "cyber_masks", tier: "rare", asset: "/assets/avatars/cyber_mask_echo.svg" },
  { id: "cyber_mask_flux", label: "Flux Mask", pack: "Cyber Masks", pack_id: "cyber_masks", tier: "epic", asset: "/assets/avatars/cyber_mask_flux.svg" },
  { id: "cyber_mask_omega", label: "Omega Mask", pack: "Cyber Masks", pack_id: "cyber_masks", tier: "legend", asset: "/assets/avatars/cyber_mask_omega.svg" },
  { id: "cyber_mask_zenith", label: "Zenith Mask", pack: "Cyber Masks", pack_id: "cyber_masks", tier: "legend", asset: "/assets/avatars/cyber_mask_zenith.svg" },

  { id: "animal_raven", label: "Raven Agent", pack: "Animal Agents", pack_id: "animal_agents", tier: "epic", asset: "/assets/avatars/animal_raven.svg" },
  { id: "animal_fox", label: "Fox Agent", pack: "Animal Agents", pack_id: "animal_agents", tier: "legend", asset: "/assets/avatars/animal_fox.svg" },
  { id: "animal_wolf", label: "Wolf Agent", pack: "Animal Agents", pack_id: "animal_agents", tier: "rare", asset: "/assets/avatars/animal_wolf.svg" },
  { id: "animal_owl", label: "Owl Agent", pack: "Animal Agents", pack_id: "animal_agents", tier: "rare", asset: "/assets/avatars/animal_owl.svg" },
  { id: "animal_panther", label: "Panther Agent", pack: "Animal Agents", pack_id: "animal_agents", tier: "legend", asset: "/assets/avatars/animal_panther.svg" },
  { id: "animal_cobra", label: "Cobra Agent", pack: "Animal Agents", pack_id: "animal_agents", tier: "epic", asset: "/assets/avatars/animal_cobra.svg" }
];

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function getAvatarById(id) {
  return AVATARS.find((avatar) => avatar.id === id) || AVATARS[0];
}

export function getAccentById(id) {
  return AVATAR_ACCENTS.find((row) => row.id === id) || AVATAR_ACCENTS[0];
}

export function renderAvatarSvg(avatar, size = 52, options = {}) {
  const safe = avatar || AVATARS[0];
  const accent = options.accentColor || getAccentById(options.accentId || "teal").color;
  const rankBadge = String(options.rankBadge || "R").trim().slice(0, 2).toUpperCase();
  const tier = String(safe.tier || "rare").toLowerCase();
  return `
    <span class="gs-avatar-frame gs-avatar-tier-${escapeHtml(tier)}" style="--avatar-size:${Math.max(24, Number(size) || 52)}px;--avatar-accent:${escapeHtml(accent)};">
      <span class="gs-avatar-glow" aria-hidden="true"></span>
      <span class="gs-avatar-ring" aria-hidden="true"></span>
      <img class="gs-avatar-img" src="${escapeHtml(safe.asset)}" alt="" loading="lazy" decoding="async" />
      <span class="gs-avatar-rank" aria-hidden="true">${escapeHtml(rankBadge)}</span>
    </span>
  `;
}
