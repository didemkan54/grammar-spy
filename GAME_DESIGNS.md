# Grammar Spy™ — 4 New Mini-Games Design Document

## Shared Design Tokens (Teal Theme)
```css
--gs-navy: #0b1020;
--gs-mid: #16223a;
--gs-teal: #1f5f63;
--gs-teal-light: #e8f4f5;
--gs-light: #f2f4f7;
--gs-line: #d9dee6;
--gs-slate: #4a5568;
--gs-gold: #c9a227;
--gs-ok: #1f8f63;
--gs-ok-bg: #edf9f3;
--gs-bad: #b04444;
--gs-bad-bg: #fdf3f3;
```

## Shared UI Components
- Onboarding modal (3-step how-to-play, difficulty badge, tip)
- HUD bar (case/accuracy/streak/timer)
- Progress bar (teal-to-gold gradient)
- Feedback strip (green/red left-border)
- Option buttons with A/B/C/D circle labels
- Mission Report overlay

---

## Game A: Timeline Clash
**Target:** Past Simple vs Past Continuous in interrupted-action scenes
**Visual:** Interactive timeline showing background action + interrupting event

### Why It Works
Retrieval practice with spaced variation — each round presents a different real-life interrupted-action scene (fire drill during class, phone ringing during cooking, etc.) so students can't memorize answers. Dual coding via the timeline visual (ongoing action = wide bar, interruption = sharp marker) reinforces the conceptual difference. Worked examples in Rookie mode show the timeline pre-filled with labels, fading to blank timelines in Director mode. Desirable difficulty in Director mode requires students to BUILD the sentence, not just pick it.

### Student Flow
1. Scene card appears: "Maya was presenting her project when the fire alarm rang."
2. Timeline visual shows: long teal bar (ongoing) with gold marker (interruption point)
3. **Rookie:** Pick the correct sentence from 4 options (timeline pre-labeled)
4. **Field Agent:** Drag verb forms into blanks in the sentence (timeline shows but no labels)
5. **Director:** Build the full sentence from word tiles (timeline is blank, student must reason)
6. Immediate feedback: correct verb highlighted green on timeline, explanation of why
7. 6-12 rounds, Mission Report at end

### Scoring
- Base: 100 pts per correct answer
- Speed bonus: +50 pts if answered within 5s (timed mode)
- Streak bonus: +20 per consecutive correct
- Hint penalty: -30 pts per hint used

---

## Game B: Subject Spotter
**Target:** Subject-Verb Agreement with tricky noun phrases
**Visual:** Sentence with highlighting — true subject glows teal, distractors dimmed

### Why It Works
Cognitive load management — the visual highlight draws attention to the TRUE subject, separating it from prepositional phrases and other noise. Interleaving across sentence types (collective nouns, "neither...nor", "a list of...") prevents pattern-matching shortcuts. Error-based learning via feedback that shows WHY the verb must match the highlighted subject, not the nearest noun.

### Student Flow
1. Scene card: a school announcement, text message, or classroom rule
2. Sentence appears with the subject phrase highlighted in teal
3. **Rookie:** Subject is pre-highlighted; pick the correct verb form (is/are, was/were, has/have)
4. **Field Agent:** Student must first CLICK the true subject, then pick the verb
5. **Director:** No highlights — student clicks subject AND picks verb, then writes a brief reason
6. Feedback shows the subject highlighted with an arrow to the verb, plus rule explanation

---

## Game C: Article Scanner
**Target:** Articles (a/an/the/Ø) in realistic contexts
**Visual:** Specificity meter (generic → specific) + noun category icons

### Why It Works
Dual coding via the specificity meter (a sliding scale from "any" to "the specific one") makes the abstract concept of definiteness concrete. Spaced variation rotates through real contexts (cafeteria menu, school announcements, lab instructions, text messages) so students encounter articles in natural usage. Progressive disclosure in Rookie mode shows the meter pre-set; Director mode requires students to reason about specificity themselves.

### Student Flow
1. Context card: "Cafeteria announcement: ___ pizza will be served at lunch today."
2. Specificity meter appears below (slider from "Any/General" to "Specific/Known")
3. **Rookie:** Meter pre-positioned; choose a/an/the/Ø from 4 buttons
4. **Field Agent:** Position the meter first, then choose the article
5. **Director:** Fill in articles for 3 blanks in a paragraph, justify one choice
6. Feedback shows the noun category (countable/uncountable, first mention/known) + rule

---

## Game D: Clause Linker
**Target:** Relative Clauses (who/which/that/where)
**Visual:** Sentence zoom tool — shows how the clause attaches to the noun

### Why It Works
Worked examples → fading: Rookie mode shows the clause connection with arrows and labels, which fade in Field Agent mode. The "zoom" animation that expands a noun into its clause makes the abstract grammar structure visible (dual coding). Desirable difficulty in Director mode requires students to COMBINE two simple sentences into one using a relative clause, building production skill not just recognition.

### Student Flow
1. Scene card: two related sentences about a school event
2. **Rookie:** Sentences shown with noun highlighted; pick who/which/that/where to connect them (zoom animation shows attachment)
3. **Field Agent:** Drag the relative pronoun into the correct position in a combined sentence
4. **Director:** Given two sentences, TYPE the combined sentence with a relative clause
5. Zoom animation: the modified noun expands to reveal the clause nested inside
6. Feedback shows the clause structure with labels (noun → relative pronoun → clause)

---

## File Structure
```
/workspace/
  games/
    timeline-clash.html      (Game A)
    subject-spotter.html     (Game B)
    article-scanner.html     (Game C)
    clause-linker.html       (Game D)
  game-ui.css                (shared styles - already exists)
  game-sound.js              (shared sounds - already exists)
  gs-animations.js           (shared animations - already exists)
```

## Analytics Events
- `game_start` — {game, difficulty, count, timer}
- `round_submit` — {game, round, correct, timeSpent, hintUsed}
- `hint_used` — {game, round, hintLevel}
- `game_end` — {game, accuracy, score, streak, duration}
