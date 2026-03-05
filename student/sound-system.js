(function () {
  var SOUND_KEY = "gs_sound_enabled_v1";
  var SOUND_STATE_EVENT = "gs:sound-change";
  var SOUND_UNLOCK_KEY = "gs_sound_unlocked_v1";
  var audioCtx = null;
  var reducedMotionQuery = null;
  var unlocked = false;
  var soundCache = {};
  var SOUND_FILES = {
    correct: "/assets/sfx/correct.mp3",
    wrong: "/assets/sfx/wrong.mp3",
    missioncomplete: "/assets/sfx/missioncomplete.mp3",
    levelup: "/assets/sfx/levelup.mp3"
  };

  function canUseStorage() {
    try {
      var key = "__gs_sound_probe__";
      localStorage.setItem(key, "1");
      localStorage.removeItem(key);
      return true;
    } catch (_err) {
      return false;
    }
  }

  function readEnabled() {
    if (!canUseStorage()) return true;
    var raw = localStorage.getItem(SOUND_KEY);
    if (raw == null) return true;
    return raw !== "0";
  }

  function readUnlockState() {
    if (!canUseStorage()) return false;
    return localStorage.getItem(SOUND_UNLOCK_KEY) === "1";
  }

  function writeEnabled(enabled) {
    if (!canUseStorage()) return;
    localStorage.setItem(SOUND_KEY, enabled ? "1" : "0");
  }

  function writeUnlockState(enabled) {
    if (!canUseStorage()) return;
    localStorage.setItem(SOUND_UNLOCK_KEY, enabled ? "1" : "0");
  }

  function isReducedMotion() {
    if (!reducedMotionQuery && typeof window.matchMedia === "function") {
      reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    }
    return Boolean(reducedMotionQuery && reducedMotionQuery.matches);
  }

  function ensureAudioContext() {
    if (audioCtx) return audioCtx;
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
    return audioCtx;
  }

  function now() {
    var ctx = ensureAudioContext();
    return ctx ? ctx.currentTime : 0;
  }

  function playTone(frequency, duration, volume, offset) {
    var ctx = ensureAudioContext();
    if (!ctx) return;

    var osc = ctx.createOscillator();
    var gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, now() + (offset || 0));
    gain.gain.setValueAtTime(0.0001, now() + (offset || 0));
    gain.gain.exponentialRampToValueAtTime(volume, now() + (offset || 0) + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now() + (offset || 0) + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now() + (offset || 0));
    osc.stop(now() + (offset || 0) + duration + 0.02);
  }

  function preloadSound(type) {
    var src = SOUND_FILES[type];
    if (!src) return null;
    if (soundCache[type]) return soundCache[type];
    try {
      var audio = new Audio(src);
      audio.preload = "auto";
      audio.volume = 0.28;
      soundCache[type] = audio;
      return audio;
    } catch (_err) {
      return null;
    }
  }

  function playFromAsset(type) {
    var source = preloadSound(type);
    if (!source) return false;
    try {
      var player = source.cloneNode(true);
      player.volume = source.volume;
      player.play().catch(function () {});
      return true;
    } catch (_err) {
      return false;
    }
  }

  function fallbackTone(type) {
    if (type === "correct") {
      playTone(620, 0.08, 0.02, 0);
      playTone(820, 0.11, 0.018, 0.06);
      return;
    }
    if (type === "wrong") {
      playTone(280, 0.12, 0.02, 0);
      playTone(220, 0.09, 0.018, 0.09);
      return;
    }
    if (type === "missioncomplete") {
      playTone(500, 0.12, 0.024, 0);
      playTone(700, 0.13, 0.024, 0.1);
      playTone(900, 0.16, 0.024, 0.22);
      return;
    }
    if (type === "levelup") {
      playTone(540, 0.1, 0.025, 0);
      playTone(740, 0.11, 0.024, 0.09);
      playTone(940, 0.12, 0.024, 0.18);
      return;
    }
    if (type === "confirm") {
      playTone(600, 0.1, 0.024, 0);
      playTone(800, 0.12, 0.02, 0.08);
      return;
    }
    if (type === "victory") {
      playTone(520, 0.12, 0.03, 0);
      playTone(660, 0.14, 0.03, 0.1);
      playTone(830, 0.16, 0.032, 0.22);
      return;
    }
    if (type === "hover") {
      playTone(440, 0.06, 0.009, 0);
      return;
    }
    playTone(480, 0.07, 0.012, 0);
  }

  function play(type) {
    if (!api.isEnabled()) return;
    if (isReducedMotion() && type === "hover") return;
    if (!unlocked && type !== "hover") return;
    var ctx = ensureAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") {
      ctx.resume().catch(function () {});
    }
    if (!playFromAsset(type)) fallbackTone(type);
  }

  function emitSoundChange(enabled) {
    try {
      window.dispatchEvent(
        new CustomEvent(SOUND_STATE_EVENT, {
          detail: { enabled: Boolean(enabled) }
        })
      );
    } catch (_err) {}
  }

  var api = {
    isEnabled: function () {
      return readEnabled();
    },
    setEnabled: function (enabled) {
      var next = Boolean(enabled);
      writeEnabled(next);
      emitSoundChange(next);
    },
    toggle: function () {
      var next = !readEnabled();
      writeEnabled(next);
      emitSoundChange(next);
      return next;
    },
    play: play,
    unlock: function () {
      unlocked = true;
      writeUnlockState(true);
      Object.keys(SOUND_FILES).forEach(preloadSound);
      var ctx = ensureAudioContext();
      if (ctx && ctx.state === "suspended") ctx.resume().catch(function () {});
    },
    onStateChangeEvent: SOUND_STATE_EVENT
  };

  function bindUnlock() {
    var unlockOnce = function () {
      if (unlocked) return;
      api.unlock();
      window.removeEventListener("pointerdown", unlockOnce, true);
      window.removeEventListener("keydown", unlockOnce, true);
      window.removeEventListener("touchstart", unlockOnce, true);
    };
    window.addEventListener("pointerdown", unlockOnce, true);
    window.addEventListener("keydown", unlockOnce, true);
    window.addEventListener("touchstart", unlockOnce, true);
  }

  unlocked = readUnlockState();
  if (unlocked) {
    Object.keys(SOUND_FILES).forEach(preloadSound);
  }
  bindUnlock();

  window.GSSound = api;
})();
