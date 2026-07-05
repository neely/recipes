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
- Reference implementation: harissa-chicken-thighs.html

## ✓ Phase 2 — Repo setup
- Files pushed to neely/recipes via GitHub API
- Cloudflare pointed at recipes.benneely.com
- recipe-template.html, recipes.js manifest, PROJECT_INSTRUCTIONS.md committed
- README, NOTES, PLAN added

## Phase 3 — Index / landing page
- Build index.html that reads recipes.js and renders recipe cards
- Each card: title, tags, prep+cook time, serves, skill level, link to recipe
- Sorting: by tag, cook time, date added (client-side JS, no server)
- Mobile-first card layout, consistent with recipe page aesthetic

## Phase 4 — style.css extraction
- Extract shared design tokens and base styles into style.css
- Update all recipe pages to `<link rel="stylesheet" href="../style.css">`
- Do this after 2–3 recipes exist so the shared shape is clear
- Recipes stay self-contained in data (INGREDIENTS, COOK_STEPS, DIRECTIONS)

## Phase 5 — Recipe ingestion
- Ongoing: add recipes one at a time via Claude Project
- Each session: paste/upload recipe source → agree on units/groupings/steps → publish
- Add entry to recipes.js with each new recipe

## Future / if needed
- **Print view** — scope to Recipe tab only (currently shows all panels)
- **`scalable: false`** — flag non-scaling ingredients (salt to taste, oil for frying)
- **Offline / PWA** — service worker if kitchen wifi is unreliable
- **Last made / frequency** — track which recipes get used most (would need localStorage or a backend)
