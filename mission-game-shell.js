(function () {
  var params = new URLSearchParams(window.location.search);
  var gameKey = window.GS_GAME_KEY || "error-smash";
  var pack = params.get("pack") || "pack01";
  var difficulty = params.get("difficulty") || "field";
  var timerOn = (params.get("timer") || "on") !== "off";
  var requestedCount = Number(params.get("count") || 10) || 10;
  var count = Math.max(6, Math.min(20, requestedCount));
  var playFormat = params.get("play_format") || "individuals";

  var games = {
    "error-smash": {
      title: "Error Smash",
      subtitle: "Scan fast and choose the best correction.",
      howTo: "Read the sentence evidence, then choose the strongest correction. Score rises with accuracy and streak."
    },
    "past-sort": {
      title: "Past Sort",
      subtitle: "Sort timeline meaning by selecting the best tense line.",
      howTo: "Read each context clue and choose the sentence that best matches completed versus ongoing past action."
    },
    "narrative-builder": {
      title: "Narrative Builder",
      subtitle: "Build story flow with accurate grammar choices.",
      howTo: "Pick the sentence that keeps the narrative sequence clear and grammatically correct."
    },
    "dialogue-repair": {
      title: "Dialogue Repair",
      subtitle: "Repair spoken lines to make classroom meaning clear.",
      howTo: "Each witness line has one best repair. Choose it to keep dialogue natural and accurate."
    },
    "rewrite-studio": {
      title: "Rewrite Studio",
      subtitle: "Rewrite weak lines into strong mission-ready grammar.",
      howTo: "Select the strongest rewrite for each original line. Focus on clarity, tense, and agreement."
    },
    "rule-sprint-present": {
      title: "Rule Sprint (Present)",
      subtitle: "Apply present tense rules under pressure.",
      howTo: "Read each present-tense context and choose the grammatically strongest sentence."
    },
    "signal-decoder-present": {
      title: "Signal Decoder (Present)",
      subtitle: "Decode clue signals and match the correct present form.",
      howTo: "Use context signals like now, usually, and right now to choose the best verb form."
    },
    "present-case-interview": {
      title: "Case Interview (Present)",
      subtitle: "Interview evidence and lock the best present-tense line.",
      howTo: "Treat each item like an interview clue. Choose the line that best matches present-time meaning."
    },
    "be-verb-rule-sprint": {
      title: "Be-Verb Rule Sprint",
      subtitle: "Use am/is/are with clean subject matching.",
      howTo: "Check subject clues and choose the best be-verb form with agreement."
    },
    "be-verb-agreement-sweep": {
      title: "Agreement Sweep",
      subtitle: "Sweep for agreement errors and fix them quickly.",
      howTo: "Focus on singular/plural agreement and choose the line with correct subject-verb matching."
    },
    "be-verb-case-interview": {
      title: "Case Interview (Be-Verb)",
      subtitle: "Interview evidence to secure agreement accuracy.",
      howTo: "Read the scene and pick the sentence with the strongest be-verb agreement."
    },
    "mission-sequence-lab": {
      title: "Mission Sequence Lab",
      subtitle: "Sequence sentence logic with grammar precision.",
      howTo: "Choose the line that keeps sequence logic and grammar accurate from one step to the next."
    },
    "evidence-sort-board": {
      title: "Evidence Sort Board",
      subtitle: "Sort evidence lines by the strongest grammar choice.",
      howTo: "Each option is evidence. Select the sentence that best secures meaning and correctness."
    }
  };

  var genericRounds = [
    {
      scene: "Hallway Before First Period",
      prompt: "Choose the strongest line.",
      options: [
        "When the bell rang, students were finding their seats.",
        "When the bell rang, students find their seats.",
        "When the bell rang, students is finding their seats.",
        "When the bell rang, students are found their seats."
      ],
      answer: 0,
      explain: "Interrupted past action should use past continuous."
    },
    {
      scene: "Office Announcement Draft",
      prompt: "Select the best correction.",
      options: [
        "Yesterday the principal approved the final message.",
        "Yesterday the principal approves the final message.",
        "Yesterday the principal is approving the final message.",
        "Yesterday the principal approve the final message."
      ],
      answer: 0,
      explain: "Completed events yesterday should use simple past."
    },
    {
      scene: "Partner Reflection",
      prompt: "Pick the best parallel structure.",
      options: [
        "I was checking the board while my partner was reviewing attendance.",
        "I was checking the board while my partner review attendance.",
        "I was checking the board while my partner reviews attendance.",
        "I was checking the board while my partner reviewed attendance and now."
      ],
      answer: 0,
      explain: "Parallel past actions should use matching past continuous form."
    },
    {
      scene: "Camera Log Entry",
      prompt: "Choose the timeline-accurate sentence.",
      options: [
        "The class was reading quietly when the speaker failed.",
        "The class read quietly when the speaker failed and fails.",
        "The class is reading quietly when the speaker failed.",
        "The class reads quietly when the speaker failed."
      ],
      answer: 0,
      explain: "Use ongoing past + interrupting past event."
    },
    {
      scene: "Debrief Summary",
      prompt: "Which line is strongest?",
      options: [
        "After we fixed the script, students read the corrected version.",
        "After we fixed the script, students reads the corrected version.",
        "After we fixed the script, students are reading the corrected version.",
        "After we fixed the script, students were read the corrected version."
      ],
      answer: 0,
      explain: "Completed sequence uses simple past."
    },
    {
      scene: "Timeline Rebuild",
      prompt: "Complete the while-clause correctly.",
      options: [
        "While we were rebuilding the timeline, we found two errors.",
        "While we rebuild the timeline, we found two errors.",
        "While we are rebuilding the timeline, we found two errors.",
        "While we rebuilt the timeline, we finding two errors."
      ],
      answer: 0,
      explain: "While-clause in past context needs past continuous."
    },
    {
      scene: "Intercom Final Check",
      prompt: "Choose the strongest be-verb line.",
      options: [
        "The final script was clear and ready.",
        "The final script were clear and ready.",
        "The final script are clear and ready.",
        "The final script be clear and ready."
      ],
      answer: 0,
      explain: "Singular subject in past context uses 'was'."
    },
    {
      scene: "Mission Closeout",
      prompt: "Pick the best closing line.",
      options: [
        "By first period, the class submitted the corrected announcement.",
        "By first period, the class submits the corrected announcement.",
        "By first period, the class is submitting the corrected announcement.",
        "By first period, the class were submitting the corrected announcement."
      ],
      answer: 0,
      explain: "By-the-end result should be a completed past action."
    },
    {
      scene: "Connector Check",
      prompt: "Select the sentence with clear cause/result.",
      options: [
        "Students revised the line, so the meaning became clear.",
        "Students revised the line, because so the meaning became clear.",
        "Students revised the line, and because so clear.",
        "Students revised the line, so meaning clear be."
      ],
      answer: 0,
      explain: "Use one precise connector, not mixed connector forms."
    },
    {
      scene: "Pronoun Audit",
      prompt: "Choose the clearest reference.",
      options: [
        "Maria gave Ana the script after Maria finished editing it.",
        "Maria gave Ana the script after she finished editing it.",
        "Maria gave Ana the script after it finished editing it.",
        "Maria gave Ana the script after she were editing."
      ],
      answer: 0,
      explain: "Ambiguous pronouns should be clarified with explicit nouns."
    },
    {
      scene: "Question Flow",
      prompt: "Pick the strongest question form.",
      options: [
        "Did the class finish the correction before lunch?",
        "Did the class finished the correction before lunch?",
        "Does the class finished the correction before lunch?",
        "Class did finish before lunch?"
      ],
      answer: 0,
      explain: "After 'did', the main verb should be base form."
    },
    {
      scene: "Wh-Question Precision",
      prompt: "Choose the best Wh-question.",
      options: [
        "Where did the team post the final announcement?",
        "Where did the team posted the final announcement?",
        "Where the team did post the final announcement?",
        "Where did posted the team final announcement?"
      ],
      answer: 0,
      explain: "Use Wh + did + subject + base verb."
    }
  ];

  function shuffle(list) {
    var copy = list.slice();
    for (var i = copy.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  function text(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function html(id, value) {
    var el = document.getElementById(id);
    if (el) el.innerHTML = value;
  }

  var cfg = games[gameKey] || games["error-smash"];
  var packTitle = (window.GSPacks && window.GSPacks.meta && window.GSPacks.meta[pack] && window.GSPacks.meta[pack].short) || pack.toUpperCase();
  var teacherBtn = document.getElementById("btnTeacher");
  var homeBtn = document.getElementById("btnHome");
  if (teacherBtn) teacherBtn.setAttribute("href", "teacher-mode.html?pack=" + encodeURIComponent(pack));
  if (homeBtn) homeBtn.setAttribute("href", "index.html");

  text("gameTitle", cfg.title);
  text("gameSub", cfg.subtitle);
  text("gameK", "Pack: " + packTitle + " \u00b7 Difficulty: " + difficulty);
  text("howToText", cfg.howTo + (playFormat === "teams" ? " Teams mode enabled: alternate turns between teams." : ""));
  text("hudTimer", timerOn ? "--" : "Off");

  var rounds = shuffle(genericRounds).slice(0, Math.min(count, genericRounds.length));
  var idx = 0;
  var correct = 0;
  var streak = 0;
  var locked = false;
  var sec = timerOn ? rounds.length * 9 : null;
  var timer = null;

  var optionsEl = document.getElementById("options");

  function updateHud() {
    text("hudCase", Math.min(idx + 1, rounds.length) + "/" + rounds.length);
    text("hudAcc", Math.round((correct / Math.max(1, idx)) * 100) + "%");
    text("hudStreak", String(streak));
    if (timerOn) text("hudTimer", Math.max(0, sec) + "s");
  }

  function showRound() {
    if (idx >= rounds.length) {
      endGame();
      return;
    }
    locked = false;
    text("feedback", "");
    var round = rounds[idx];
    text("scene", round.scene);
    text("prompt", round.prompt);
    optionsEl.innerHTML = "";
    shuffle(round.options.map(function (text, optionIdx) {
      return { text: text, optionIdx: optionIdx };
    })).forEach(function (item, displayIdx) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "opt";
      btn.innerHTML = "<b>" + String.fromCharCode(65 + displayIdx) + "</b><span>" + item.text + "</span>";
      btn.addEventListener("click", function () {
        selectOption(item.optionIdx, round, btn);
      });
      optionsEl.appendChild(btn);
    });
    updateHud();
  }

  function selectOption(selectedIdx, round, btn) {
    if (locked) return;
    locked = true;
    idx += 1;
    if (selectedIdx === round.answer) {
      correct += 1;
      streak += 1;
      btn.classList.add("good");
      html("feedback", "<span class=\"ok\">Secure: " + round.explain + "</span>");
      if (window.GSSound && window.GSSound.clickTone) window.GSSound.clickTone();
    } else {
      streak = 0;
      btn.classList.add("bad");
      html("feedback", "<span class=\"bad\">Needs repair: " + round.explain + "</span>");
    }
    updateHud();
    setTimeout(showRound, 850);
  }

  function endGame() {
    if (timer) clearInterval(timer);
    var acc = Math.round((correct / Math.max(1, idx)) * 100);
    text("reportAcc", "Accuracy: " + acc + "% (" + correct + "/" + Math.max(1, idx) + ")");
    text("reportPlan", acc >= 80 ? "Recommendation: advance to the next mission game." : "Recommendation: replay this game for retrieval strength.");
    text("reportPack", "Pack: " + packTitle + " \u00b7 Game: " + cfg.title);
    var report = document.getElementById("reportOverlay");
    if (report) report.classList.add("show");
  }

  function startTimer() {
    if (!timerOn) return;
    if (timer) clearInterval(timer);
    timer = setInterval(function () {
      sec -= 1;
      text("hudTimer", Math.max(0, sec) + "s");
      if (sec <= 0) endGame();
    }, 1000);
  }

  var startOverlay = document.getElementById("startOverlay");
  var startBtn = document.getElementById("startBtn");
  if (startBtn) {
    startBtn.addEventListener("click", function () {
      if (startOverlay) startOverlay.classList.remove("show");
      showRound();
      startTimer();
    });
  }

  var endBtn = document.getElementById("endBtn");
  if (endBtn) endBtn.addEventListener("click", endGame);

  var replayBtn = document.getElementById("replayBtn");
  if (replayBtn) {
    replayBtn.addEventListener("click", function () {
      var report = document.getElementById("reportOverlay");
      if (report) report.classList.remove("show");
      rounds = shuffle(genericRounds).slice(0, Math.min(count, genericRounds.length));
      idx = 0;
      correct = 0;
      streak = 0;
      sec = timerOn ? rounds.length * 9 : null;
      showRound();
      startTimer();
    });
  }
})();
