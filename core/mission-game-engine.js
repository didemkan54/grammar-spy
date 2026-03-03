import { buildHubUrl, buildPlayUrl, getNextGamePointer } from "/core/missions-catalog.js";

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeHtml(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function track(name, payload) {
  if (window.GSAnalytics && typeof window.GSAnalytics.track === "function") {
    window.GSAnalytics.track(name, payload || {});
  }
}

function dragCorrectSummary(item) {
  const col = {};
  (item.columns || []).forEach((entry) => {
    col[entry.id] = entry.label;
  });
  return (item.cards || [])
    .map((card) => `${card.text} -> ${col[card.columnId] || card.columnId}`)
    .join(" | ");
}

export class MissionGameEngine {
  constructor(config) {
    this.root = config.root;
    this.mission = config.mission;
    this.subskill = config.subskill;
    this.game = config.game;
    this.timerEnabled = Boolean(config.timerEnabled);
    this.timerSeconds = Number(config.timerSeconds) > 0 ? Number(config.timerSeconds) : 360;
    this.initialTimerSeconds = this.timerSeconds;

    this.items = Array.isArray(config.game.items) ? config.game.items.slice(0) : [];
    this.index = 0;
    this.score = 0;
    this.streak = 0;
    this.bestStreak = 0;
    this.answered = false;
    this.missed = [];
    this.timerHandle = null;
    this.currentItemStartedAt = Date.now();

    this.onExit = typeof config.onExit === "function" ? config.onExit : null;
    this.hasCompleted = false;
  }

  start() {
    if (!this.root) return;

    this.root.innerHTML = this.buildShell();
    this.captureDomRefs();
    this.bindShellEvents();
    this.syncTopStats();
    this.renderCurrentItem();
    this.startTimerIfNeeded();

    track("mission_game_start", {
      mission_id: this.mission.id,
      mission_title: this.mission.title,
      subskill_id: this.subskill.id,
      game_id: this.game.id,
      game_type: this.game.gameType
    });
  }

  buildShell() {
    const typeLabel = String(this.game.gameType || "").replace(/_/g, " ");
    return `
      <section class="mission-hero mission-hero-play">
        <p class="hero-eyebrow">Mission Play</p>
        <h1>${escapeHtml(this.game.title)}</h1>
        <p class="hero-subline">${escapeHtml(this.mission.title)} <span class="hero-subline-dot">|</span> ${escapeHtml(this.mission.subtitle)}</p>
        <div class="mission-chip-row">
          <span class="mission-chip">${escapeHtml(this.subskill.title)}</span>
          <span class="mission-chip">${escapeHtml(typeLabel)}</span>
          <span class="mission-chip">15 items</span>
        </div>
      </section>

      <section class="play-board">
        <div class="play-metrics">
          <div class="metric-pill"><strong id="metricProgress">1 / 15</strong><span>Progress</span></div>
          <div class="metric-pill"><strong id="metricScore">0</strong><span>Score</span></div>
          <div class="metric-pill"><strong id="metricStreak">0</strong><span>Streak</span></div>
          <div class="metric-pill ${this.timerEnabled ? "" : "is-hidden"}"><strong id="metricTimer">06:00</strong><span>Timer</span></div>
        </div>

        <div class="progress-track" aria-hidden="true">
          <div class="progress-fill" id="progressFill"></div>
        </div>

        <article class="play-item-panel">
          <div id="itemPrompt" class="item-prompt"></div>
          <div id="itemContext" class="item-context"></div>
          <div id="itemWorkspace" class="item-workspace"></div>
        </article>

        <article class="feedback-panel" id="feedbackPanel">
          <h2 id="feedbackTitle">Ready?</h2>
          <p id="feedbackBody">Choose your answer to get immediate feedback.</p>
        </article>

        <div class="action-row">
          <button type="button" class="gsm-btn gsm-btn-soft" id="clearBtn">Clear</button>
          <button type="button" class="gsm-btn gsm-btn-primary" id="checkBtn">Check</button>
          <button type="button" class="gsm-btn gsm-btn-primary is-hidden" id="nextBtn">Next item</button>
        </div>
      </section>
    `;
  }

  captureDomRefs() {
    this.metricProgress = this.root.querySelector("#metricProgress");
    this.metricScore = this.root.querySelector("#metricScore");
    this.metricStreak = this.root.querySelector("#metricStreak");
    this.metricTimer = this.root.querySelector("#metricTimer");
    this.progressFill = this.root.querySelector("#progressFill");
    this.itemPrompt = this.root.querySelector("#itemPrompt");
    this.itemContext = this.root.querySelector("#itemContext");
    this.itemWorkspace = this.root.querySelector("#itemWorkspace");
    this.feedbackPanel = this.root.querySelector("#feedbackPanel");
    this.feedbackTitle = this.root.querySelector("#feedbackTitle");
    this.feedbackBody = this.root.querySelector("#feedbackBody");
    this.clearBtn = this.root.querySelector("#clearBtn");
    this.checkBtn = this.root.querySelector("#checkBtn");
    this.nextBtn = this.root.querySelector("#nextBtn");
  }

  bindShellEvents() {
    this.checkBtn.addEventListener("click", () => this.checkNonChoiceAnswer());
    this.nextBtn.addEventListener("click", () => this.goNext());
    this.clearBtn.addEventListener("click", () => this.clearCurrentInput());
  }

  startTimerIfNeeded() {
    if (!this.timerEnabled) return;
    this.updateTimerLabel();
    this.timerHandle = window.setInterval(() => {
      this.timerSeconds -= 1;
      this.updateTimerLabel();
      if (this.timerSeconds <= 0) {
        this.stopTimer();
        this.finish("timer_expired");
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerHandle) {
      window.clearInterval(this.timerHandle);
      this.timerHandle = null;
    }
  }

  updateTimerLabel() {
    if (!this.metricTimer) return;
    const safe = Math.max(0, this.timerSeconds);
    const min = String(Math.floor(safe / 60)).padStart(2, "0");
    const sec = String(safe % 60).padStart(2, "0");
    this.metricTimer.textContent = `${min}:${sec}`;
  }

  syncTopStats() {
    const complete = this.items.length ? this.index / this.items.length : 0;
    this.metricProgress.textContent = `${Math.min(this.index + 1, this.items.length)} / ${this.items.length}`;
    this.metricScore.textContent = String(this.score);
    this.metricStreak.textContent = String(this.streak);
    this.progressFill.style.width = `${Math.min(100, Math.round(complete * 100))}%`;
  }

  setFeedback(kind, title, body) {
    this.feedbackPanel.classList.remove("feedback-ok", "feedback-warn", "feedback-neutral");
    this.feedbackPanel.classList.add(kind || "feedback-neutral");
    this.feedbackTitle.textContent = title;
    this.feedbackBody.innerHTML = body;
  }

  renderCurrentItem() {
    if (this.index >= this.items.length) {
      this.finish("completed");
      return;
    }

    this.syncTopStats();
    this.currentItemStartedAt = Date.now();
    this.answered = false;
    this.nextBtn.classList.add("is-hidden");
    this.clearBtn.classList.remove("is-hidden");
    this.checkBtn.classList.remove("is-hidden");
    this.clearBtn.disabled = false;
    this.checkBtn.disabled = false;

    const item = this.items[this.index];
    this.itemPrompt.textContent = item.prompt || "Solve this item.";
    this.itemContext.textContent = item.context || "";
    this.setFeedback("feedback-neutral", "Your move", "Pick an answer, then check your result.");

    const type = this.game.gameType;
    this.currentController = null;

    if (type === "multiple_choice") {
      this.renderMultipleChoice(item);
      this.checkBtn.classList.add("is-hidden");
      this.clearBtn.classList.add("is-hidden");
      return;
    }
    if (type === "sentence_builder") {
      this.renderSentenceBuilder(item);
      return;
    }
    if (type === "error_spotter") {
      this.renderErrorSpotter(item);
      return;
    }
    if (type === "drag_sort") {
      this.renderDragSort(item);
      return;
    }

    this.itemWorkspace.innerHTML = `
      <div class="empty-state">
        Unsupported game type: ${escapeHtml(type)}.
      </div>
    `;
    this.checkBtn.classList.add("is-hidden");
    this.clearBtn.classList.add("is-hidden");
  }

  renderMultipleChoice(item) {
    const options = (item.options || []).slice();
    this.itemWorkspace.innerHTML = `
      <div class="choice-grid">
        ${options
          .map(
            (opt, idx) =>
              `<button type="button" class="choice-btn" data-choice-index="${idx}">${escapeHtml(opt)}</button>`
          )
          .join("")}
      </div>
    `;
    this.itemWorkspace.querySelectorAll(".choice-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (this.answered) return;
        const pickedIndex = Number(btn.dataset.choiceIndex);
        const isCorrect = pickedIndex === Number(item.answerIndex);
        const pickedText = options[pickedIndex] || "";
        const correctText = options[item.answerIndex] || "";
        this.finalizeAnswer({
          item,
          isCorrect,
          userAnswer: pickedText,
          correctAnswer: correctText,
          explain: item.explain || ""
        });
      });
    });
  }

  renderSentenceBuilder(item) {
    const bank = Array.isArray(item.bank) ? item.bank.slice() : [];
    const built = [];

    const render = () => {
      this.itemWorkspace.innerHTML = `
        <p class="builder-label">Build your sentence:</p>
        <div class="builder-output ${built.length ? "" : "is-empty"}" id="builderOutput">${escapeHtml(
          built.join(" ")
        ) || "Tap words below to build your sentence."}</div>
        <div class="builder-bank" id="builderBank">
          ${bank
            .map(
              (token, idx) =>
                `<button type="button" class="token-btn" data-bank-index="${idx}">${escapeHtml(token)}</button>`
            )
            .join("")}
        </div>
      `;

      this.itemWorkspace.querySelectorAll("[data-bank-index]").forEach((btn) => {
        btn.addEventListener("click", () => {
          if (this.answered) return;
          const bankIndex = Number(btn.dataset.bankIndex);
          const next = bank.splice(bankIndex, 1);
          if (next.length) {
            built.push(next[0]);
            render();
          }
        });
      });

      const output = this.itemWorkspace.querySelector("#builderOutput");
      output.addEventListener("click", () => {
        if (this.answered || !built.length) return;
        const token = built.pop();
        bank.push(token);
        render();
      });
    };

    render();
    this.currentController = {
      clear: () => {
        while (built.length) bank.push(built.pop());
        render();
      },
      check: () => {
        const builtSentence = built.join(" ");
        const target = item.solution;
        const ok = normalizeText(builtSentence) === normalizeText(target);
        return {
          isReady: built.length > 0,
          isCorrect: ok,
          userAnswer: builtSentence,
          correctAnswer: target,
          explain: item.explain || "Use the target structure carefully."
        };
      },
      disable: () => {
        this.itemWorkspace.querySelectorAll("button").forEach((btn) => (btn.disabled = true));
      }
    };
  }

  renderErrorSpotter(item) {
    this.itemWorkspace.innerHTML = `
      <p class="error-spotter-label">Sentence to repair:</p>
      <p class="error-spotter-bug">${escapeHtml(item.sentence || "")}</p>
      <label class="input-label" for="errorSpotInput">Type the corrected sentence:</label>
      <input id="errorSpotInput" class="text-input" type="text" value="" placeholder="Type your correction here" />
    `;

    const input = this.itemWorkspace.querySelector("#errorSpotInput");
    this.currentController = {
      clear: () => {
        input.value = "";
        input.focus();
      },
      check: () => {
        const userAnswer = input.value.trim();
        return {
          isReady: Boolean(userAnswer),
          isCorrect: normalizeText(userAnswer) === normalizeText(item.correction),
          userAnswer,
          correctAnswer: item.correction,
          explain: item.explain || "Replace the incorrect auxiliary or verb form."
        };
      },
      disable: () => {
        input.disabled = true;
      }
    };
  }

  renderDragSort(item) {
    const assignments = {};
    (item.cards || []).forEach((card) => {
      assignments[card.id] = "";
    });

    const render = () => {
      this.itemWorkspace.innerHTML = `
        <p class="sort-label">Assign each card to the correct lane:</p>
        <div class="sort-grid">
          ${(item.cards || [])
            .map((card) => {
              const selected = assignments[card.id] || "";
              return `
                <label class="sort-row">
                  <span class="sort-row-text">${escapeHtml(card.text)}</span>
                  <select class="sort-select" data-card-id="${escapeHtml(card.id)}">
                    <option value="">Choose lane...</option>
                    ${(item.columns || [])
                      .map(
                        (col) =>
                          `<option value="${escapeHtml(col.id)}" ${selected === col.id ? "selected" : ""}>${escapeHtml(
                            col.label
                          )}</option>`
                      )
                      .join("")}
                  </select>
                </label>
              `;
            })
            .join("")}
        </div>
      `;

      this.itemWorkspace.querySelectorAll("[data-card-id]").forEach((sel) => {
        sel.addEventListener("change", () => {
          if (this.answered) return;
          assignments[sel.dataset.cardId] = sel.value;
        });
      });
    };

    render();

    this.currentController = {
      clear: () => {
        Object.keys(assignments).forEach((key) => {
          assignments[key] = "";
        });
        render();
      },
      check: () => {
        const cards = item.cards || [];
        const allAssigned = cards.every((card) => Boolean(assignments[card.id]));
        const isCorrect = cards.every((card) => assignments[card.id] === card.columnId);
        const userAnswer = cards
          .map((card) => `${card.text} -> ${assignments[card.id] || "unassigned"}`)
          .join(" | ");
        return {
          isReady: allAssigned,
          isCorrect,
          userAnswer,
          correctAnswer: dragCorrectSummary(item),
          explain: item.explain || "Sort each card under the best auxiliary lane."
        };
      },
      disable: () => {
        this.itemWorkspace.querySelectorAll("select").forEach((sel) => (sel.disabled = true));
      }
    };
  }

  checkNonChoiceAnswer() {
    if (this.answered) return;
    if (!this.currentController || typeof this.currentController.check !== "function") return;
    const item = this.items[this.index];
    const check = this.currentController.check();
    if (!check.isReady) {
      this.setFeedback("feedback-warn", "Not yet", "Complete the item before checking.");
      return;
    }
    this.finalizeAnswer({
      item,
      isCorrect: check.isCorrect,
      userAnswer: check.userAnswer,
      correctAnswer: check.correctAnswer,
      explain: check.explain
    });
  }

  clearCurrentInput() {
    if (this.answered) return;
    if (this.currentController && typeof this.currentController.clear === "function") {
      this.currentController.clear();
    }
  }

  finalizeAnswer(payload) {
    if (this.answered) return;
    this.answered = true;

    const item = payload.item;
    const isCorrect = Boolean(payload.isCorrect);
    const responseTimeMs = Date.now() - this.currentItemStartedAt;

    if (isCorrect) {
      this.score += 1;
      this.streak += 1;
      this.bestStreak = Math.max(this.bestStreak, this.streak);
      this.setFeedback(
        "feedback-ok",
        "Correct",
        `${escapeHtml(payload.explain || "Good work.")}<br><small>Keep the same pattern on the next item.</small>`
      );
    } else {
      this.streak = 0;
      this.setFeedback(
        "feedback-warn",
        "Not yet",
        `${escapeHtml(payload.explain || "Review the rule and try the next one.")}<br><small>Correct answer: ${escapeHtml(
          payload.correctAnswer || ""
        )}</small>`
      );
      this.missed.push({
        prompt: item.prompt || "",
        context: item.context || item.sentence || "",
        userAnswer: payload.userAnswer || "(blank)",
        correctAnswer: payload.correctAnswer || "",
        explain: payload.explain || ""
      });
    }

    this.checkBtn.disabled = true;
    this.clearBtn.disabled = true;
    this.nextBtn.classList.remove("is-hidden");
    if (this.currentController && typeof this.currentController.disable === "function") {
      this.currentController.disable();
    }
    if (this.game.gameType === "multiple_choice") {
      this.itemWorkspace.querySelectorAll(".choice-btn").forEach((btn) => {
        btn.disabled = true;
      });
    }

    track("mission_item_answer", {
      mission_id: this.mission.id,
      subskill_id: this.subskill.id,
      game_id: this.game.id,
      item_id: item.id,
      correct: isCorrect,
      response_time_ms: responseTimeMs,
      game_type: this.game.gameType
    });

    this.syncTopStats();
  }

  goNext() {
    if (!this.answered) return;
    this.index += 1;
    this.renderCurrentItem();
  }

  finish(reason) {
    if (this.hasCompleted) return;
    this.hasCompleted = true;
    this.stopTimer();

    const accuracy = Math.round((this.score / Math.max(1, this.items.length)) * 100);
    const next = getNextGamePointer(this.mission, this.subskill.id, this.game.id);
    const hubUrl = buildHubUrl(this.mission);

    track("mission_game_complete", {
      mission_id: this.mission.id,
      subskill_id: this.subskill.id,
      game_id: this.game.id,
      score: this.score,
      item_count: this.items.length,
      accuracy,
      reason: reason || "completed"
    });

    const missedHtml = this.missed.length
      ? `
          <ul class="missed-list">
            ${this.missed
              .map(
                (row) => `
                <li>
                  <p><strong>Prompt:</strong> ${escapeHtml(row.prompt)}</p>
                  <p><strong>Context:</strong> ${escapeHtml(row.context)}</p>
                  <p><strong>Your answer:</strong> ${escapeHtml(row.userAnswer)}</p>
                  <p><strong>Correct answer:</strong> ${escapeHtml(row.correctAnswer)}</p>
                </li>
              `
              )
              .join("")}
          </ul>
        `
      : `<p class="perfect-run">Perfect run. No missed items.</p>`;

    this.root.innerHTML = `
      <section class="mission-hero mission-hero-result">
        <p class="hero-eyebrow">Mission Results</p>
        <h1>${escapeHtml(this.game.title)} complete</h1>
        <p class="hero-subline">${escapeHtml(this.subskill.title)} | ${this.score}/${this.items.length} correct (${accuracy}%)</p>
      </section>

      <section class="results-board">
        <div class="result-metrics">
          <article class="result-card"><h2>Score</h2><p>${this.score}/${this.items.length}</p></article>
          <article class="result-card"><h2>Accuracy</h2><p>${accuracy}%</p></article>
          <article class="result-card"><h2>Best streak</h2><p>${this.bestStreak}</p></article>
        </div>

        <article class="review-panel">
          <h3>Review missed items</h3>
          ${missedHtml}
        </article>

        <div class="action-row result-actions">
          <button type="button" class="gsm-btn gsm-btn-primary" id="retryGameBtn">Try again</button>
          ${
            next
              ? `<button type="button" class="gsm-btn gsm-btn-primary" id="nextGameBtn">Next game</button>`
              : `<button type="button" class="gsm-btn gsm-btn-primary" id="backHubBtn">Back to Mission Hub</button>`
          }
          <button type="button" class="gsm-btn gsm-btn-soft" id="exitHubBtn">Exit to Hub</button>
        </div>
      </section>
    `;

    const retryBtn = this.root.querySelector("#retryGameBtn");
    const nextBtn = this.root.querySelector("#nextGameBtn");
    const backHubBtn = this.root.querySelector("#backHubBtn");
    const exitHubBtn = this.root.querySelector("#exitHubBtn");

    retryBtn.addEventListener("click", () => this.resetAndRestart());
    if (nextBtn && next) {
      nextBtn.addEventListener("click", () => {
        window.location.href = buildPlayUrl(next);
      });
    }
    if (backHubBtn) {
      backHubBtn.addEventListener("click", () => {
        window.location.href = hubUrl;
      });
    }
    exitHubBtn.addEventListener("click", () => {
      window.location.href = hubUrl;
    });

    if (this.onExit) {
      this.onExit({
        accuracy,
        score: this.score,
        total: this.items.length
      });
    }
  }

  resetAndRestart() {
    this.stopTimer();
    this.index = 0;
    this.score = 0;
    this.streak = 0;
    this.bestStreak = 0;
    this.answered = false;
    this.missed = [];
    this.hasCompleted = false;
    this.timerSeconds = this.initialTimerSeconds;
    this.start();
  }
}

export function startMissionGame(config) {
  const engine = new MissionGameEngine(config);
  engine.start();
  return engine;
}
