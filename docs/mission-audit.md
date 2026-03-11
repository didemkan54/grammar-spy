# Grammar Spy Mission Audit (Phase 1)

Date: 2026-02-28  
Scope: Existing mission routes and mission runtimes, with priority on `mission-game-shell.js` routes and current pack launch flow.

## 1) Mission Inventory

### A. Mission shell routes (`mission-game-shell.js`)
- `/error-smash`
- `/past-sort`
- `/narrative-builder`
- `/dialogue-repair`
- `/rewrite-studio`
- `/rule-sprint-present`
- `/signal-decoder-present`
- `/present-case-interview`
- `/be-verb-rule-sprint`
- `/be-verb-agreement-sweep`
- `/be-verb-case-interview`
- `/mission-sequence-lab`
- `/evidence-sort-board`

### B. Other playable mission routes (independent runtimes)
- `/clue-trail` (uses `grammar-context-bank.js`)
- `games/timeline-clash`
- `games/subject-spotter`
- `games/clause-linker`
- `games/article-scanner`
- `games/launch/launch` (manifest-driven path)

## 2) Findings by Audit Criteria

### First 10-second clarity issues
- Mission purpose and grammar focus were not always visible at the top of play space.
- Rule reminder and worked example were missing from most mission starts.
- Progress was visible, but not consistently framed as fixed mastery (exact 15 items).

### Instruction confusion
- Mixed wording across modes (detect / dialogue / sort / rewrite) increased cognitive load.
- Action row labels and flow were inconsistent (e.g., hint + skip, no explicit retry action tied to feedback loop).

### UI consistency gaps
- Core play layout lacked a shared “support panel” pattern for rule + example + glossary.
- Feedback was primarily a short strip, not a structured explanation block.

### Feedback quality gaps
- Correct/incorrect was shown, but “why + correct version + micro-tip” was inconsistent.
- End report lacked explicit top error pattern and mastery progression guidance bands (<70 / 70–84 / >=85).

### ELD barriers
- No global ELD support toggle in mission shell routes.
- No standard sentence frame + glossary reveal behavior.
- No guaranteed simplified prompt variation.

### Rule-mixing issues
- Mission pools could combine variant and base banks, allowing mixed grammar in a single run.
- `rule-sprint-present` mixed affirmative, negative, question, and continuous usage.
- `dialogue-repair` pack variants were short and then merged with broader base items, increasing cross-rule bleed.

## 3) Ranked Issues

### High impact + low risk
1. Enforce fixed 15-item mission length everywhere in shell runtime and launcher params.
2. Add reusable MissionShell scaffold (title, rule reminder, progress, support panel, structured feedback).
3. Add analytics-safe mission lifecycle events and item-level telemetry without breaking existing tracker.

### High impact + medium risk
1. Strictly filter mission content by `grammar_rule_id` (requires bank metadata discipline).
2. Refactor current mixed banks into single-rule banks per progression step.
3. Align non-shell mission runtimes (`clue-trail`, boosters, launch runtime) to same shell/ELD conventions.

### Medium impact + low risk
1. Standardize launcher defaults and links to `count=15`.
2. Add explicit mastery recommendation bands to mission report.
3. Add placeholder mixed review architecture (non-default) to prevent accidental early exposure.

## 4) Top 3 High-Impact / Low-Risk Fixes Implemented Immediately

Implemented in this refactor:

1. **Exact 15-item enforcement**
   - Shell runtime now uses fixed `15` items per mission build.
   - Launcher and sample links updated to pass `count=15`.

2. **MissionShell standard wrapper**
   - Added reusable top bar:
     - `Mission: ...` title
     - one-line rule reminder
     - visible progress (`x/15`)
     - typical time line
   - Added support side panel:
     - rule reminder
     - worked example
     - ELD toggle (On/Off)
     - sentence frame + glossary + hint steps
   - Added structured post-submit feedback panel:
     - Correct / Not Yet
     - Why
     - Correct version
     - Micro-tip
   - Added consistent bottom action sequence:
     - Next
     - Try Again
     - Hint

3. **Analytics-ready mission events**
   - Added:
     - `mission_start`
     - `item_answer`
     - `mission_complete`
     - `mission_exit`
     - `mission_type`
   - Included payload keys:
     - `mission_id`
     - `grammar_rule_id`
     - `mission_type` (`single_rule` / `mixed_review`)
     - `item_id`, `correct`, `hint_used`, `response_time`

## 5) Phase 2 Refactor Coverage in This Iteration

- Built reusable MissionShell behavior in `mission-game-shell.js`.
- Refactored **Simple Present mission** to strict single-rule bank:
  - `simple_present_affirmative`
  - exactly 15 items
- Refactored **Dialogue Repair single-rule version** for `pack02`:
  - `simple_present_affirmative`
  - exactly 15 items
- Added strict bank filtering hooks by `grammar_rule_id`.
- Added mixed-review architecture scaffold (not default; no content populated).

## 6) Remaining Follow-up (Next Safe Pass)

1. Apply the same MissionShell/ELD conventions to non-shell missions (`clue-trail`, boosters, manifest runtime).
2. Add explicit per-item `grammar_rule_id` metadata to all legacy banks.
3. Populate mixed-review banks only from mastered single-rule item pools.
