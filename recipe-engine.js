// recipe-engine.js — shared recipe rendering engine
// Used by every recipe page (recipes/[slug].html) and the template.
//
// Each recipe's own inline <script> block defines these globals BEFORE
// this file is loaded (script tags execute in document order):
//   INGREDIENTS   — array of { group, qty, unit, name, scalable?, label? }
//   COOK_STEPS    — array of step segment arrays
//   DIRECTIONS    — array of HTML strings
//   BASE_SERVES   — number, servings at 1x scale
//   SOURCE        — optional string: plain text ("Grandma Neely") or a URL
//
// This file then renders everything and wires up all interactivity.
// Do not edit per-recipe — change here and it applies to every recipe.

const FRACS = [[0.125,'⅛'],[0.25,'¼'],[0.333,'⅓'],[0.5,'½'],[0.667,'⅔'],[0.75,'¾']];

function toFrac(v) {
  if (v <= 0) return '—';
  if (v === Math.floor(v)) return String(v);
  const whole = Math.floor(v);
  const frac = +(v - whole).toFixed(3);
  for (const [f, sym] of FRACS) {
    if (Math.abs(frac - f) < 0.04) return (whole > 0 ? whole : '') + sym;
  }
  return Math.round(v * 10) / 10;
}

function isClean(v) {
  if (v === Math.floor(v)) return true;
  const frac = +(v - Math.floor(v)).toFixed(3);
  return FRACS.some(([f]) => Math.abs(frac - f) < 0.04);
}

function fmtQtyUnit(baseQty, baseUnit, sc) {
  let v = baseQty * sc;
  let unit = baseUnit;
  if (unit === 'tsp') {
    const asTbsp = v / 3;
    if (v >= 3 && isClean(asTbsp)) { v = asTbsp; unit = 'tbsp'; }
  }
  if (unit === 'tbsp') {
    const asCups = v / 16;
    if (v >= 4 && isClean(asCups)) { v = asCups; unit = 'cup'; }
  }
  return { qty: toFrac(v), unit };
}

function ingSpan(i, frac) {
  const ing = INGREDIENTS[i];
  if (ing.scalable === false) {
    return `<span class="ing-inline">${ing.label} ${ing.name}</span>`;
  }
  const { qty, unit } = fmtQtyUnit(ing.qty * (frac ?? 1), ing.unit, scale);
  const unitStr = unit ? ` ${unit}` : '';
  return `<span class="ing-inline">${qty}${unitStr} ${ing.name}</span>`;
}

// Returns the display string for an ingredient's amount — either a scaled
// qty+unit, or (for scalable:false ingredients) the fixed label as-is.
function renderQty(ing) {
  if (ing.scalable === false) return ing.label || '';
  const { qty, unit } = fmtQtyUnit(ing.qty, ing.unit, scale);
  return `${qty}${unit ? ' ' + unit : ''}`;
}

let scale = 1;
let currentStep = 0;
let miseChecked = new Set();

function renderRecipeIng() {
  let html = '', lastGroup = '';
  INGREDIENTS.forEach(ing => {
    if (ing.group && ing.group !== lastGroup) {
      html += `<li class="ing-group-title">${ing.group}</li>`;
      lastGroup = ing.group;
    }
    html += `<li class="ing-item"><span class="ing-qty">${renderQty(ing)}</span><span>${ing.name}</span></li>`;
  });
  document.getElementById('recipe-ing-list').innerHTML = html;
}

function renderDirections() {
  document.getElementById('recipe-dir-list').innerHTML =
    DIRECTIONS.map(d => `<li class="dir-item"><div>${d}</div></li>`).join('');
}

// SOURCE is optional. Either a plain string ("Grandma Neely") or a URL
// ("https://..."), auto-detected. URLs display as a link, shortened to
// just the domain (no www., no path).
function renderSource() {
  const el = document.getElementById('recipe-source');
  if (!el) return;
  if (typeof SOURCE === 'undefined' || !SOURCE) { el.style.display = 'none'; return; }
  const isUrl = /^https?:\/\//i.test(SOURCE);
  if (isUrl) {
    const domain = SOURCE.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0];
    el.innerHTML = `Source: <a href="${SOURCE}" target="_blank" rel="noopener">${domain}</a>`;
  } else {
    el.textContent = `Source: ${SOURCE}`;
  }
}

function renderMise() {
  document.getElementById('mise-list').innerHTML = INGREDIENTS.map((ing, i) => {
    const chk = miseChecked.has(i);
    return `<li class="mise-item${chk ? ' checked' : ''}" onclick="toggleMise(${i})">
      <div class="mise-check"><span class="mise-check-icon">✓</span></div>
      <div class="mise-text"><span class="mise-qty">${renderQty(ing)}</span> ${ing.name}</div>
    </li>`;
  }).join('');
  const done = miseChecked.size, total = INGREDIENTS.length;
  document.getElementById('mise-count').textContent = `${done} / ${total}`;
  document.getElementById('mise-bar-fill').style.width = `${(done/total)*100}%`;
}

function toggleMise(i) {
  miseChecked.has(i) ? miseChecked.delete(i) : miseChecked.add(i);
  renderMise();
}

function resetMise() {
  miseChecked.clear();
  renderMise();
}

function buildStepHtml(segments) {
  return segments.map(seg => {
    if (seg.t === 't') return seg.v;
    if (seg.t === 's') return `<strong>${seg.v}</strong>`;
    if (seg.t === 'i') return ingSpan(seg.i, seg.frac);
    return '';
  }).join('');
}

function renderCookSteps() {
  const n = COOK_STEPS.length;
  document.getElementById('cook-track').innerHTML = COOK_STEPS.map((segs, i) =>
    `<div class="cook-step">
      <div class="cook-step-label">Step ${i+1} of ${n}</div>
      <div class="cook-step-text">${buildStepHtml(segs)}</div>
    </div>`
  ).join('');
  document.getElementById('cook-total').textContent = n;
  updateCookUI();
}

function cookNav(dir) {
  currentStep = Math.max(0, Math.min(COOK_STEPS.length - 1, currentStep + dir));
  updateCookUI();
}

function updateCookUI() {
  document.getElementById('cook-track').style.transform = `translateX(${-currentStep * 100}%)`;
  document.getElementById('cook-cur').textContent = currentStep + 1;
  document.getElementById('cook-progress-fill').style.width =
    `${((currentStep+1) / COOK_STEPS.length) * 100}%`;
  document.getElementById('cook-prev').disabled = currentStep === 0;
  document.getElementById('cook-next').disabled = currentStep === COOK_STEPS.length - 1;
}

let touchStartX = 0;
document.getElementById('cook-container').addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
}, { passive: true });
document.getElementById('cook-container').addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 40) cookNav(dx < 0 ? 1 : -1);
}, { passive: true });

function setScale(s) {
  scale = s;
  document.querySelectorAll('.scale-pill').forEach(p =>
    p.classList.toggle('active', parseFloat(p.dataset.scale) === s)
  );
  document.getElementById('serves-display').textContent = Math.round(BASE_SERVES * s);
  renderRecipeIng();
  renderMise();
  renderCookSteps();
}

function showTab(name) {
  const names = ['recipe','mise','cook'];
  document.querySelectorAll('.tab').forEach((t, i) => t.classList.toggle('active', names[i] === name));
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.getElementById('panel-' + name).classList.add('active');
}

renderRecipeIng();
renderDirections();
renderSource();
renderMise();
renderCookSteps();

// ═══════════════════════════════════════════════════════
// SCREEN WAKE LOCK — keep the phone awake while cooking.
// Requests on load, releases automatically when the tab is
// hidden/backgrounded, and re-acquires when it becomes visible
// again. No-ops silently on browsers without support.
// ═══════════════════════════════════════════════════════
let wakeLock = null;
async function requestWakeLock() {
  if (!('wakeLock' in navigator)) return;
  try {
    wakeLock = await navigator.wakeLock.request('screen');
    wakeLock.addEventListener('release', () => { wakeLock = null; });
  } catch (err) {
    // Fails silently — e.g. battery saver mode, unsupported, or permissions.
  }
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') requestWakeLock();
});
requestWakeLock();
