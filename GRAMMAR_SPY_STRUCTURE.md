# Grammar Spy System Plan (Implemented)

## Core

- `/core/theme.css` — shared teal design tokens and reusable component classes
- `/core/router.js` — top navigation renderer + route helpers + reduced-motion utility
- `/core/progression.js` — cognitive progression map (Levels 1–3)
- `/core/missionLoader.js` — manifest-driven mission discovery, load, filtering, tier extraction
- `/core/xpEngine.js` — XP formula, mastery updates, rank advancement, recommendations
- `/core/storage.js` — localStorage schema/versioned profile access
- `/core/analytics.js` — local analytics for item events and mission summaries

## Missions

- `/missions/manifest.json` — static manifest for mission metadata
- `/missions/README.md` — mission content conventions
- `/missions/past-simple/level1.json` — sample Level 1 mission
- `/missions/mixed-past/level2.json` — sample Level 2 mission
- `/missions/past-continuous/README.md` — placeholder track
- `/missions/present-vs-continuous/README.md` — placeholder track
- `/missions/narrative-tense-control/README.md` — placeholder track

## App Pages

- `/missions.html` — Mission Library + filters + launch modal + teacher controls
- `/progression.html` — Mission Training Path visualization linked to manifest data
- `/profile.html` — rank, XP, mastery grid, history, recommendations
- `/games/launch.html` — launcher entry page for mission runtime shell
- `/games/launch/launch.html` — launcher shell, mission runtime, intelligence report modal
- `/games/launch/placeholder-game.js` — placeholder game module loaded by launcher

## Notes

- Uses mission terminology in all new systems and UI labels.
- Designed for static hosting (GitHub Pages / Vercel static).
