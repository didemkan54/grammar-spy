(function () {
  var key = "gs_sound_enabled";
  var enabled = true;
  var audioCtx = null;

  try {
    var stored = localStorage.getItem(key);
    if (stored === "0") enabled = false;
  } catch (e) {}

  function getCtx() {
    if (!audioCtx) {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      audioCtx = new Ctx();
    }
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }

  function setLabel(btn) {
    if (!btn) return;
    btn.textContent = enabled ? "Sound: ON" : "Sound: OFF";
  }

  function syncButtons() {
    var buttons = document.querySelectorAll("#btnSound");
    for (var i = 0; i < buttons.length; i++) setLabel(buttons[i]);
  }

  function toggle() {
    enabled = !enabled;
    try { localStorage.setItem(key, enabled ? "1" : "0"); } catch (e) {}
    syncButtons();
  }

  function bind() {
    var buttons = document.querySelectorAll("#btnSound");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener("click", toggle);
      setLabel(buttons[i]);
    }
  }

  function clickTone() {
    if (!enabled) return;
    var ctx = getCtx();
    if (!ctx) return;
    var t = ctx.currentTime;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.06);
    gain.gain.setValueAtTime(0.07, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  function correctSound() {
    if (!enabled) return;
    var ctx = getCtx();
    if (!ctx) return;
    var t = ctx.currentTime;

    var notes = [523, 659, 784];
    notes.forEach(function (freq, i) {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, t + i * 0.08);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.12, t + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.08, t + i * 0.08 + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t + i * 0.08);
      osc.stop(t + 0.45);
    });

    var shimmer = ctx.createOscillator();
    var sGain = ctx.createGain();
    shimmer.type = "sine";
    shimmer.frequency.setValueAtTime(1568, t + 0.15);
    shimmer.frequency.exponentialRampToValueAtTime(2093, t + 0.35);
    sGain.gain.setValueAtTime(0, t);
    sGain.gain.linearRampToValueAtTime(0.03, t + 0.18);
    sGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    shimmer.connect(sGain);
    sGain.connect(ctx.destination);
    shimmer.start(t + 0.15);
    shimmer.stop(t + 0.5);
  }

  function wrongSound() {
    if (!enabled) return;
    var ctx = getCtx();
    if (!ctx) return;
    var t = ctx.currentTime;

    var osc1 = ctx.createOscillator();
    var osc2 = ctx.createOscillator();
    var gain = ctx.createGain();
    osc1.type = "square";
    osc2.type = "square";
    osc1.frequency.setValueAtTime(310, t);
    osc1.frequency.exponentialRampToValueAtTime(200, t + 0.25);
    osc2.frequency.setValueAtTime(295, t);
    osc2.frequency.exponentialRampToValueAtTime(185, t + 0.25);
    gain.gain.setValueAtTime(0.06, t);
    gain.gain.linearRampToValueAtTime(0.04, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.3);
    osc2.stop(t + 0.3);
  }

  function streakSound(streakCount) {
    if (!enabled) return;
    var ctx = getCtx();
    if (!ctx) return;
    var t = ctx.currentTime;

    var base = 523 + Math.min(streakCount, 10) * 40;
    var notes = [base, base * 1.25, base * 1.5, base * 2];
    notes.forEach(function (freq, i) {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t + i * 0.06);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.09, t + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t + i * 0.06);
      osc.stop(t + i * 0.06 + 0.2);
    });
  }

  function missionComplete() {
    if (!enabled) return;
    var ctx = getCtx();
    if (!ctx) return;
    var t = ctx.currentTime;

    var fanfare = [523, 659, 784, 1047, 784, 1047];
    var durations = [0.12, 0.12, 0.12, 0.25, 0.12, 0.35];
    var offset = 0;
    fanfare.forEach(function (freq, i) {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = i < 4 ? "triangle" : "sine";
      osc.frequency.setValueAtTime(freq, t + offset);
      gain.gain.setValueAtTime(0, t + offset);
      gain.gain.linearRampToValueAtTime(0.12, t + offset + 0.02);
      gain.gain.setValueAtTime(0.10, t + offset + durations[i] * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.001, t + offset + durations[i] + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t + offset);
      osc.stop(t + offset + durations[i] + 0.15);
      offset += durations[i];
    });

    var pad = ctx.createOscillator();
    var padGain = ctx.createGain();
    pad.type = "sine";
    pad.frequency.setValueAtTime(523, t + offset - 0.2);
    padGain.gain.setValueAtTime(0, t + offset - 0.2);
    padGain.gain.linearRampToValueAtTime(0.06, t + offset);
    padGain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.8);
    pad.connect(padGain);
    padGain.connect(ctx.destination);
    pad.start(t + offset - 0.2);
    pad.stop(t + offset + 1);
  }

  function comboSound() {
    if (!enabled) return;
    var ctx = getCtx();
    if (!ctx) return;
    var t = ctx.currentTime;

    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(1800, t + 0.15);
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.2);

    var sparkle = ctx.createOscillator();
    var sGain = ctx.createGain();
    sparkle.type = "sine";
    sparkle.frequency.setValueAtTime(2400, t + 0.08);
    sparkle.frequency.exponentialRampToValueAtTime(3200, t + 0.18);
    sGain.gain.setValueAtTime(0.03, t + 0.08);
    sGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    sparkle.connect(sGain);
    sGain.connect(ctx.destination);
    sparkle.start(t + 0.08);
    sparkle.stop(t + 0.25);
  }

  window.GSSound = {
    isEnabled: function () { return enabled; },
    setEnabled: function (next) {
      enabled = !!next;
      try { localStorage.setItem(key, enabled ? "1" : "0"); } catch (e) {}
      syncButtons();
    },
    clickTone: clickTone,
    correct: correctSound,
    wrong: wrongSound,
    streak: streakSound,
    missionComplete: missionComplete,
    combo: comboSound
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})();
