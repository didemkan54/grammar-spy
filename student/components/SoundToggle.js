function soundApi() {
  return window.GSSound || null;
}

function ensureStyles() {
  if (document.getElementById("gsSoundToggleStyles")) return;
  const style = document.createElement("style");
  style.id = "gsSoundToggleStyles";
  style.textContent =
    ".gs-sound-wrap{position:relative;display:inline-flex;align-items:center}" +
    ".gs-sound-toggle{border:1px solid #d9dee6;border-radius:999px;background:#f8fafc;color:#2a4f69;font:700 12px Inter,Segoe UI,Arial,sans-serif;line-height:1;padding:7px 11px;cursor:pointer;min-height:36px;display:inline-flex;align-items:center;justify-content:center;gap:6px;transition:all .2s ease;white-space:nowrap}" +
    ".gs-sound-toggle:hover{transform:translateY(-1px);border-color:rgba(31,95,99,.4);background:#ecf5f6}" +
    ".gs-sound-toggle:focus-visible{outline:3px solid rgba(31,95,99,.3);outline-offset:2px}" +
    ".gs-sound-icon{font-size:15px}" +
    ".gs-sound-state{font-weight:700;letter-spacing:.04em;text-transform:uppercase}" +
    ".gs-sound-tooltip{position:absolute;right:0;top:calc(100% + 6px);border:1px solid #d8e2ec;background:#fff;color:#27445f;border-radius:8px;padding:6px 8px;font:600 11px Inter,Segoe UI,Arial,sans-serif;box-shadow:0 8px 18px rgba(11,16,32,.12);opacity:0;transform:translateY(-2px);pointer-events:none;transition:opacity .18s ease,transform .18s ease;white-space:nowrap}" +
    ".gs-sound-tooltip.is-visible{opacity:1;transform:translateY(0)}" +
    ".gs-sound-actions{display:inline-flex;gap:6px;margin-left:6px}" +
    ".gs-sound-test-btn{border:1px solid #d9dee6;border-radius:999px;background:#fff;color:#2a4f69;font:700 11px Inter,Segoe UI,Arial,sans-serif;letter-spacing:.04em;text-transform:uppercase;padding:6px 9px;min-height:34px;cursor:pointer}" +
    ".gs-sound-test-btn:hover{background:#f4f9fc}" +
    "@media (max-width:680px){.gs-sound-state{display:none}.gs-sound-test-btn{display:none}.gs-sound-toggle{padding:7px 9px}}";
  document.head.appendChild(style);
}

function getIcon(enabled) {
  return enabled ? "🔊" : "🔇";
}

function getLabel(enabled) {
  return enabled ? "Sound: On" : "Sound: Off";
}

export function mountSoundToggle(container) {
  const api = soundApi();
  if (!container || !api) return null;
  if (container.querySelector(".gs-sound-wrap")) return null;
  ensureStyles();

  const wrap = document.createElement("span");
  wrap.className = "gs-sound-wrap";

  const button = document.createElement("button");
  button.type = "button";
  button.className = "gs-sound-toggle";
  button.setAttribute("aria-live", "polite");
  button.setAttribute("title", "Toggle sound");

  const tooltip = document.createElement("span");
  tooltip.className = "gs-sound-tooltip";
  tooltip.textContent = "Sound is off";

  const testButton = document.createElement("button");
  testButton.type = "button";
  testButton.className = "gs-sound-test-btn";
  testButton.textContent = "Test Sound";
  testButton.setAttribute("aria-label", "Test sound effect");

  function syncState() {
    const enabled = api.isEnabled();
    const label = getLabel(enabled);
    button.setAttribute("aria-pressed", String(enabled));
    button.setAttribute("aria-label", label);
    button.innerHTML = `<span class="gs-sound-icon">${getIcon(enabled)}</span><span class="gs-sound-state">${label}</span>`;
    tooltip.classList.toggle("is-visible", !enabled);
    testButton.disabled = !enabled;
  }

  button.addEventListener("click", () => {
    if (typeof api.initSound === "function") api.initSound();
    const enabled =
      typeof api.toggleEnabled === "function" ? api.toggleEnabled() : api.toggle ? api.toggle() : !api.isEnabled();
    syncState();
    if (enabled) api.play("correct");
  });

  button.addEventListener("mouseenter", () => {
    if (api.isEnabled()) api.play("hover");
  });

  testButton.addEventListener("click", () => {
    if (typeof api.initSound === "function") api.initSound();
    api.play("correct");
  });

  window.addEventListener(api.onStateChangeEvent, syncState);
  syncState();
  wrap.appendChild(button);
  wrap.appendChild(tooltip);
  const actionWrap = document.createElement("span");
  actionWrap.className = "gs-sound-actions";
  actionWrap.appendChild(testButton);
  wrap.appendChild(actionWrap);
  container.appendChild(wrap);
  return wrap;
}

export function mountGlobalSoundToggle() {
  const explicitSlots = document.querySelectorAll("[data-sound-toggle-slot]");
  if (explicitSlots.length) {
    explicitSlots.forEach((slot) => mountSoundToggle(slot));
    return;
  }

  const homeNavInner = document.querySelector(".home-nav .nav-inner");
  if (homeNavInner) {
    mountSoundToggle(homeNavInner);
    return;
  }

  const primaryNav = document.querySelector('nav[aria-label="Primary navigation"]');
  if (primaryNav) {
    mountSoundToggle(primaryNav);
  }
}
