(function () {
  var SOUND_KEY = "gs_sound_enabled_v1";
  var SOUND_STATE_EVENT = "gs:sound-change";
  var audioCtx = null;
  var reducedMotionQuery = null;

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

  function writeEnabled(enabled) {
    if (!canUseStorage()) return;
    localStorage.setItem(SOUND_KEY, enabled ? "1" : "0");
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

  function play(type) {
    if (!api.isEnabled()) return;
    if (isReducedMotion() && type === "hover") return;
    var ctx = ensureAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") {
      ctx.resume().catch(function () {});
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
    onStateChangeEvent: SOUND_STATE_EVENT
  };

  window.GSSound = api;
})();
