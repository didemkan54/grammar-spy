# Grammar Spy™

Mission-based grammar training web app for ELD/ELA classrooms. Pure static site — no framework, no build step, no package manager.

## Cursor Cloud specific instructions

### Architecture

- **Static HTML/CSS/JS** — 40+ HTML pages, vanilla JavaScript, no React/Vue/Angular, no bundler.
- **No `package.json`** — there are zero npm dependencies for the frontend. The only server-side code is `verify-session.js` (a Vercel serverless function for Stripe verification), which is optional.
- **All state is in localStorage** — no database, no backend auth.
- Layout components (`header`, `footer`, `sidebar`) are loaded via `layout-loader.js` using `fetch()` from a `components/` directory. If those files are missing, hardcoded fallback HTML is used.

### Running locally

Serve the workspace root with any static HTTP server. `file://` protocol will not work because `layout-loader.js` uses `fetch()`.

```
serve /workspace -l 3000 --no-clipboard &
```

**Do NOT use the `-s` (SPA) flag** — it causes all clean-URL routes to return `index.html` instead of their actual HTML files.

Open `http://localhost:3000/` in Chrome. The welcome modal dismisses via the "Continue to site" button or by clicking the backdrop.

### Key pages to verify

| Page | URL |
|---|---|
| Homepage | `/` |
| Packs/Missions | `/packs.html` |
| Error Smash game | `/error-smash.html` |
| Auth | `/auth.html` |
| Pricing | `/pricing.html` |

### Lint / Test / Build

This project has **no linter, no test framework, and no build step** configured. There are no `eslint`, `prettier`, `jest`, or similar tools. Changes are validated by manually loading pages in a browser.

### Stripe (optional)

The `/api/verify-session` endpoint (`verify-session.js`) requires `STRIPE_SECRET_KEY` as an environment variable and the `stripe` npm package. This is only relevant when deploying to Vercel or testing payment verification locally via `vercel dev`.
