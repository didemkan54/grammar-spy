# SEO Page Template System

Grammar Spy SEO landing pages are powered by two reusable files:

- `seo/seo-page-data.js` (content config per slug)
- `seo/seo-page-template.js` (render engine + reusable components)

## Reusable components

- `ActivityList`
- `GrammarTipCard`
- `MissionCTA`
- `TeacherNote`

## Add a new SEO page

1. Add a new entry to `SEO_PAGE_DATA` in `seo/seo-page-data.js`.
2. Create a route folder with `index.html`, for example:
   - `/present-tense-games/index.html`
3. Set `data-seo-page="<slug>"` on `<body>`.
4. Include:
   - `/seo/seo-pages.css`
   - `/seo/seo-page-template.js`
5. Confirm:
   - title + meta description
   - H1 + intro
   - activities
   - mission CTA
   - bottom internal CTA (`Launch Grammar Spy`)

## Seed pages

`SEO_PAGE_SEEDS` includes starter configs for:

- `/grammar-games-middle-school`
- `/present-tense-games`
- `/past-tense-games`
- `/future-tense-games`
- `/no-prep-grammar-games`
- `/esl-grammar-warm-ups`
