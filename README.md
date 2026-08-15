# Recipes

A personal recipe app — mobile-first, three-tab workflow, no frameworks, no build step.

Live at **[recipes.benneely.com](https://recipes.benneely.com)**

---

## What it is

A curated collection of recipes I actually cook, built for use on my phone in the kitchen. Each recipe has three views: a full recipe with scalable ingredients, a mise en place checklist, and a step-by-step cook mode with swipe navigation.

Each recipe is markup + data only — `style.css` and `recipe-engine.js` are shared across every page. The landing page reads a JS manifest to list and sort them. Nothing requires a server.

## Stack

- Each recipe is a thin HTML file — markup + data only, no framework, no bundler
- `style.css` — shared design tokens and base styles, used by every recipe page
- `recipe-engine.js` — shared render engine (scaling, tabs, mise, cook mode, wake lock), used by every recipe page
- `recipes.js` manifest drives the index page
- Hosted on GitHub / Cloudflare Pages

## Structure

```
recipes/
├── index.html              ← recipe listing / landing page
├── style.css                ← shared design tokens + base styles
├── recipe-engine.js         ← shared render engine
├── recipes.js                ← metadata manifest (title, tags, times, image) — loaded by index.html AND every recipe page
├── recipe-template.html      ← blank shell for new recipes (data only)
├── PROJECT_INSTRUCTIONS.md  ← full design system + schema docs
├── images/                  ← recipe photos
└── recipes/
    └── [recipe-slug].html   ← HTML skeleton + INGREDIENTS/COOK_STEPS/DIRECTIONS/BASE_SERVES
```

## Recipe format

Each recipe page has three tabs:

**Recipe** — title, hero photo (if one is set for the recipe in `recipes.js`), meta (prep/cook/total/serves/skill), scale selector (½× 1× 2× 3×), intro paragraph, grouped ingredients with scalable quantities, directions with ingredient callouts, print button.

**Mise en Place** — checkable ingredient list with scaled quantities, progress bar, reset button.

**Cook** — dark-mode step cards, swipe navigation, progress bar, sticky nav. Ingredient quantities in each step update with the scale setting.

## Adding a recipe

Three ways to do this, in order of how ready each one is:

**1. LLM-assisted (how every recipe so far was actually added).** Give an LLM (Claude, or any capable model with repo read/write access) a GitHub PAT scoped to this repo, point it at `PROJECT_INSTRUCTIONS.md` to orient, and hand it a source recipe — a link, a photo, or pasted text. It builds the ingredient/cook-step data, fills in `recipe-template.html`, adds the manifest entry, and commits directly. This is the primary workflow. When a single change touches multiple files (e.g. an engine + CSS + several recipe pages), batch them into one commit via the Git Data API (blobs → tree → commit → ref update) rather than one commit per file — keeps history readable.

**2. Manual, by hand.**
1. Copy `recipe-template.html` → `recipes/[new-slug].html`
2. Fill in `INGREDIENTS`, `COOK_STEPS`, `DIRECTIONS`, title block, intro
3. Add one entry to `recipes.js`
4. Commit and push — Cloudflare deploys automatically

See `PROJECT_INSTRUCTIONS.md` for the full ingredient schema, unit escalation rules, and cook step segment format.

**3. A dedicated GUI recipe creator.** Not built. Would live as its own page/tool that outputs the same data shape as the template, so it could either write directly via the GitHub API or just hand you the finished file to commit. Someday, maybe — no active plan.

**Idea, not built: a second photo per recipe.** As of 2026-08-15, every recipe page shows one hero photo — sourced from the same `image` field in `recipes.js` that already fed the index card, so no per-recipe duplication was needed. A *second* image (e.g. a prep-stage shot or an origin photo alongside the plated hero) is still unbuilt. One has already been banked ahead of time for Caldeirada at `images/caldeirada-2.jpg`, establishing a `[slug]-2.jpg` naming convention for whenever this gets built. No active plan.

## Feature Add-ons

Added 2026-08-15:

- **Hero image on recipe detail pages** — every recipe page now shows the recipe's photo (if set) right below the title block, full-bleed, 4:3. Pulled at render time from the same `recipes.js` manifest the index page already reads, matched by slug — so `image` stays a single source of truth instead of being duplicated per recipe file. Excluded from print output. Recipes without an `image` entry simply show nothing, no broken-image icon.
- **Ingredient quantity readability** — fractions were rendering as tiny single-character Unicode glyphs (e.g. "1⅛" as one compressed glyph, easy to misread as "1⅓"). Switched to plain-text fractions ("1 1/8") with a non-breaking space so they can't wrap mid-value, and bumped the quantity font size on both the Recipe and Mise en Place tabs.

Added 2026-08-01:

- **Print stylesheet** — the "Print Recipe" button already existed; the `@media print` rules behind it were reworked. It now prints only the Recipe panel (title, meta, ingredients, directions) regardless of which tab was active when you hit print — Mise en Place and Cook mode are on-screen kitchen aids whose content mostly duplicates Directions, so they're excluded rather than dumped onto the page too.
- **Service worker (`sw.js`)** — deliberately simple: no write API and no fast-changing data file to special-case here (unlike hiking-journal's `hikes.json`), so every same-origin request just gets cache-first with a background revalidate. New recipe pages get cached automatically the first time they're opened. Registered from `index.html`, every recipe page, and `recipe-template.html` — so it's on by default for anything added going forward.

## Roadmap

See [PLAN.md](PLAN.md).

## How this was built

Built on a phone through Claude (Sonnet 4.6 low and 5 medium), following the same workflow as [The Dial](https://radio.benneely.com) — Claude read and wrote the repo directly via a fine-grained GitHub PAT, Cloudflare Pages pointed at the subdomain before the first commit, every push immediately testable at recipes.benneely.com.

The recipe format was designed iteratively in conversation before any code was committed: three-tab layout, scale logic, unit escalation rules, cook step segment schema. The king ranch chicken casserole recipe is the canonical reference implementation.

Fits Pattern 4 from the [App Patterns Field Guide](https://neely.github.io/patterns/) — static file host, GitHub as database, no write path from the browser.
