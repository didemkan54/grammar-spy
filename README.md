# Grammar Spy™ Learning Engine (Mission Architecture + XP Core)

This implementation adds a mission-based learning engine in vanilla HTML/CSS/JS with three connected systems:

1. **Cognitive Progression Map** (Grades 6–12)
2. **Scalable Mission Architecture** (manifest + JSON missions + loader)
3. **Ultimate XP Progression** (rank logic + skill mastery + intelligence reports)

All new UI and code uses **mission terminology**.

---

## 1) How to Add a New Mission

### Step A — Create mission JSON

Create a file in `/missions/<track>/levelX.json` using this required schema:

```json
{
  "missionId": "mission-unique-id",
  "missionName": "Mission: Name",
  "missionBrief": "1-2 sentence brief",
  "grammarFocus": "Focus label",
  "gradeBand": "6-7",
  "cognitiveLevel": 1,
  "skills": ["skill_tag_a", "skill_tag_b"],
  "retrievalType": "blocked",
  "estimatedCognitiveLoad": "low",
  "difficultyTiers": {
    "rookie": ["item-01", "item-02"],
    "field": ["item-01", "item-02", "item-03"],
    "director": ["item-02", "item-03"]
  },
  "items": [
    {
      "id": "item-01",
      "context": "optional context",
      "sentence": "Prompt sentence",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "B",
      "targetSkillTags": ["skill_tag_a"],
      "explanation": "Short student-friendly explanation",
      "commonErrors": [{ "pattern": "error_key", "message": "feedback message" }],
      "metadata": {
        "timeMarkers": ["while"],
        "clauseCount": 2,
        "irregularVerbFlag": false
      }
    }
  ]
}
```

### Step B — Register mission in manifest

Add a row to `/missions/manifest.json`:

- `missionId`
- `path`
- filtering metadata (`gradeBand`, `cognitiveLevel`, `skills`, `retrievalType`, etc.)

The mission library and progression pages read from this manifest.

### Step C — Verify in UI

Open:

- `/missions.html` to confirm filters + launch card
- `/progression.html` to confirm cognitive map placement

---

## 2) How to Add a New Game

The launch entry is:

- `/games/launch.html`

Runtime launcher shell:

- `/games/launch/launch.html`

Current placeholder module:

- `/games/launch/placeholder-game.js`

### Integration pattern

1. Create a module in `/games/<game-name>/` (or under `/games/launch/` initially).
2. Export a constructor/function that can:
   - render an item
   - emit answer events `{ correct, selectedValue, item }`
3. In `launch.html`, route selected `gameType` to the module.
4. Keep launcher integrations intact:
   - mission content from `missionLoader`
   - XP and mastery from `xpEngine`
   - mission summaries via `analytics`
   - intelligence report modal

This keeps all games aligned with one product shell and one progression system.

---

## 3) How Rank Progression Works

Ranks:

- Cadet
- Rookie Agent
- Field Agent
- Senior Agent
- Director

### XP Formula (per item)

`XP = BASE + (STREAK * 10) + SPEED_BONUS - REPEATED_ERROR_PENALTY`

- BASE correct = 50
- incorrect = 0
- SPEED_BONUS up to +30 when timer is enabled
- repeated error penalty = 15 when the same error type repeats within a mission

### Rank logic (implemented in `/core/xpEngine.js`)

- **Cadet**: complete 1 mission
- **Rookie Agent**: avg accuracy >= 70% across 3 missions
- **Field Agent**: avg accuracy >= 80% and streak >= 5 in at least 2 missions
- **Senior Agent**: avg accuracy >= 85% with decreasing repeated-error rate trend
- **Director**: avg accuracy >= 90% + mastery in at least two level-2 missions and one level-3 mission

### Mastery logic (by skill tag)

Mastered when:

- attempts >= 20
- accuracy >= 85%
- repeated error rate is low (<= 20%)

All profile, mastery, settings, and mission history are stored in localStorage via `/core/storage.js`.

---

## Key Files

- Theme and components: `/core/theme.css`
- Progression map: `/core/progression.js`
- Mission loading/filtering: `/core/missionLoader.js`
- XP + rank + recommendations: `/core/xpEngine.js`
- Profile storage: `/core/storage.js`
- Local analytics: `/core/analytics.js`
- Mission Library UI: `/missions.html`
- Progression UI: `/progression.html`
- Profile UI: `/profile.html`
- Launcher entry: `/games/launch.html`
- Launcher shell: `/games/launch/launch.html`
