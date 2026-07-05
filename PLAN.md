# Recipes — Roadmap

Live at **recipes.benneely.com** · Repo: github.com/neely/recipes

---

## Working conventions
- Keep README.md in sync with what's actually live
- Update NOTES.md when design decisions are made or changed
- Check off phases here as work is completed

---

## ✓ Phase 1 — Recipe format design
- Three-tab layout: Recipe / Mise en Place / Cook
- Scalable ingredient quantities with fraction display
- Unit escalation (tsp→tbsp→cup) — clean fractions only, American units
- Cook step segment schema (ingredient refs re-render on scale change)
- Mise en Place checklist with progress bar and reset
- Cook mode: dark panel, swipe nav, sticky bottom bar, progress bar
- Reference implementation: king-ranch-chicken.html

## ✓ Phase 2 — Repo setup
- Files pushed to neely/recipes via GitHub API
- Cloudflare pointed at recipes.benneely.com
- recipe-template.html, recipes.js manifest, PROJECT_INSTRUCTIONS.md committed
- README, NOTES, PLAN added

## ✓ Phase 3 — Index / landing page
- Build index.html that reads recipes.js and renders recipe cards
- Each card: title, tags, prep+cook time, serves, skill level, link to recipe
- Sorting: by tag, cook time, date added (client-side JS, no server)
- Mobile-first card layout, consistent with recipe page aesthetic

## ✓ Phase 3.5 — Engine improvements
- Implemented `scalable: false` + `label` field (per-ingredient, not per-recipe) — applied to renderQty() in both recipe-template.html and king-ranch-chicken.html
- Formalized `image` field in recipes.js manifest — path convention, 4:3 aspect ratio, fallback card design
- Added Screen Wake Lock to every recipe page — mobile-first requirement, phone shouldn't sleep mid-cook

## ✓ Phase 4 — style.css + shared engine extraction
- Extracted shared design tokens and base styles into `style.css`, linked from every recipe page as `../style.css`
- Extracted the full render engine (scaling, `renderQty`/`ingSpan`, tabs, mise, cook mode, wake lock) into `recipe-engine.js`, loaded as `../recipe-engine.js`
- Each recipe file is now just its HTML skeleton + `INGREDIENTS`/`COOK_STEPS`/`DIRECTIONS`/`BASE_SERVES` — king-ranch-chicken.html went from 393 lines to 210; recipe-template.html from 759 to 158
- `index.html` also links `style.css` for its design tokens, dropping its own duplicate `:root` block
- Any future engine bugfix or feature is now a single-file change instead of a per-recipe hand-edit

## Phase 5 — Recipe ingestion
- Ongoing: add recipes one at a time via Claude Project
- Each session: paste/upload recipe source → agree on units/groupings/steps → publish
- Add entry to recipes.js with each new recipe

## Future / if needed
- **Print view** — scope to Recipe tab only (currently shows all panels)
- **Offline / PWA** — service worker if kitchen wifi is unreliable
- **Last made / frequency** — track which recipes get used most (would need localStorage or a backend)
