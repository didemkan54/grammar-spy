# Grammar Spy™ Game System — Structured Implementation Plan

## 1) Product Vision

Grammar Spy is a research-informed grammar training platform for middle and high school learners.  
Design goals:

- Retrieval practice over passive exposure
- Low extraneous cognitive load
- Interleaving for durable retention
- Actionable feedback that teaches reasoning
- Teacher-operable controls for classroom deployment

## 2) Technical Architecture

### Folder layout

```text
/games/
  /timeline-intercept/
    index.html
    timeline-intercept.css
    timeline-intercept.js
    timeline-intercept-sound.js
  IMPLEMENTATION_PLAN.md

/packs/
  timeline-intercept-pack01.json
  (future packs for all games)

/assets/
  /sounds/
    README.md
    soft-click.placeholder
    correct-chime.placeholder
    fail-tap.placeholder
    drag-whoosh.placeholder
```

### Runtime model

- **Pack-driven data**: JSON sentence packs with metadata, difficulty tags, and explanations
- **Game engine per title**: vanilla JS modules with shared conventions (score, streak, feedback, summary)
- **Sound controller**: non-blocking audio layer with graceful fallback
- **Teacher controls**: pack selector, difficulty, question count, sound toggle, fullscreen toggle

## 3) UI/UX Standards

- Palette:
  - Background: `#0b1020`
  - Panel: `#16223a`
  - Accent: soft teal / soft gold
- Large readable type, restrained animation, low-clutter layout
- Consistent top control strip + central play area + summary overlay
- Clear mode objective shown before and during play

## 4) Pedagogy Implementation Rules

1. **Every round** must include:
   - Decision
   - Explanation
   - Next action
2. **Feedback language**:
   - Explain grammar logic ("why"), not just correctness
3. **Error analytics**:
   - Track mistake patterns by concept category
4. **Summary**:
   - Accuracy, score, streak, common mistakes, suggested review target

## 5) Game-by-Game Build Plan

### Game 1 — Timeline Intercept (implemented in this iteration)

- Drag fragments into:
  - Ongoing Action (past continuous)
  - Interrupting Action (past simple)
- Difficulty:
  - Rookie: verb hints on
  - Field: no hints
  - Director: multi-ongoing cases
- Feedback:
  - Teal glow + explanation on success
  - Red pulse + explanation on error

### Game 2 — Error Intelligence

- Click incorrect word(s), then provide correction
- Progressive complexity by difficulty
- Replayable explanation pathway ("See why this is wrong")
- Error taxonomy logging: auxiliary misuse, tense mismatch, agreement errors

### Game 3 — Retrieval Raid

- Interleaved tense retrieval in contextual cloze
- Optional timer multiplier (off in Director mode)
- Every 5 items: micro-report with error pattern and suggested review

### Game 4 — Logic Lock

- Two-step cognition:
  1) Select rule logic
  2) Apply verb form
- Digital lock progression tied to rule accuracy
- Unlock animation as milestone reinforcement

### Game 5 — Agent Builder

- Productive sentence construction from visual prompt
- Required structure constraints (tense + connector pattern)
- Pattern validator for structural grammar quality
- Supports guided bank mode and free-typing advanced mode

## 6) Data Contract (JSON Pack Spec)

```json
{
  "packId": "timeline-intercept-pack01",
  "title": "Retell Timeline Foundations",
  "version": 1,
  "items": [
    {
      "id": "ti-001",
      "sentence": "She was studying when the lights went out.",
      "difficultyTags": ["rookie", "field"],
      "directorReady": false,
      "fragments": [
        { "id": "f1", "text": "She was studying", "role": "ongoing" },
        { "id": "f2", "text": "when the lights went out", "role": "interrupting" }
      ],
      "hint": "Look for was/were + verb-ing for background action.",
      "explanation": "Past continuous sets the background. Past simple marks the interruption.",
      "mistakeCategory": "timeline_contrast"
    }
  ]
}
```

## 7) Classroom Operational Notes

- Question amount presets: 6 / 8 / 10 / 12
- End Game available at any time
- Fullscreen mode for projector use
- Sound can be disabled with one toggle

## 8) Testing Strategy

- Syntax checks for JS modules
- Manual functional checks:
  - drag/drop assignment
  - scoring and streak updates
  - difficulty filtering
  - end summary analytics
  - fullscreen + responsive behavior

