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
├── recipes.js                ← metadata manifest, one entry per recipe
├── recipe-template.html      ← blank shell for new recipes (data only)
├── PROJECT_INSTRUCTIONS.md  ← full design system + schema docs
├── images/                  ← recipe photos
└── recipes/
    └── [recipe-slug].html   ← HTML skeleton + INGREDIENTS/COOK_STEPS/DIRECTIONS/BASE_SERVES
```

## Recipe format

Each recipe page has three tabs:

**Recipe** — title, meta (prep/cook/total/serves/skill), scale selector (½× 1× 2× 3×), intro paragraph, grouped ingredients with scalable quantities, directions with ingredient callouts, print button.

**Mise en Place** — checkable ingredient list with scaled quantities, progress bar, reset button.

**Cook** — dark-mode step cards, swipe navigation, progress bar, sticky nav. Ingredient quantities in each step update with the scale setting.

## Adding a recipe

Three ways to do this, in order of how ready each one is:

**1. LLM-assisted (how every recipe so far was actually added).** Give an LLM (Claude, or any capable model with repo read/write access) a GitHub PAT scoped to this repo, point it at `PROJECT_INSTRUCTIONS.md` to orient, and hand it a source recipe — a link, a photo, or pasted text. It builds the ingredient/cook-step data, fills in `recipe-template.html`, adds the manifest entry, and commits directly. This is the primary workflow.

**2. Manual, by hand.**
1. Copy `recipe-template.html` → `recipes/[new-slug].html`
2. Fill in `INGREDIENTS`, `COOK_STEPS`, `DIRECTIONS`, title block, intro
3. Add one entry to `recipes.js`
4. Commit and push — Cloudflare deploys automatically

See `PROJECT_INSTRUCTIONS.md` for the full ingredient schema, unit escalation rules, and cook step segment format.

**3. A dedicated GUI recipe creator.** Not built. Would live as its own page/tool that outputs the same data shape as the template, so it could either write directly via the GitHub API or just hand you the finished file to commit. Someday, maybe — no active plan.

## Roadmap

See [PLAN.md](PLAN.md).

## How this was built

Built on a phone through Claude (Sonnet 4.6 low and 5 medium), following the same workflow as [The Dial](https://radio.benneely.com) — Claude read and wrote the repo directly via a fine-grained GitHub PAT, Cloudflare Pages pointed at the subdomain before the first commit, every push immediately testable at recipes.benneely.com.

The recipe format was designed iteratively in conversation before any code was committed: three-tab layout, scale logic, unit escalation rules, cook step segment schema. The king ranch chicken casserole recipe is the canonical reference implementation.

Fits Pattern 4 from the [App Patterns Field Guide](https://neely.github.io/patterns/) — static file host, GitHub as database, no write path from the browser.
