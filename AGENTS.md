# AGENTS.md — Science Olympiad Roster Dashboard

## Purpose

This is a client-side web dashboard used by Science Olympiad coaches to evaluate candidate tryout/mock scores, build team rosters, and analyze 23-event coverage across two competitive divisions:

- **MI (Grades 5–6)** — Intermediate
- **MS (Grades 7–8)** — Middle School

Coaches use it to rank candidates by a composite Performance Index, interactively select team members, visualize event coverage gaps, and receive gap-closing recommendations — all in the browser with no backend.

> Refer to [ROADMAP.md](ROADMAP.md) for planned features, phasing, and execution order. Do not duplicate its content here.

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Package manager | **pnpm** | Lock file is `pnpm-lock.yaml`. |
| Bundler / Dev server | **Vite 8** | Config in `vite.config.js`. Dev server on port 3000 (`pnpm dev`). |
| Language | **Vanilla JavaScript (ES2022+ modules)** | Currently no framework. All `type: "module"` ESM. |
| Styling | **Vanilla CSS** | Currently a single file `css/styles.css`. Uses CSS custom properties (design tokens) in `:root`. |
| Charting | **ApexCharts 7** (`apexcharts`) | Only runtime dependency. Hand-rolled inline SVG is also used via `js/ui/charts.js`. |
| Testing | **Vitest 5** | Config lives inside `vite.config.js` under `test`. Environment is `node`. |
| Linting | **ESLint 10** | Dev dependency; no `.eslintrc` checked in yet — use defaults. |
| Formatting | **Prettier 3** | Config in `.prettierrc`: 2-space indent, single quotes, trailing commas (es5), semicolons. |
| License | **GPL-3.0-or-later** | `package.json` says GPL-3.0-or-later; `LICENSE` file contains GPLv3. README badge incorrectly says MIT — the LICENSE file is authoritative. |

### Commands

```bash
pnpm install          # install deps
pnpm dev              # Vite dev server (localhost:3000)
pnpm build            # production build → dist/
pnpm preview          # preview production build
pnpm test             # Vitest in watch mode
pnpm test:run         # Vitest single pass
```

---

## Repository Layout

```
├── index.html                  # SPA entry — static HTML shell with all sections
├── css/styles.css              # Complete stylesheet, organized into 13 numbered sections
├── js/
│   ├── main.js                 # Bootstrap: registers loader, wires event delegation, subscribes render
│   ├── config.js               # Constants: tier weights, localStorage key, default thresholds
│   ├── models/
│   │   └── score-set.js        # ScoreSet factory (id, label, source, eventScores, candidateProfiles)
│   ├── scoring/
│   │   ├── math.js             # Pure functions: quantile(), percentileRank()
│   │   └── model-builder.js    # buildCandidateModel() — the scoring pipeline
│   ├── services/
│   │   ├── data-service.js     # Abstract loader interface: registerLoader() / loadData()
│   │   ├── json-loader.js      # Concrete loader: fetches static JSON from data/<id>/
│   │   ├── dataset-store.js    # In-memory Map<id, ScoreSet> registry + active-set tracking
│   │   ├── state-manager.js    # Central state, localStorage persistence, pub-sub, URL serialization
│   │   ├── undo-manager.js     # Selection undo/redo stack (max 50), Ctrl+Z / Ctrl+Shift+Z
│   │   └── render-controller.js# computeViewModel() — pure derivation of all view-model data
│   ├── ui/
│   │   ├── badges.js           # HTML snippet helpers: tierBadge(), gradeBadge(), scoreBar()
│   │   ├── charts.js           # renderSvgBarChart(), renderHistogram() — inline SVG
│   │   ├── controls.js         # getFilterValues(), bindControlListeners()
│   │   ├── coverage.js         # Event coverage meter bars
│   │   ├── kpis.js             # KPI summary card rendering
│   │   ├── modals.js           # Candidate profile + Event leaderboard modals
│   │   ├── recommendations.js  # Gap-closing candidate recommendations
│   │   ├── scoreboard.js       # Main candidate table
│   │   ├── tabs.js             # Tab switching: Room / Tier Rankings / Calc Reference
│   │   └── team-board.js       # Selected roster sidebar grid
│   └── utils/
│       ├── dom.js              # $() and $$() query helpers
│       └── candidate-identity.js # canonicalKey(name, grade) for cross-dataset matching
├── data/
│   └── 2027-tryouts/
│       ├── event-scores.json   # Array of { id, name, team, event, raw }
│       └── candidates.json     # Array of { id, name, grade, tier, email, statement, ... }
├── public/data/                # Vite copies this to build root (mirrors data/)
├── dist/                       # Production build output (gitignored)
├── .agents/skills/             # 13 installed Emil Kowalski animation/design skills
├── vite.config.js
├── package.json
├── pnpm-lock.yaml
├── .prettierrc
├── .gitignore
├── ROADMAP.md                  # 7-phase development roadmap & future feature specifications
└── 2027_Science_Olympiad_Tryout_Scores_and_Selection_v6.html  # Legacy monolith (pre-modularization)
```

---

## Architecture

### Data Flow

```
JSON files → jsonLoader → createScoreSet → DatasetStore (in-memory Map)
                                                ↓
State Manager (team, selected, activeScoreSetId) ←→ localStorage
        ↓ subscribe()
    render() in main.js
        ↓
    computeViewModel() [RenderController — pure computation, no DOM]
        ↓
    UI renderers (scoreboard, kpis, coverage, recommendations, charts, team-board)
```

### Key Architectural Patterns

1. **Pluggable Loader Pattern** — `data-service.js` accepts any async function matching `(datasetId: string) => Promise<ScoreSet>` via `registerLoader()`. Currently only `jsonLoader` is registered; future CSV/XLSX loaders plug in here.

2. **Centralized State + Pub-Sub** — `state-manager.js` holds a single mutable state object. `dispatch(patch)` merges updates, persists `selected` to localStorage, pushes to undo stack, and notifies subscribers. UI re-renders via a single `subscribe(render)` call.

3. **ViewModel Separation** — `render-controller.js` (`computeViewModel()`) is a pure function that takes state + active ScoreSet + filters and returns a flat ViewModel object. All DOM work happens in thin UI renderer functions that receive this ViewModel. This keeps scoring logic testable independently of the DOM.

4. **Delegated Event Handling** — `main.js` sets up delegation on `document.body` using `data-*` attributes (`data-student`, `data-event`, `data-pick-id`, `data-id`, `data-tier-student`) rather than per-element listeners. This survives innerHTML re-renders.

5. **Canonical Identity** — `candidate-identity.js` generates deterministic `canonicalId` keys from `name + grade` (normalized, lowercased, diacritics stripped) to match the same student across different data imports.

### State Shape

```js
{
  team: 'MI' | 'MS',           // Active division tab
  selected: { [canonicalId]: boolean },  // Roster selections (persisted to localStorage)
  openEvent: string | null,     // Currently open event modal (for stay-in-modal behavior)
  activeScoreSetId: string,     // Currently loaded dataset (e.g. '2027-tryouts')
}
```

### Scoring Pipeline (model-builder.js)

For each division, the pipeline:
1. Filters `eventScores` by `team`
2. Computes per-event P90 via `quantile(dist, 0.9)`
3. Computes per-score percentile rank with midpoint tie correction
4. Normalizes: `100 × (w_p90 × min(1.05, raw/P90) + w_pct × pct/100)` — weights shift based on participant count (<10 → 85/15, ≥10 → 70/30)
5. Aggregates per-candidate: avg, top4, top3, top2, best
6. Computes Performance Index: `PI = (count ≥ 3) ? 0.7×avg + 0.3×top3 : avg`

> **Critical:** Do not alter the scoring formulas without explicit approval. These directly affect real team selection decisions and are documented for transparency to parents and students.

---

## Data Model

### `eventScores` (JSON array)
Each record: `{ id, name, team, event, raw }` — one row per candidate per event.

### `candidateProfiles` (JSON array)
Each record: `{ id, name, grade, tier, email, parentEmail, parentName, statement, ice, optout }`. The `optout` flag marks candidates who should not be selected (renders red "DO NOT SELECT" badge).

### `ScoreSet` (model object)
```js
{ id, label, source, importedAt, eventScores, candidateProfiles }
```

### Tier System
Historical performance tiers: `S+ > S > A+ > A > B+ > B > C > D > NEW (no tier)`. Numeric weights in `config.js` (`TIER_WEIGHTS`). Tiers are display-only context — they do **not** influence the scoring pipeline.

---

## Best Practices

### pnpm

Always use `pnpm`. The lockfile is `pnpm-lock.yaml`; using a different package manager will generate a conflicting lockfile and potentially resolve different dependency versions.

```bash
# ✅ Good
pnpm install
pnpm add apexcharts
pnpm test:run

# ❌ Bad
npm install
yarn add apexcharts
npx vitest run
```

### Vite & Module Imports

Use bare specifiers for `node_modules` packages and relative paths for local modules. Vite resolves both. Never use CDN `<script>` tags or global variables for dependencies.

```js
// ✅ Good — bare specifier, Vite resolves from node_modules
import ApexCharts from 'apexcharts';

// ✅ Good — relative path for local module
import { quantile } from '../scoring/math.js';

// ❌ Bad — CDN script tag bypasses the module graph
// <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>

// ❌ Bad — missing .js extension (Vite requires it for local ESM files)
import { quantile } from '../scoring/math';
```

When adding Vite config, keep it inside the existing `vite.config.js`. The Vitest config also lives there under `test`:

```js
// ✅ Good — single config file for both Vite and Vitest
export default defineConfig({
  server: { port: 3000 },
  test: { globals: true, environment: 'node' },
});

// ❌ Bad — separate vitest.config.js when config can live in vite.config.js
```

### Vanilla JavaScript Patterns

The codebase currently uses vanilla JS with ES modules — no framework. Each module uses **named exports** (not default exports) for grep-ability and explicit import lists.

```js
// ✅ Good — named exports
export function renderScoreboard(candidates, selected, sortKey) { /* ... */ }
export function renderKPIs(data) { /* ... */ }

// ❌ Bad — default export (harder to trace, allows inconsistent naming across importers)
export default function renderScoreboard(candidates, selected, sortKey) { /* ... */ }
```

Use the `$()` / `$$()` helpers from `utils/dom.js` instead of raw `document.querySelector`:

```js
// ✅ Good
import { $, $$ } from '../utils/dom.js';
const body = $('#body');
const tabs = $$('.tab');

// ❌ Bad — bypasses project helpers, inconsistent with codebase
const body = document.querySelector('#body');
const tabs = Array.from(document.querySelectorAll('.tab'));
```

For event handling, use delegated listeners on stable parent elements with `data-*` attributes, not per-element listeners that break on innerHTML re-renders:

```js
// ✅ Good — delegated, survives re-renders
document.body.addEventListener('click', (e) => {
  const link = e.target.closest('[data-student]');
  if (link) showCandidateModal(link.dataset.student, candidates);
});

// ❌ Bad — breaks on next render() since innerHTML replaces elements
document.querySelectorAll('.student-link').forEach((el) => {
  el.addEventListener('click', () => showCandidateModal(el.dataset.id, candidates));
});
```

### CSS & Design Tokens

The stylesheet (`css/styles.css`) is organized into 13 numbered sections. Always use the existing CSS custom properties from `:root` rather than hardcoding hex values:

```css
/* ✅ Good — references the design token */
.header { background: var(--b); }
.error  { color: var(--r); }

/* ❌ Bad — hardcoded color that may drift from the palette */
.header { background: #2574b8; }
.error  { color: #d1495b; }
```

Grade-specific colors have dedicated tokens (`--g5` through `--g8`). Use them consistently:

```css
/* ✅ Good */
.grade-5-badge { background: var(--g5); }

/* ❌ Bad — custom one-off color for a grade */
.grade-5-badge { background: #3366cc; }
```

When adding new styles, place them in the appropriate numbered section. Add a new section only if none of the existing 13 fit.

### Vitest & Testing

Tests are co-located: `foo.test.js` lives next to `foo.js`. Vitest globals are enabled (`describe`, `it`, `expect` — no imports needed).

```js
// ✅ Good — no import for globals, co-located file
// File: js/scoring/math.test.js
describe('quantile', () => {
  it('returns the 90th percentile', () => {
    expect(quantile([10, 20, 30, 40, 50], 0.9)).toBeCloseTo(46);
  });
});

// ❌ Bad — unnecessary import of globals (they are auto-injected)
import { describe, it, expect } from 'vitest';
```

Tests run in `node` environment — no DOM is available. Design service/scoring functions to accept injected dependencies for testability:

```js
// ✅ Good — computeViewModel accepts optional overrides so tests don't need a DOM
const vm = computeViewModel(mockState, mockScoreSet, mockFilters);
expect(vm.filteredList).toHaveLength(3);

// ❌ Bad — test depends on DOM elements existing (won't work in node)
document.body.innerHTML = '<select id="sort"><option value="pi"></option></select>';
const vm = computeViewModel();
```

Always run `pnpm test:run` after touching a module to verify nothing breaks.

### State Management

All state mutations go through `dispatch(patch)`. Never mutate `state` directly. The `dispatch` function handles localStorage persistence, undo stack, and subscriber notification automatically.

```js
// ✅ Good — merge partial patch via dispatch
dispatch({ team: 'MS' });
dispatch({ selected: { ...getState().selected, [id]: true } });

// ❌ Bad — direct mutation skips persistence, undo, and re-render
const state = getState();
state.team = 'MS';
state.selected[id] = true;
```

When performing programmatic state changes that shouldn't pollute the undo history (e.g., migration, redo replay), pass `{ skipUndo: true }`:

```js
// ✅ Good — migration shouldn't be undoable
dispatch({ selected: migratedSelections }, { skipUndo: true });

// ❌ Bad — migration recorded as undoable action, confuses user
dispatch({ selected: migratedSelections });
```

### UI Renderers

UI files in `js/ui/` are **thin renderers**: they receive pre-computed data from the ViewModel and produce HTML. They must not contain business logic, scoring calculations, or direct state reads.

```js
// ✅ Good — renderer receives data, only produces HTML
export function renderTeamBoard(selectedCandidates) {
  container.innerHTML = selectedCandidates
    .map((c) => `<div class="pick">${c.name} ${gradeBadge(c.grade)}</div>`)
    .join('');
}

// ❌ Bad — renderer computes scores and reads state (logic belongs in render-controller)
export function renderTeamBoard() {
  const state = getState();
  const scoreSet = getActiveScoreSet();
  const candidates = buildCandidateModel(state.team, scoreSet.eventScores, scoreSet.candidateProfiles);
  const selected = candidates.filter((c) => state.selected[c.canonicalId]);
  container.innerHTML = selected.map(/* ... */).join('');
}
```

### Data Loaders

New data loaders must conform to the pluggable loader contract: `(datasetId: string) => Promise<ScoreSet>`. Use `createScoreSet()` from `models/score-set.js` to construct the return value:

```js
// ✅ Good — conforms to loader contract, returns a ScoreSet
export async function csvLoader(datasetId) {
  const raw = await fetch(`data/${datasetId}/scores.csv`).then((r) => r.text());
  const parsed = parseCSV(raw);
  return createScoreSet({
    id: datasetId,
    label: 'CSV Import',
    source: 'csv-import',
    eventScores: parsed.scores,
    candidateProfiles: parsed.profiles,
  });
}

// ❌ Bad — returns a plain object instead of using createScoreSet
export async function csvLoader(datasetId) {
  return { scores: [...], profiles: [...] };
}
```

Register loaders in `main.js` at startup via `registerLoader()`. Never load data outside this pipeline.

---

## Conventions & Constraints

### Project-Specific Code Style
- **UI renderers are thin** — receive a ViewModel, return/inject HTML. No business logic in UI files.
- **Prettier** enforces formatting (2-space, single quotes, trailing commas, semicolons).
- **Named exports only** — no default exports. Every function is importable by exact name.

### Testing
- Co-located test files: `*.test.js` alongside implementation files.
- Use Vitest globals (`describe`, `it`, `expect` — no imports needed, `globals: true`).
- Tests run in `node` environment — no DOM available in tests by default. Service/scoring tests use dependency injection (e.g., `computeViewModel` accepts optional state/scoreSet/filters).
- Run `pnpm test:run` before committing changes to touched modules.

### Data Sensitivity
- `data/` contains **real student names, grades, emails, and scores**. Never commit identifiable data changes without approval.
- The `candidates.json` includes parent contact info. Treat as PII.

### The Legacy HTML File
- `2027_Science_Olympiad_Tryout_Scores_and_Selection_v6.html` (228 KB) is the **original monolithic version** — everything in one file. It is kept for reference/fallback but is **not** the active codebase. Do not modify it. The modular `index.html` + `js/` structure is the current version.

### localStorage Key
- Selections persist under `sciolySelection2027v6` (`STORAGE_KEY` in `config.js`). Changing this key will reset all user selections.

---

## Domain Glossary

| Term | Meaning |
|------|---------|
| **MI** | Intermediate division (Grades 5–6) |
| **MS** | Middle School division (Grades 7–8) |
| **PI / Performance Index** | Composite score: weighted blend of average and top-3 event scores |
| **P90** | 90th percentile score for a given event within a division |
| **Normalized score** | 0–105 scale combining raw/P90 ratio with percentile rank |
| **Coverage** | How many selected candidates score above the "strong" threshold for a given event |
| **Gap event** | An event where selected-candidate coverage falls below the configured need |
| **Tier** | Historical performance rating (S+ through D) from prior seasons |
| **ScoreSet** | A named collection of event scores + candidate profiles from one competition |
| **Canonical ID** | Deterministic `name-grade` key for cross-dataset identity matching |
| **Scout profile** | Per-candidate detail modal with stats, event breakdown, and scouting statement |
| **Strong threshold** | Configurable normalized-score cutoff (default 60) for counting a candidate as "covering" an event |
| **Optout** | Candidate flagged as ineligible for selection (injury, withdrawal, etc.) |
