# AGENTS.md

## Cursor Cloud specific instructions

### Overview

Grammar Spy™ is a static website (PWA) for mission-based grammar training. There is **no build system, no package manager, and no installable dependencies**. All pages are plain HTML; all logic is vanilla JavaScript (browser IIFEs); all state is in browser `localStorage`.

### Running locally

Serve the repo root with any static HTTP server:

```bash
python3 -m http.server 8080
# then open http://localhost:8080/
```

The site is fully functional locally except for the Stripe payment-verification endpoint (`/api/verify-session`), which requires the Vercel serverless runtime and a `STRIPE_SECRET_KEY` env var. This is optional; the site gracefully falls back to `paid: false`.

### QA / testing

The only automated test is the grammar round-bank audit:

```bash
node games/qa/round-bank-audit.mjs
```

This validates the structural integrity and content quality of all grammar question banks. Exit code 0 = pass.

There is no linter, type checker, or other automated tooling configured for this project.

### Key files

| File | Purpose |
|---|---|
| `index.html` | Homepage |
| `mission-game-shell.js` | Core game engine (~2700 lines) |
| `grammar-context-bank.js` | Grammar question data bank |
| `verify-session.js` | Vercel serverless function (Stripe) |
| `games/qa/round-bank-audit.mjs` | QA audit script |
| `DEPLOY.md` | Deployment guide (GitHub → Vercel) |

### Gotchas

- No `package.json` exists. Do not run `npm install` or similar — there are no Node dependencies to install for the client app.
- The `verify-session.js` file uses `require('stripe')` — this only runs in Vercel's serverless runtime, not locally.
- All user data (auth sessions, billing state, game progress) lives in `localStorage` under `gs_*` keys. There is no database.
- The `components/` directory referenced by `layout-loader.js` does not exist in the repo; the loader has inline fallback HTML for header/footer.
