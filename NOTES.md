# Recipes — Notes & Backlog

## Current recipes (live in /recipes/)
- **harissa-chicken-thighs.html** — Crispy Harissa Chicken Thighs. Weeknight, chicken, spicy. 15 min prep / 35 min cook / serves 4 / easy. Reference implementation; first recipe built.

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

### Non-scalable ingredients (not yet implemented)
- Reserve `scalable: false` field in schema for future use
- Examples: "salt to taste", "oil for frying", "water as needed"

## Open questions / future work
- **style.css** — shared stylesheet not yet extracted. Currently each recipe is self-contained with inline styles. Extract once 2–3 recipes exist and the design is stable.
- **index.html** — landing page not yet built. Will read `recipes.js` manifest and render recipe cards. Sorting by tag, cook time, date added. Build in first project session after repo is set up.
- **Print styles** — currently hides tabs and scale row; shows all three panels. Should probably only print Recipe tab. Revisit when someone actually uses it.
- **`scalable: false` field** — schema placeholder only, no UI logic yet.

## Working conventions
- README stays in sync with what's actually live
- NOTES is the research scratchpad — add decisions here when made
- PLAN tracks phases; check off as done
- Recipe slugs match the filename: `harissa-chicken-thighs` → `recipes/harissa-chicken-thighs.html` + entry in `recipes.js`
