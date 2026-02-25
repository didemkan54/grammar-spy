import { TimelineInterceptSound } from "./timeline-intercept-sound.js";

const PACK_MANIFEST = [
  {
    id: "timeline-intercept-pack01",
    label: "Pack 01 · Retell Timeline Foundations",
    path: "../../packs/timeline-intercept-pack01.json"
  }
];

const ROLE_LABEL = {
  ongoing: "Ongoing Action Box",
  interrupting: "Interrupting Action Box"
};

const ROLE_REASON = {
  ongoing: "it describes the longer background action (past continuous).",
  interrupting: "it marks the completed interrupting event (past simple)."
};

const state = {
  packId: PACK_MANIFEST[0].id,
  packData: null,
  itemsPool: [],
  queue: [],
  difficulty: "field",
  questionCount: 8,
  started: false,
  roundIndex: 0,
  score: 0,
  streak: 0,
  bestStreak: 0,
  correctCount: 0,
  incorrectCount: 0,
  awaitingNext: false,
  currentRound: null,
  mistakes: {
    ongoingAsInterrupt: 0,
    interruptAsOngoing: 0,
    incompletePlacement: 0
  }
};

const sound = new TimelineInterceptSound();

const el = {
  packSelect: document.getElementById("packSelect"),
  difficultySelect: document.getElementById("difficultySelect"),
  questionCountSelect: document.getElementById("questionCountSelect"),
  soundToggle: document.getElementById("soundToggle"),
  fullscreenBtn: document.getElementById("fullscreenBtn"),
  startBtn: document.getElementById("startBtn"),
  endGameBtn: document.getElementById("endGameBtn"),
  resetBtn: document.getElementById("resetBtn"),
  checkBtn: document.getElementById("checkBtn"),
  nextBtn: document.getElementById("nextBtn"),
  sentencePrompt: document.getElementById("sentencePrompt"),
  difficultyHint: document.getElementById("difficultyHint"),
  briefingText: document.getElementById("briefingText"),
  bankZone: document.getElementById("bankZone"),
  ongoingZone: document.getElementById("ongoingZone"),
  interruptZone: document.getElementById("interruptZone"),
  feedbackPanel: document.getElementById("feedbackPanel"),
  feedbackTitle: document.getElementById("feedbackTitle"),
  feedbackBody: document.getElementById("feedbackBody"),
  roundStat: document.getElementById("roundStat"),
  scoreStat: document.getElementById("scoreStat"),
  streakStat: document.getElementById("streakStat"),
  accuracyStat: document.getElementById("accuracyStat"),
  modeStat: document.getElementById("modeStat"),
  summaryOverlay: document.getElementById("summaryOverlay"),
  summaryLine: document.getElementById("summaryLine"),
  summaryAccuracy: document.getElementById("summaryAccuracy"),
  summaryXP: document.getElementById("summaryXP"),
  summaryStreak: document.getElementById("summaryStreak"),
  summaryMistake: document.getElementById("summaryMistake"),
  summaryRecommendation: document.getElementById("summaryRecommendation"),
  playAgainBtn: document.getElementById("playAgainBtn"),
  closeSummaryBtn: document.getElementById("closeSummaryBtn"),
  appShell: document.getElementById("timeline-intercept-app")
};

boot().catch((err) => {
  setFeedback("Load Error", "Could not initialize game pack. Check pack JSON path and format.", "error");
  console.error(err);
});

async function boot() {
  initControls();
  populatePackSelector();
  await loadPack(state.packId);
  renderIdle();
}

function initControls() {
  el.packSelect.addEventListener("change", async (event) => {
    state.packId = event.target.value;
    await loadPack(state.packId);
    resetMission(false);
  });

  el.difficultySelect.addEventListener("change", (event) => {
    state.difficulty = event.target.value;
    if (!state.started) renderIdle();
  });

  el.questionCountSelect.addEventListener("change", (event) => {
    state.questionCount = Number(event.target.value) || 8;
    if (!state.started) renderIdle();
  });

  el.soundToggle.addEventListener("change", (event) => {
    sound.setEnabled(event.target.value === "on");
  });

  el.fullscreenBtn.addEventListener("click", toggleFullscreen);
  el.startBtn.addEventListener("click", startMission);
  el.resetBtn.addEventListener("click", () => resetMission(true));
  el.endGameBtn.addEventListener("click", endMission);
  el.checkBtn.addEventListener("click", checkRound);
  el.nextBtn.addEventListener("click", goNextRound);
  el.playAgainBtn.addEventListener("click", () => {
    el.summaryOverlay.hidden = true;
    startMission();
  });
  el.closeSummaryBtn.addEventListener("click", () => {
    el.summaryOverlay.hidden = true;
  });

  setupDropZones();
}

function populatePackSelector() {
  el.packSelect.innerHTML = "";
  PACK_MANIFEST.forEach((pack) => {
    const option = document.createElement("option");
    option.value = pack.id;
    option.textContent = pack.label;
    el.packSelect.appendChild(option);
  });
  el.packSelect.value = state.packId;
}

async function loadPack(packId) {
  const manifestItem = PACK_MANIFEST.find((pack) => pack.id === packId);
  if (!manifestItem) throw new Error(`Unknown pack ID: ${packId}`);

  const response = await fetch(manifestItem.path, { cache: "no-store" });
  if (!response.ok) throw new Error(`Failed to load pack ${packId}`);
  state.packData = await response.json();
  state.itemsPool = Array.isArray(state.packData.items) ? state.packData.items : [];
}

function renderIdle() {
  state.started = false;
  state.awaitingNext = false;
  el.sentencePrompt.textContent = "Press Start Mission to load your first timeline intercept.";
  el.briefingText.textContent = "Drag fragments into Ongoing vs Interrupting boxes, then check your intercept.";
  setFeedback("Ready", "Set controls, then start mission.", "neutral");
  el.bankZone.innerHTML = "";
  el.ongoingZone.innerHTML = "";
  el.interruptZone.innerHTML = "";
  el.nextBtn.hidden = true;
  el.checkBtn.disabled = true;
  el.difficultyHint.hidden = true;
  removeTimelineStateClasses();
  updateStats();
}

function startMission() {
  if (!state.itemsPool.length) {
    setFeedback("No Items", "Selected pack has no sentence items.", "error");
    return;
  }

  state.difficulty = el.difficultySelect.value;
  state.questionCount = Number(el.questionCountSelect.value) || 8;
  sound.setEnabled(el.soundToggle.value === "on");

  state.queue = buildQueue();
  state.roundIndex = 0;
  state.score = 0;
  state.streak = 0;
  state.bestStreak = 0;
  state.correctCount = 0;
  state.incorrectCount = 0;
  state.awaitingNext = false;
  state.currentRound = null;
  state.mistakes = {
    ongoingAsInterrupt: 0,
    interruptAsOngoing: 0,
    incompletePlacement: 0
  };

  if (!state.queue.length) {
    setFeedback("No Valid Items", "This difficulty has no available items in the selected pack.", "error");
    return;
  }

  state.started = true;
  el.checkBtn.disabled = false;
  loadRound(0);
  setFeedback("Mission Live", "Sort fragments and check your intercept.", "neutral");
  updateStats();
}

function resetMission(playClick) {
  if (playClick) sound.playClick();
  state.started = false;
  state.roundIndex = 0;
  state.queue = [];
  state.currentRound = null;
  state.awaitingNext = false;
  state.score = 0;
  state.streak = 0;
  state.bestStreak = 0;
  state.correctCount = 0;
  state.incorrectCount = 0;
  state.mistakes = {
    ongoingAsInterrupt: 0,
    interruptAsOngoing: 0,
    incompletePlacement: 0
  };
  renderIdle();
}

function buildQueue() {
  const difficulty = state.difficulty;
  let filtered = state.itemsPool.filter((item) => {
    if (difficulty === "director") return item.directorReady;
    if (difficulty === "rookie") return item.difficultyTags.includes("rookie");
    return item.difficultyTags.includes("field") || item.difficultyTags.includes("rookie");
  });

  if (!filtered.length && difficulty === "director") {
    filtered = state.itemsPool.filter((item) => item.difficultyTags.includes("field"));
  }

  const shuffled = shuffle(filtered);
  return shuffled.slice(0, Math.min(state.questionCount, shuffled.length));
}

function loadRound(index) {
  const item = state.queue[index];
  if (!item) return endMission();

  const placements = {};
  item.fragments.forEach((fragment) => {
    placements[fragment.id] = "bank";
  });

  state.currentRound = {
    item,
    placements,
    resolved: false
  };

  state.roundIndex = index;
  state.awaitingNext = false;
  el.nextBtn.hidden = true;
  el.checkBtn.disabled = false;

  el.sentencePrompt.textContent = item.sentence;
  el.briefingText.textContent = "Assign each fragment to the timeline role that best matches tense logic.";
  renderHint(item);
  renderFragments();
  removeTimelineStateClasses();
  updateStats();
}

function renderHint(item) {
  if (state.difficulty !== "rookie") {
    el.difficultyHint.hidden = true;
    return;
  }
  el.difficultyHint.hidden = false;
  el.difficultyHint.textContent = item.hint || "Look for was/were + verb-ing for background action.";
}

function renderFragments() {
  if (!state.currentRound) return;
  const { item, placements, resolved } = state.currentRound;

  [el.bankZone, el.ongoingZone, el.interruptZone].forEach((zone) => {
    zone.innerHTML = "";
  });

  item.fragments.forEach((fragment) => {
    const node = document.createElement("article");
    node.className = "fragment";
    node.draggable = !resolved;
    node.dataset.fragmentId = fragment.id;
    node.innerHTML = renderFragmentText(fragment, state.difficulty === "rookie");

    node.addEventListener("dragstart", onDragStart);
    node.addEventListener("dragend", onDragEnd);

    if (resolved) {
      const dropRole = placements[fragment.id];
      if (dropRole === fragment.role) node.classList.add("correct");
      else node.classList.add("incorrect");
    }

    if (placements[fragment.id] === "ongoing") el.ongoingZone.appendChild(node);
    else if (placements[fragment.id] === "interrupting") el.interruptZone.appendChild(node);
    else el.bankZone.appendChild(node);
  });
}

function renderFragmentText(fragment, showHints) {
  if (!showHints || !fragment.hintVerb) {
    return escapeHtml(fragment.text);
  }
  return escapeHtml(fragment.text).replace(
    new RegExp(`\\b${escapeRegex(fragment.hintVerb)}\\b`, "i"),
    `<span class="hint-verb">${escapeHtml(fragment.hintVerb)}</span>`
  );
}

function setupDropZones() {
  [el.bankZone, el.ongoingZone, el.interruptZone].forEach((zone) => {
    zone.addEventListener("dragover", (event) => {
      event.preventDefault();
      zone.classList.add("drag-over");
    });
    zone.addEventListener("dragleave", () => zone.classList.remove("drag-over"));
    zone.addEventListener("drop", (event) => {
      event.preventDefault();
      zone.classList.remove("drag-over");
      if (!state.started || !state.currentRound || state.currentRound.resolved) return;
      const fragmentId = event.dataTransfer.getData("text/plain");
      if (!fragmentId) return;
      moveFragment(fragmentId, zone.dataset.zone);
      sound.playClick();
    });
  });
}

function onDragStart(event) {
  if (!state.currentRound || state.currentRound.resolved) return;
  const fragmentId = event.currentTarget.dataset.fragmentId;
  event.dataTransfer.setData("text/plain", fragmentId);
  event.dataTransfer.effectAllowed = "move";
  sound.playDrag();
}

function onDragEnd() {
  [el.bankZone, el.ongoingZone, el.interruptZone].forEach((zone) => zone.classList.remove("drag-over"));
}

function moveFragment(fragmentId, destinationZone) {
  if (!state.currentRound) return;
  state.currentRound.placements[fragmentId] = destinationZone;
  renderFragments();
}

function checkRound() {
  if (!state.started || !state.currentRound || state.awaitingNext) return;

  const round = state.currentRound;
  const item = round.item;
  const placements = round.placements;

  const unresolved = item.fragments.filter((fragment) => placements[fragment.id] === "bank");
  if (unresolved.length) {
    state.mistakes.incompletePlacement += unresolved.length;
    setFeedback(
      "Incomplete Placement",
      "Place every fragment before checking. Unplaced fragments increase cognitive load and reduce timeline accuracy.",
      "error"
    );
    sound.playFail();
    return;
  }

  const mismatches = item.fragments.filter((fragment) => placements[fragment.id] !== fragment.role);
  const isCorrect = mismatches.length === 0;

  if (isCorrect) {
    state.correctCount += 1;
    state.streak += 1;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
    const xpAward = scoreAwardForRound(state.difficulty, state.streak);
    state.score += xpAward;
    setFeedback(
      "Correct Intercept",
      `${item.explanation} +${xpAward} XP`,
      "success"
    );
    markTimeline("success");
    sound.playCorrect();
  } else {
    state.incorrectCount += 1;
    state.streak = 0;
    state.score = Math.max(0, state.score - 20);
    classifyMistakes(item, placements);
    setFeedback(
      "Incorrect Intercept",
      buildMismatchExplanation(mismatches, item),
      "error"
    );
    markTimeline("error");
    sound.playFail();
  }

  round.resolved = true;
  state.awaitingNext = true;
  el.checkBtn.disabled = true;
  el.nextBtn.hidden = false;
  el.nextBtn.textContent = state.roundIndex + 1 >= state.queue.length ? "Finish Mission" : "Next";
  renderFragments();
  updateStats();
}

function goNextRound() {
  if (!state.awaitingNext) return;
  sound.playClick();
  if (state.roundIndex + 1 >= state.queue.length) {
    endMission();
    return;
  }
  loadRound(state.roundIndex + 1);
}

function endMission() {
  if (!state.started) return;
  state.started = false;
  state.awaitingNext = false;
  showSummary();
  el.checkBtn.disabled = true;
  el.nextBtn.hidden = true;
}

function showSummary() {
  const total = state.correctCount + state.incorrectCount;
  const accuracy = total ? Math.round((state.correctCount / total) * 100) : 0;
  const commonMistake = deriveTopMistake();

  el.summaryLine.textContent = `You completed ${total} intercept rounds on ${state.difficulty.toUpperCase()} difficulty.`;
  el.summaryAccuracy.textContent = `${accuracy}%`;
  el.summaryXP.textContent = `${state.score} XP`;
  el.summaryStreak.textContent = String(state.bestStreak);
  el.summaryMistake.textContent = commonMistake.label;
  el.summaryRecommendation.textContent = commonMistake.recommendation;
  el.summaryOverlay.hidden = false;
}

function deriveTopMistake() {
  const buckets = [
    {
      key: "ongoingAsInterrupt",
      label: "Background actions placed as interrupts",
      recommendation: "Suggested review pack: Past Continuous Background Scanner"
    },
    {
      key: "interruptAsOngoing",
      label: "Interrupting events placed as background",
      recommendation: "Suggested review pack: Past Simple Event Trigger Drills"
    },
    {
      key: "incompletePlacement",
      label: "Unfinished placement before check",
      recommendation: "Suggested review pack: Timeline Parsing and Chunking"
    }
  ];

  const top = buckets.sort((a, b) => state.mistakes[b.key] - state.mistakes[a.key])[0];
  if (!top || state.mistakes[top.key] === 0) {
    return {
      label: "No dominant mistake pattern",
      recommendation: "Suggested review pack: Interleaved Mixed Timeline Retrieval"
    };
  }
  return top;
}

function scoreAwardForRound(difficulty, streak) {
  const base = difficulty === "director" ? 140 : difficulty === "field" ? 120 : 100;
  const multiplier = 1 + Math.min(0.6, streak * 0.06);
  return Math.round(base * multiplier);
}

function classifyMistakes(item, placements) {
  item.fragments.forEach((fragment) => {
    const placed = placements[fragment.id];
    if (placed === fragment.role) return;
    if (fragment.role === "ongoing" && placed === "interrupting") {
      state.mistakes.ongoingAsInterrupt += 1;
    } else if (fragment.role === "interrupting" && placed === "ongoing") {
      state.mistakes.interruptAsOngoing += 1;
    } else if (placed === "bank") {
      state.mistakes.incompletePlacement += 1;
    }
  });
}

function buildMismatchExplanation(mismatches, item) {
  const lines = mismatches.map((fragment) => {
    return `"${fragment.text}" belongs in ${ROLE_LABEL[fragment.role]} because ${ROLE_REASON[fragment.role]}`;
  });
  return `${lines.join(" ")} ${item.explanation}`;
}

function setFeedback(title, message, tone) {
  el.feedbackTitle.textContent = title;
  el.feedbackBody.textContent = message;
  el.feedbackPanel.classList.remove("neutral", "success", "error");
  el.feedbackPanel.classList.add(tone);
}

function markTimeline(stateClass) {
  removeTimelineStateClasses();
  const timeline = document.querySelector(".timeline-wrap");
  if (!timeline) return;
  timeline.classList.add(stateClass);
}

function removeTimelineStateClasses() {
  const timeline = document.querySelector(".timeline-wrap");
  if (!timeline) return;
  timeline.classList.remove("success", "error");
}

function updateStats() {
  const total = state.correctCount + state.incorrectCount;
  const accuracy = total ? Math.round((state.correctCount / total) * 100) : 0;
  el.roundStat.textContent = `${Math.min(state.roundIndex + (state.started ? 1 : 0), state.queue.length)}/${state.queue.length || 0}`;
  el.scoreStat.textContent = `${state.score} XP`;
  el.streakStat.textContent = String(state.streak);
  el.accuracyStat.textContent = `${accuracy}%`;
  el.modeStat.textContent = state.started ? state.difficulty.toUpperCase() : "Idle";
}

function toggleFullscreen() {
  sound.playClick();
  if (!document.fullscreenElement) {
    el.appShell.requestFullscreen().catch(() => {});
    return;
  }
  document.exitFullscreen().catch(() => {});
}

function shuffle(list) {
  const copy = list.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
