(function () {
  function syncLegacyButtons() {
    if (!window.GSSound || typeof window.GSSound.isEnabled !== "function") return;
    var buttons = document.querySelectorAll("#btnSound");
    for (var i = 0; i < buttons.length; i += 1) {
      var btn = buttons[i];
      var enabled = window.GSSound.isEnabled();
      btn.textContent = enabled ? "Sound: ON" : "Sound: OFF";
      if (!btn.__gsBound) {
        btn.__gsBound = true;
        btn.addEventListener("click", function () {
          if (window.GSSound.initSound) window.GSSound.initSound();
          if (window.GSSound.toggleEnabled) window.GSSound.toggleEnabled();
          else if (window.GSSound.toggle) window.GSSound.toggle();
          syncLegacyButtons();
        });
      }
    }
  }

  function addLegacyAliases() {
    if (!window.GSSound || typeof window.GSSound.play !== "function") return;
    if (!window.GSSound.correct) {
      window.GSSound.correct = function () {
        return window.GSSound.play("correct");
      };
    }
    if (!window.GSSound.wrong) {
      window.GSSound.wrong = function () {
        return window.GSSound.play("wrong");
      };
    }
    if (!window.GSSound.missionComplete) {
      window.GSSound.missionComplete = function () {
        return window.GSSound.play("missioncomplete");
      };
    }
    if (!window.GSSound.clickTone) {
      window.GSSound.clickTone = function () {
        return window.GSSound.play("click");
      };
    }
    if (!window.GSSound.streak) {
      window.GSSound.streak = function () {
        return window.GSSound.play("levelup");
      };
    }
    if (!window.GSSound.combo) {
      window.GSSound.combo = function () {
        return window.GSSound.play("levelup");
      };
    }
    if (window.GSSound.initSound) window.GSSound.initSound();
    syncLegacyButtons();
    if (window.GSSound.onStateChangeEvent) {
      window.addEventListener(window.GSSound.onStateChangeEvent, syncLegacyButtons);
    }
  }

  if (window.GSSound && typeof window.GSSound.play === "function") {
    addLegacyAliases();
    return;
  }

  var existing = document.querySelector('script[data-gs-sound-system="1"]');
  if (!existing) {
    var script = document.createElement("script");
    script.src = "/core/sound-manager.js";
    script.defer = true;
    script.setAttribute("data-gs-sound-system", "1");
    script.addEventListener("load", addLegacyAliases);
    (document.head || document.documentElement).appendChild(script);
    return;
  }
  existing.addEventListener("load", addLegacyAliases);
})();
