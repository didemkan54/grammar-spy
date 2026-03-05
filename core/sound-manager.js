(function () {
  var STORAGE_KEY = "gs_sound_enabled_v1";
  var UNLOCK_KEY = "gs_sound_unlocked_v1";
  var DEBUG_KEY = "gs_debug_sound_v1";
  var SOUND_EVENT = "gs:sound-change";
  var MIN_GAP_MS = 90;
  var POOL_SIZE = 4;
  var MASTER_VOLUME = 0.34;
  var audioContext = null;
  var audioUnlocked = false;
  var listenersBound = false;
  var handlers = null;
  var lastPlayedAt = {};
  var poolCache = {};
  var poolIndex = {};
  var lastSound = "none";
  var soundEnabled = true;
  var reducedMotionQuery = null;
  var debugPanelEl = null;

  var SOUND_PATHS = {
    correct: "/assets/sounds/correct.mp3",
    wrong: "/assets/sounds/wrong.mp3",
    levelup: "/assets/sounds/levelup.mp3",
    missioncomplete: "/assets/sounds/missioncomplete.mp3",
    click: "/assets/sounds/correct.mp3",
    hover: "/assets/sounds/correct.mp3",
    confirm: "/assets/sounds/correct.mp3",
    victory: "/assets/sounds/missioncomplete.mp3"
  };

  function canUseStorage() {
    try {
      var probe = "__gs_sound_probe__";
      localStorage.setItem(probe, "1");
      localStorage.removeItem(probe);
      return true;
    } catch (_err) {
      return false;
    }
  }

  function readEnabled() {
    if (!canUseStorage()) return true;
    var raw = localStorage.getItem(STORAGE_KEY);
    if (raw == null) return true;
    return raw !== "0";
  }

  function readUnlocked() {
    if (!canUseStorage()) return false;
    return localStorage.getItem(UNLOCK_KEY) === "1";
  }

  function writeEnabled(enabled) {
    if (!canUseStorage()) return;
    localStorage.setItem(STORAGE_KEY, enabled ? "1" : "0");
  }

  function writeUnlocked(unlocked) {
    if (!canUseStorage()) return;
    localStorage.setItem(UNLOCK_KEY, unlocked ? "1" : "0");
  }

  function isReducedMotion() {
    if (!reducedMotionQuery && typeof window.matchMedia === "function") {
      reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    }
    return Boolean(reducedMotionQuery && reducedMotionQuery.matches);
  }

  function getAudioContext() {
    if (audioContext) return audioContext;
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioContext = new Ctx();
    return audioContext;
  }

  function emitSoundChange() {
    try {
      window.dispatchEvent(
        new CustomEvent(SOUND_EVENT, {
          detail: {
            enabled: soundEnabled,
            unlocked: audioUnlocked,
            lastSound: lastSound
          }
        })
      );
    } catch (_err) {}
  }

  function maybeWarnLoadError(name, err) {
    if (window && window.console && typeof console.warn === "function") {
      console.warn("[sound-manager] failed to load", name, SOUND_PATHS[name], err || "");
    }
  }

  function createAudioPool(name) {
    var src = SOUND_PATHS[name];
    if (!src) return [];
    if (poolCache[name]) return poolCache[name];

    var pool = [];
    for (var i = 0; i < POOL_SIZE; i += 1) {
      try {
        var audio = new Audio(src);
        audio.preload = "auto";
        audio.volume = 0.28;
        audio.addEventListener("error", function (evt) {
          maybeWarnLoadError(name, evt && evt.message ? evt.message : "");
        });
        pool.push(audio);
      } catch (err) {
        maybeWarnLoadError(name, err && err.message ? err.message : String(err));
      }
    }
    poolCache[name] = pool;
    poolIndex[name] = 0;
    return pool;
  }

  function nowMs() {
    return Date.now();
  }

  function canPlayNow(name) {
    var last = Number(lastPlayedAt[name] || 0);
    var now = nowMs();
    if (now - last < MIN_GAP_MS) return false;
    lastPlayedAt[name] = now;
    return true;
  }

  function primeAudioContext() {
    var ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") {
      ctx.resume().catch(function () {});
    }
    try {
      var buffer = ctx.createBuffer(1, 1, 22050);
      var source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
    } catch (_err) {}
  }

  function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;
    writeUnlocked(true);
    primeAudioContext();
    Object.keys(SOUND_PATHS).forEach(function (name) {
      createAudioPool(name);
    });
    emitSoundChange();
    renderDebugPanel();
  }

  function removeUnlockListeners() {
    if (!handlers) return;
    window.removeEventListener("click", handlers, true);
    window.removeEventListener("touchstart", handlers, true);
    window.removeEventListener("keydown", handlers, true);
    handlers = null;
    listenersBound = false;
  }

  function initSound() {
    if (listenersBound) return;
    handlers = function () {
      unlockAudio();
      removeUnlockListeners();
    };
    window.addEventListener("click", handlers, true);
    window.addEventListener("touchstart", handlers, true);
    window.addEventListener("keydown", handlers, true);
    listenersBound = true;
  }

  function pickFromPool(name) {
    var pool = createAudioPool(name);
    if (!pool.length) return null;
    var index = Number(poolIndex[name] || 0) % pool.length;
    poolIndex[name] = index + 1;
    return pool[index];
  }

  function playSynthTone(ctx, frequency, startAt, duration, gainAmount) {
    if (!ctx) return;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(frequency, startAt);
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, gainAmount), startAt + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startAt);
    osc.stop(startAt + duration + 0.02);
  }

  function playFallbackSynth(name) {
    var ctx = getAudioContext();
    if (!ctx) return false;
    var base = ctx.currentTime + 0.01;
    if (name === "correct") {
      playSynthTone(ctx, 820, base, 0.1, 0.07);
      playSynthTone(ctx, 1120, base + 0.08, 0.11, 0.06);
      lastSound = name;
      renderDebugPanel();
      return true;
    }
    if (name === "wrong") {
      playSynthTone(ctx, 320, base, 0.12, 0.07);
      playSynthTone(ctx, 230, base + 0.09, 0.12, 0.06);
      lastSound = name;
      renderDebugPanel();
      return true;
    }
    if (name === "levelup") {
      playSynthTone(ctx, 540, base, 0.1, 0.08);
      playSynthTone(ctx, 740, base + 0.08, 0.12, 0.07);
      playSynthTone(ctx, 980, base + 0.16, 0.14, 0.07);
      lastSound = name;
      renderDebugPanel();
      return true;
    }
    if (name === "missioncomplete") {
      playSynthTone(ctx, 520, base, 0.12, 0.08);
      playSynthTone(ctx, 680, base + 0.1, 0.14, 0.07);
      playSynthTone(ctx, 840, base + 0.2, 0.16, 0.07);
      playSynthTone(ctx, 1040, base + 0.3, 0.18, 0.06);
      lastSound = name;
      renderDebugPanel();
      return true;
    }
    playSynthTone(ctx, 600, base, 0.08, 0.05);
    lastSound = name;
    renderDebugPanel();
    return true;
  }

  function play(name) {
    var safeName = String(name || "").toLowerCase().trim();
    if (!SOUND_PATHS[safeName]) return false;
    if (!soundEnabled) return false;
    if (isReducedMotion() && safeName === "hover") return false;
    if (!audioUnlocked) return false;
    if (!canPlayNow(safeName)) return false;

    var player = pickFromPool(safeName);
    if (!player) return playFallbackSynth(safeName);
    try {
      player.playbackRate = 1 + (Math.random() * 0.03 - 0.015);
      player.volume = MASTER_VOLUME;
      player.currentTime = 0;
      var maybePromise = player.play();
      if (maybePromise && typeof maybePromise.catch === "function") {
        maybePromise.catch(function (err) {
          maybeWarnLoadError(safeName, err && err.message ? err.message : "");
          playFallbackSynth(safeName);
        });
      }
      lastSound = safeName;
      renderDebugPanel();
      return true;
    } catch (err) {
      maybeWarnLoadError(safeName, err && err.message ? err.message : "");
      return playFallbackSynth(safeName);
    }
  }

  function setEnabled(next) {
    soundEnabled = Boolean(next);
    writeEnabled(soundEnabled);
    emitSoundChange();
    renderDebugPanel();
    return soundEnabled;
  }

  function toggleEnabled() {
    return setEnabled(!soundEnabled);
  }

  function shouldShowDebug() {
    if (!canUseStorage()) return /[?&]debug_sound=1/.test(window.location.search || "");
    return (
      /[?&]debug_sound=1/.test(window.location.search || "") ||
      localStorage.getItem(DEBUG_KEY) === "1"
    );
  }

  function ensureDebugPanel() {
    if (!shouldShowDebug()) return null;
    if (debugPanelEl) return debugPanelEl;
    var panel = document.createElement("aside");
    panel.id = "gsSoundDebugPanel";
    panel.style.cssText =
      "position:fixed;right:12px;bottom:12px;z-index:250;background:#0f2237;color:#e8f1fb;border:1px solid rgba(255,255,255,.18);border-radius:12px;padding:10px;min-width:220px;font:600 12px Inter,Segoe UI,Arial,sans-serif;box-shadow:0 12px 24px rgba(11,16,32,.24);";
    panel.innerHTML =
      '<div style="font:800 11px Inter,Segoe UI,Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#a4c3df;">Sound Debug</div>' +
      '<div id="gsSoundDebugState" style="margin-top:6px;line-height:1.45;"></div>' +
      '<button id="gsSoundDebugTest" type="button" style="margin-top:8px;border:1px solid rgba(255,255,255,.25);background:#1f5f63;color:#fff;border-radius:8px;padding:6px 10px;cursor:pointer;font:700 11px Inter,Segoe UI,Arial,sans-serif;letter-spacing:.05em;text-transform:uppercase;">Test Sound</button>';
    document.body.appendChild(panel);
    var testButton = panel.querySelector("#gsSoundDebugTest");
    if (testButton) {
      testButton.addEventListener("click", function () {
        if (!audioUnlocked) unlockAudio();
        play("correct");
      });
    }
    debugPanelEl = panel;
    return panel;
  }

  function renderDebugPanel() {
    var panel = ensureDebugPanel();
    if (!panel) return;
    var stateEl = panel.querySelector("#gsSoundDebugState");
    if (!stateEl) return;
    stateEl.innerHTML =
      "enabled: <strong>" +
      soundEnabled +
      "</strong><br>unlocked: <strong>" +
      audioUnlocked +
      "</strong><br>last: <strong>" +
      lastSound +
      "</strong>";
  }

  soundEnabled = readEnabled();
  audioUnlocked = false;
  initSound();
  if (readUnlocked()) {
    renderDebugPanel();
  }

  var api = {
    initSound: initSound,
    setEnabled: setEnabled,
    toggleEnabled: toggleEnabled,
    play: play,
    isEnabled: function () {
      return soundEnabled;
    },
    isUnlocked: function () {
      return audioUnlocked;
    },
    onStateChangeEvent: SOUND_EVENT,
    // Legacy compatibility aliases
    toggle: toggleEnabled,
    correct: function () {
      return play("correct");
    },
    wrong: function () {
      return play("wrong");
    },
    missionComplete: function () {
      return play("missioncomplete");
    },
    clickTone: function () {
      return play("click");
    },
    levelup: function () {
      return play("levelup");
    },
    streak: function () {
      return play("levelup");
    },
    combo: function () {
      return play("levelup");
    },
    debugState: function () {
      return {
        soundEnabled: soundEnabled,
        audioUnlocked: audioUnlocked,
        lastSound: lastSound
      };
    }
  };

  window.GSSound = api;
  window.GSSoundManager = api;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderDebugPanel, { once: true });
  } else {
    renderDebugPanel();
  }
})();
