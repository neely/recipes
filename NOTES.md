# Recipes — Notes & Backlog

## Current recipes (live in /recipes/)
- **king-ranch-chicken.html** — King Ranch Chicken Casserole. Tex-Mex, chicken, casserole, crowd. 30 min prep / 1 hr cook / serves 12 / medium. Reference implementation; harissa chicken thighs retired in favor of this one.

## Recipe backlog
*(Recipes to add — drop a source here when ready to build)*

## Design decisions (locked)

### Three-tab layout
- Tab 1: Recipe (title, meta, scale, intro, ingredients, directions, print)
- Tab 2: Mise en Place (checkable list, progress bar, reset)
- Tab 3: Cook (dark mode, swipe steps, sticky nav)
- Tabs are the only sticky chrome — one line. Title/meta/scale live in the Recipe panel and scroll away.

### Scale
- Selector lives at the top of the Recipe panel (not sticky) — set it once before you start
- Options: ½× 1× 2× 3×
- No mid-cook scale change needed; go back to Recipe tab to change
- Serves count updates in the title block

### Unit escalation
- Only escalates when result is a clean whole number or recognized fraction (⅛ ¼ ⅓ ½ ⅔ ¾)
- tsp → tbsp at multiples of 3 (3 tsp = 1 tbsp)
- tbsp → cup at multiples of 16, but in practice escalates at 4 tbsp = ¼ cup
- Never escalates to an ugly decimal — stays in original unit if result isn't clean
- All quantities stored in American units; no metric

### Cook step behavior
- Step position persists when switching tabs (intentional — easy to swipe back)
- No explicit reset needed; nav arrows always visible
- Dark panel fills full viewport height (min-height: 100svh - tab bar)
- Sticky nav at bottom — visible without scrolling on short steps; waits at bottom on long ones
- Step label "Step N of M" at 14px DM Mono — readable, not squint-worthy

### Ingredient schema
```javascript
{ group: "Section",  // "" if no groups
  qty:   1.5,        // base (1×) amount, always numeric
  unit:  "tsp",      // canonical unit or "" for countable items
  name:  "ingredient name, prep note" }
```

### Cook step segment schema
```javascript
{ t:"t", v:"plain text" }
{ t:"i", i:INDEX, frac:1 }   // ingredient ref
{ t:"s", v:"bold technique" } // strong/white emphasis
```

### Ingredient grouping
- Use source recipe's grouping if present (e.g. Chicken / Sauce / Finish)
- Default to flat (no groups) if source doesn't group
- Never invent groups that aren't in the original

### Non-scalable ingredients (implemented)
- Per-ingredient flag, not per-recipe — any recipe can mix scalable and non-scalable lines
- `scalable: false` + `label` string ("To taste", "For frying") displays in place of computed qty/unit, everywhere the ingredient renders (Recipe tab, Mise, Cook steps)
- King Ranch Chicken has none currently; harissa (retired) would have used this for "salt to taste"-type lines
- Examples: "salt to taste", "oil for frying", "water as needed"

### Favicon / Home Screen icon (locked)
- Recipe notecard with a filing tab on top, rust background, cream card, ink border/tab, rust title bar + ruled lines
- Full-bleed square (no pre-rounded corners) — iOS applies its own rounding on Add to Home Screen
- Files: `apple-touch-icon.png` (180×180), `favicon.ico` (16/32/48), `favicon-32x32.png` fallback
- Linked with an absolute path (`/apple-touch-icon.png` etc.) so it works identically from root and from `/recipes/`
- Linked in every page's `<head>` — index, template, and each recipe file — since any page could be the one someone adds to their Home Screen

### Recipe source (locked)
- Optional `SOURCE` constant per recipe — plain text ("Grandma Neely") or a URL, auto-detected
- URLs render as a link shortened to just the domain; plain text renders as-is
- Byline placement: just above the intro paragraph, below the title block
- King Ranch Chicken sources to homesicktexan.com (Lisa Fain)
- Optional `image` field in `recipes.js`, path `images/[slug].jpg`, 4:3 aspect ratio target ~1200×900px
- Index card only, for now — not surfaced on the recipe page itself
- No image → card falls back to dark background + italic Playfair first-letter, no broken-image icon

### Screen Wake Lock (locked)
- Core mobile requirement — phone must not sleep mid-recipe
- Requested on load via `navigator.wakeLock`, releases when tab hidden, re-acquires on visibility change
- Silent no-op if unsupported/denied, no fallback UI
- Lives in `recipe-engine.js` — shared, not per-recipe (see Phase 4 below)

## Open questions / future work
- **Print styles** — currently hides tabs and scale row; shows all three panels. Should probably only print Recipe tab. Revisit when someone actually uses it.
- **Recipe photo on the recipe page itself** — `image` field currently only renders on the index card, not on the recipe page. Not planned, just noted.

## Working conventions
- README stays in sync with what's actually live
- NOTES is the research scratchpad — add decisions here when made
- PLAN tracks phases; check off as done
- Recipe slugs match the filename: `king-ranch-chicken` → `recipes/king-ranch-chicken.html` + entry in `recipes.js`
- **Hosting is Cloudflare Pages only.** Native GitHub Pages was enabled by default early on, causing duplicate/redundant deploys and confusing build-status noise; it's been explicitly unpublished (2026-07-06). If Pages settings ever look "on" again, turn them back off — Cloudflare is the single source of truth for the live site.
