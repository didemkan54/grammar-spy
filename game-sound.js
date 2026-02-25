(function () {
  var key = "gs_sound_enabled";
  var enabled = true;
  try {
    var stored = localStorage.getItem(key);
    if (stored === "0") enabled = false;
  } catch (e) {}

  function setLabel(btn) {
    if (!btn) return;
    btn.textContent = enabled ? "Sound: ON" : "Sound: OFF";
  }

  function syncButtons() {
    var buttons = document.querySelectorAll("#btnSound");
    for (var i = 0; i < buttons.length; i++) {
      setLabel(buttons[i]);
    }
  }

  function toggle() {
    enabled = !enabled;
    try {
      localStorage.setItem(key, enabled ? "1" : "0");
    } catch (e) {}
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
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      var ctx = new Ctx();
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 700;
      gain.gain.value = 0.04;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      setTimeout(function () {
        osc.stop();
        ctx.close();
      }, 90);
    } catch (e) {}
  }

  window.GSSound = {
    isEnabled: function () { return enabled; },
    setEnabled: function (next) {
      enabled = !!next;
      try {
        localStorage.setItem(key, enabled ? "1" : "0");
      } catch (e) {}
      syncButtons();
    },
    clickTone: clickTone
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})();
