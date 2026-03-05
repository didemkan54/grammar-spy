function soundApi() {
  return window.GSSound || null;
}

function ensureStyles() {
  if (document.getElementById("gsSoundToggleStyles")) return;
  const style = document.createElement("style");
  style.id = "gsSoundToggleStyles";
  style.textContent =
    ".gs-sound-toggle{border:1px solid #d9dee6;border-radius:999px;background:#f8fafc;color:#2a4f69;font:700 16px Inter,Segoe UI,Arial,sans-serif;line-height:1;padding:7px 10px;cursor:pointer;min-width:40px;min-height:34px;display:inline-flex;align-items:center;justify-content:center;transition:all .2s ease}" +
    ".gs-sound-toggle:hover{transform:translateY(-1px);border-color:rgba(31,95,99,.4);background:#ecf5f6}" +
    ".gs-sound-toggle:focus-visible{outline:3px solid rgba(31,95,99,.3);outline-offset:2px}";
  document.head.appendChild(style);
}

function getIcon(enabled) {
  return enabled ? "🔊" : "🔇";
}

function getLabel(enabled) {
  return enabled ? "Sound on" : "Sound off";
}

export function mountSoundToggle(container) {
  const api = soundApi();
  if (!container || !api) return null;
  if (container.querySelector(".gs-sound-toggle")) return null;
  ensureStyles();

  const button = document.createElement("button");
  button.type = "button";
  button.className = "gs-sound-toggle";
  button.setAttribute("aria-live", "polite");

  function syncState() {
    const enabled = api.isEnabled();
    button.setAttribute("aria-pressed", String(enabled));
    button.setAttribute("aria-label", getLabel(enabled));
    button.textContent = getIcon(enabled);
  }

  button.addEventListener("click", () => {
    const enabled = api.toggle();
    syncState();
    if (enabled) api.play("click");
  });

  button.addEventListener("mouseenter", () => {
    if (api.isEnabled()) api.play("hover");
  });

  window.addEventListener(api.onStateChangeEvent, syncState);
  syncState();
  container.appendChild(button);
  return button;
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
