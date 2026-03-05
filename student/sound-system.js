(function () {
  if (window.GSSound && typeof window.GSSound.play === "function") {
    window.GSSound.initSound && window.GSSound.initSound();
    return;
  }
  if (document.querySelector('script[data-gs-sound-system="1"]')) return;
  var script = document.createElement("script");
  script.src = "/core/sound-manager.js";
  script.defer = true;
  script.setAttribute("data-gs-sound-system", "1");
  (document.head || document.documentElement).appendChild(script);
})();
