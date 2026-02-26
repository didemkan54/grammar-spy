function asList(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeOptions(item) {
  if (Array.isArray(item.options) && item.options.length) return item.options.slice();
  if (Array.isArray(item.fragments) && item.fragments.length) {
    return item.fragments.map((fragment) => fragment.text || String(fragment));
  }
  return [];
}

function isCorrect(item, optionValue) {
  if (typeof item.correctAnswer === "string") return optionValue === item.correctAnswer;
  if (Array.isArray(item.correctAnswer)) return item.correctAnswer.includes(optionValue);
  if (item.correctAnswer && typeof item.correctAnswer === "object" && item.correctAnswer.value) {
    return item.correctAnswer.value === optionValue;
  }
  return false;
}

export function createPlaceholderGame({ mountNode, onAnswer, onReadyForInput }) {
  if (!mountNode) throw new Error("mountNode is required");

  let optionButtons = [];
  let locked = false;

  function lock(value) {
    locked = value;
    optionButtons.forEach((btn) => {
      btn.disabled = locked;
      btn.setAttribute("aria-disabled", String(locked));
    });
  }

  function bindKeyboard() {
    window.addEventListener("keydown", (event) => {
      if (locked) return;
      const keyToIndex = { 1: 0, 2: 1, 3: 2, 4: 3 };
      if (event.key in keyToIndex) {
        const index = keyToIndex[event.key];
        const target = optionButtons[index];
        if (target) target.click();
      }
    });
  }

  function render(item, context) {
    const options = normalizeOptions(item);
    const chips = asList(item.targetSkillTags).map((tag) => `<span class="gs-chip">${tag}</span>`).join("");
    mountNode.innerHTML = `
      <article class="gs-card">
        <h3 class="gs-card-title">Action Panel</h3>
        <p class="gs-card-sub">${item.context || "Mission signal line"}</p>
        <p style="font-size: 1.04rem; line-height: 1.5; margin: 10px 0 0;">${item.sentence}</p>
        <div class="gs-chip-row" style="margin-top: 10px;">${chips}</div>
        <div class="gs-grid" style="margin-top: 12px;" id="optionWrap"></div>
        <p class="gs-kbd-hint" style="margin-top: 10px;">
          Keyboard support: keys 1-4 choose options.
        </p>
      </article>
    `;

    const optionWrap = mountNode.querySelector("#optionWrap");
    optionWrap.innerHTML = options
      .map(
        (option, index) => `
          <button class="gs-btn" type="button" data-option-index="${index}" aria-label="Option ${index + 1}">
            <b>${index + 1}.</b> ${option}
          </button>
        `
      )
      .join("");

    optionButtons = Array.from(optionWrap.querySelectorAll("[data-option-index]"));
    lock(false);

    optionButtons.forEach((button) => {
      button.addEventListener("click", () => {
        if (locked) return;
        lock(true);
        const selectedIndex = Number(button.dataset.optionIndex);
        const selectedValue = options[selectedIndex];
        const correct = isCorrect(item, selectedValue);
        onAnswer({
          item,
          selectedIndex,
          selectedValue,
          correct,
          options,
          context
        });
      });
    });
    onReadyForInput?.();
  }

  bindKeyboard();
  return { render, lock };
}
