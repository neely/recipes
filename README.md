# Recipes

A personal recipe app — mobile-first, three-tab workflow, no frameworks, no build step.

Live at **[recipes.benneely.com](https://recipes.benneely.com)**

---

## What it is

A curated collection of recipes I actually cook, built for use on my phone in the kitchen. Each recipe has three views: a full recipe with scalable ingredients, a mise en place checklist, and a step-by-step cook mode with swipe navigation.

Design constraint: every recipe is a self-contained HTML file. The landing page reads a JS manifest to list and sort them. Nothing requires a server.

## Stack

- One HTML file per recipe — no framework, no bundler, no dependencies beyond Google Fonts
- Shared `style.css` for design tokens and base styles (once extracted)
- `recipes.js` manifest drives the index page
- Hosted on GitHub / Cloudflare Pages

## Structure

```
recipes/
├── index.html              ← recipe listing / landing page
├── style.css               ← shared design tokens (to be extracted)
├── recipes.js              ← metadata manifest, one entry per recipe
├── recipe-template.html    ← blank shell for new recipes
├── PROJECT_INSTRUCTIONS.md ← full design system + schema docs
└── recipes/
    └── [recipe-slug].html
```

## Recipe format

Each recipe page has three tabs:

**Recipe** — title, meta (prep/cook/total/serves/skill), scale selector (½× 1× 2× 3×), intro paragraph, grouped ingredients with scalable quantities, directions with ingredient callouts, print button.

**Mise en Place** — checkable ingredient list with scaled quantities, progress bar, reset button.

**Cook** — dark-mode step cards, swipe navigation, progress bar, sticky nav. Ingredient quantities in each step update with the scale setting.

## Adding a recipe

1. Copy `recipe-template.html` → `recipes/[new-slug].html`
2. Fill in `INGREDIENTS`, `COOK_STEPS`, `DIRECTIONS`, title block, intro
3. Add one entry to `recipes.js`
4. Commit and push — Cloudflare deploys automatically

See `PROJECT_INSTRUCTIONS.md` for the full ingredient schema, unit escalation rules, and cook step segment format.

## Roadmap

See [PLAN.md](PLAN.md).

## How this was built

Built on a phone through Claude (Sonnet 4.6), following the same workflow as [The Dial](https://radio.benneely.com) — Claude read and wrote the repo directly via a fine-grained GitHub PAT, Cloudflare Pages pointed at the subdomain before the first commit, every push immediately testable at recipes.benneely.com.

The recipe format was designed iteratively in conversation before any code was committed: three-tab layout, scale logic, unit escalation rules, cook step segment schema. The harissa chicken thighs recipe is the canonical reference implementation.

Fits Pattern 4 from the [App Patterns Field Guide](https://neely.github.io/patterns/) — static file host, GitHub as database, no write path from the browser.
