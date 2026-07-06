# Recipe App — Project Instructions

## What This Is
A personal recipe app hosted as static HTML. No backend, no build step, no dependencies. Each recipe is a thin HTML file — markup plus its own `INGREDIENTS`/`COOK_STEPS`/`DIRECTIONS`/`BASE_SERVES` data — with all shared styling and behavior pulled in from `style.css` and `recipe-engine.js`. The landing page reads a JS manifest to render and sort the recipe index.

## Repo Structure
```
/
├── index.html            ← recipe listing / landing page
├── style.css             ← shared design tokens and base styles
├── recipe-engine.js      ← shared render engine (scaling, tabs, mise, cook mode, wake lock)
├── recipes.js            ← metadata manifest (one entry per recipe)
├── recipe-template.html  ← blank shell for new recipes (data only)
├── images/               ← recipe photos
└── recipes/
    └── [recipe-slug].html
```

## Hosting
- Repo is public on GitHub (`neely/recipes`), deployed via **Cloudflare Pages**, pointed at the `recipes.benneely.com` subdomain — not GitHub Pages, which has been explicitly disabled
- Every push to main triggers an immediate Cloudflare Pages build; typically live within a minute or two
- Landing page: `recipes.benneely.com`
- Recipe pages: `recipes.benneely.com/recipes/[slug].html`
- `style.css` and `recipe-engine.js` are referenced from recipe pages as `../style.css` and `../recipe-engine.js`
- Script order matters: each recipe's inline `<script>` (defining `INGREDIENTS` etc.) must come *before* `<script src="../recipe-engine.js">`, since the engine reads those globals and does its initial render at load time

---

## Design System

### Fonts (Google Fonts)
```
Playfair Display — titles, section headers, cook step body text (italic)
DM Sans — body, directions, mise en place
DM Mono — labels, tags, quantities, scale pills, counters
```

### Color Tokens
```css
--cream:      #f7f3ec   /* page background */
--ink:        #1a1208   /* primary text */
--rust:       #c4440a   /* accent, quantities, active states */
--rust-light: #e8623a   /* cook tab highlights */
--warm-gray:  #8a7f72   /* secondary text, labels */
--border:     #ddd5c4   /* dividers */
--white:      #fffdf8   /* card/panel backgrounds */
--step-bg:    #161009   /* cook tab dark background */
```

### Layout Principles
- Mobile-first, max-width 640px on content panels
- Sticky tab bar is one line only — three tabs, nothing else
- Recipe title, meta, and scale live at the top of the Recipe panel and scroll away
- No persistent header across tabs — the tab bar is the only chrome

---

## Recipe Page Structure

Each recipe HTML is self-contained with three tabs:

### Tab 1 — Recipe
- Title block: tag line, big Playfair title, meta row (prep/cook/total/serves/skill), scale pills
- Intro paragraph (italic, editorial voice)
- Ingredients list (grouped if source recipe groups them, otherwise flat)
- Directions list (ingredient name callouts highlighted in rust, no quantities — quantities live in the ingredient list)
- Print button (hides scale and tabs on print)

### Tab 2 — Mise en Place
- Progress bar + count + Reset button
- Checkable ingredient list with scaled quantities
- Checks persist while navigating between tabs; Reset clears all

### Tab 3 — Cook
- Full dark background (#161009) fills at least the full viewport height
- Each step is a card — natural height, no forced fill
- Step label ("Step 1 of 8") at 14px DM Mono rust, readable size
- Step body in italic Playfair, ingredient references in rust DM Sans bold
- Sticky nav bar at bottom (prev ← / counter / next →) with progress bar at top
- Swipe left/right supported on touch devices
- Step position is NOT reset when switching tabs (intentional)

---

## Ingredient Data Schema

Each ingredient object in a recipe:
```javascript
{ group: "Section Name",  // omit or use "" if recipe has no groups
  qty:   1.5,             // BASE quantity (at 1× scale), always numeric
  unit:  "tsp",           // see unit list below; use "" for countable items
  name:  "kosher salt"    // lowercase, include prep notes ("minced", "thinly sliced")
}
```

Non-scalable ingredient (see below):
```javascript
{ group: "", qty: 0, unit: "", name: "kosher salt", scalable: false, label: "To taste" }
```

### Canonical Units (American)
```
Volume:     tsp, tbsp, cup, fl_oz, pint, quart
Weight:     oz, lb
Countable:  "" (empty string) — e.g. 4 chicken thighs, 3 shallots
Other:      "cloves", "handful", "pinch", "sprig"
```

### Unit Escalation Rules
Escalation only happens when the result is a clean whole number or recognized fraction (⅛ ¼ ⅓ ½ ⅔ ¾). Never escalate to an ugly decimal.

```
tsp  → tbsp  when scaled value ÷ 3 is clean   (3 tsp = 1 tbsp)
tbsp → cup   when scaled value ÷ 16 is clean  (16 tbsp = 1 cup, but 4 tbsp = ¼ cup)
```

Example: 1.5 tsp base at 2× = 3 tsp → escalates to **1 tbsp**
Example: 2 tbsp base at 2× = 4 tbsp → escalates to **¼ cup**
Example: 1.5 tsp base at 1× stays **1½ tsp** (0.5 tbsp is not clean enough)

### Non-Scalable Ingredients
Some ingredients shouldn't scale linearly (e.g. "salt to taste", "oil for frying"). This is a **per-ingredient** flag — any recipe can mix scalable and non-scalable lines; it's not a property of the recipe as a whole.

Flag these with `scalable: false` and provide a `label` string. The label displays in place of a calculated quantity everywhere the ingredient appears — the Recipe tab ingredient list, Mise en Place, and any Cook step that references it via `ingSpan`. `qty` and `unit` are ignored when `scalable` is false but should still be set to `0` and `""` for schema consistency.

```javascript
{ group: "", qty: 0, unit: "", name: "kosher salt", scalable: false, label: "To taste" }
{ group: "", qty: 0, unit: "", name: "vegetable oil", scalable: false, label: "For frying" }
```

Implemented as of Phase 5 (`renderQty()` in the shared engine).

---

## Cook Step Data Schema

Cook steps are arrays of segments rather than hardcoded strings, so ingredient quantities re-render correctly when scale changes.

```javascript
// Segment types:
{ t: "t", v: "plain text string" }
{ t: "i", i: INGREDIENT_INDEX, frac: 1 }   // ingredient ref; frac = fraction of base qty used
{ t: "s", v: "bold technique text" }        // strong emphasis, renders white in cook view
```

Example step:
```javascript
[
  { t:"t", v:"Heat " },
  { t:"i", i:8, frac:1 },
  { t:"t", v:" in a cast-iron skillet over medium-high until shimmering." }
]
```

The `frac` field supports partial ingredient use in a step (e.g. `frac: 0.5` if only half the cheese goes in now).

---

## Recipe Source (optional)

Each recipe file can define a `SOURCE` constant — a byline shown just above the intro paragraph, e.g. "Source: homesicktexan.com" or "Source: Grandma Neely". One field, auto-detected:

```javascript
const SOURCE = "Grandma Neely";                                              // plain text, no link
const SOURCE = "https://www.homesicktexan.com/king-of-casseroles-king-ranch-chicken/";  // URL, renders as a link shortened to the domain
const SOURCE = "";                                                            // omit entirely
```

If it starts with `http://` or `https://` it's treated as a link and shortened to just the domain (no `www.`, no path) for display — the full URL is still the link target. Anything else displays as plain text. Rendered by `renderSource()` in the shared engine; hidden entirely if empty.

---

## Screen Wake Lock (required on every recipe page)

This app's primary use case is mobile, hands-on, at the counter. The phone should not fall asleep mid-recipe. `recipe-engine.js` requests a Screen Wake Lock on load via `navigator.wakeLock`, releases automatically when the tab is backgrounded, and re-acquires it when the tab becomes visible again. Fails silently on unsupported browsers or when denied (e.g. battery saver mode) — no fallback UI, no error shown to the user.

This lives in the shared engine now, not per-recipe — no action needed when adding a new recipe.

---

## recipes.js Manifest

This file is the source of truth for the index page. Add one entry per published recipe.

```javascript
const RECIPES = [
  {
    slug:     "king-ranch-chicken",       // matches filename in /recipes/
    title:    "King Ranch Chicken Casserole",
    tags:     ["chicken", "tex-mex", "casserole", "crowd"],
    prepMins: 30,
    cookMins: 60,
    serves:   12,
    skill:    "medium",
    added:    "2025-07-05",               // ISO date, for sorting
    image:    "images/king-ranch-chicken.jpg",  // optional, see Recipe Images below
  }
];
```

### Recipe Images
The `image` field is optional. Omit it (or leave `""`) for recipes without a photo — the index card falls back to a dark card with the recipe's first letter in italic Playfair, no broken-image icon.

- **Path:** relative to repo root, always under `images/`, named to match the recipe slug — `images/[slug].jpg`
- **Format:** `.jpg`, optimized/compressed before upload (this is a static site with no build step or image pipeline — whatever's committed is what ships)
- **Dimensions:** shoot or crop close to a **4:3 aspect ratio**; the index card enforces `aspect-ratio: 4/3` with `object-fit: cover`, so anything else gets cropped to fit. 1200×900px is a good target — large enough for retina, small enough to stay fast on mobile data
- **Where it's used:** currently only the index page card. Not yet surfaced on the recipe page itself (open item, not planned)

---

## Workflow: Adding a New Recipe

1. Copy `recipe-template.html` → `recipes/[new-slug].html`
2. Fill in the `INGREDIENTS` array and `COOK_STEPS` array
3. Fill in `DIRECTIONS` (static HTML strings, name callouts only, no quantities)
4. Update title block, meta row, intro paragraph
5. Fill in `SOURCE` if there is one (plain text or URL, see schema above), or leave `""` to omit
6. If a photo is provided, save/crop to `images/[slug].jpg` and add the `image` field to its `recipes.js` entry
7. Add one entry to `recipes.js`
8. Commit and push — Cloudflare Pages deploys automatically

### Ingestion Process (in Claude Project)
When bringing in a new recipe:
- Agree on ingredient groupings (use source recipe's grouping if present)
- Confirm all quantities are in American units
- Flag any non-linear ingredients (salt to taste, oil for frying, etc.)
- Build cook steps as segment arrays, referencing ingredient indices
- Keep cook steps tight — one clear action per step, readable at a glance
- If a photo is pasted/uploaded during the session, crop it to the target ~4:3 aspect ratio before committing (see Recipe Images above) — don't just commit it as-is at an arbitrary ratio

---

## Files in This Project

| File | Purpose |
|------|---------|
| `PROJECT_INSTRUCTIONS.md` | This document — paste into Project instructions |
| `style.css` | Shared design tokens + base styles, used by every recipe page and the template |
| `recipe-engine.js` | Shared render engine — scaling, tabs, mise, cook mode, wake lock. Edit here, not per-recipe |
| `recipe-template.html` | Blank recipe shell to copy for each new recipe — markup + data only |
| `recipes.js` | Manifest with king ranch chicken entry |
| `recipes/king-ranch-chicken.html` | First recipe, fully built, use as design reference |

The recipe template and king ranch chicken HTML are the canonical reference implementations. When in doubt about structure or style, look at the king ranch chicken file. Any change to shared rendering behavior belongs in `recipe-engine.js`, not in an individual recipe file.
