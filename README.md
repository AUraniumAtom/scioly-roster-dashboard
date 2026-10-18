# Science Olympiad Roster Dashboard

[![License: GPL-3.0-or-later](https://img.shields.io/badge/License-GPL--3.0--or--later-blue.svg)](LICENSE)
[![Vite 8](https://img.shields.io/badge/Bundler-Vite%208-646CFF.svg?logo=vite&logoColor=white)](https://vite.dev/)
[![pnpm](https://img.shields.io/badge/Package%20Manager-pnpm-F69220.svg?logo=pnpm&logoColor=white)](https://pnpm.io/)
[![Vitest 5](https://img.shields.io/badge/Testing-Vitest%205-729B1B.svg?logo=vitest&logoColor=white)](https://vitest.dev/)
[![ESM / Vanilla JS](https://img.shields.io/badge/Stack-ES2022%20Modules-yellow.svg)](#tech-stack)
[![Events: 23](https://img.shields.io/badge/Events-23%20Included-teal.svg)](#features)

A browser-based workspace for Science Olympiad coaches to evaluate tryout scores, simulate rosters, and analyze 23-event coverage across two competitive divisions.

---

## Overview

Selecting a competitive Science Olympiad team requires balancing individual candidate performance across multiple events with complete event coverage.

This dashboard provides coaches with an interactive, data-driven workspace to evaluate tryout results, identify coverage gaps in real time, and build balanced rosters across two divisions:

- **MI Division (Grades 5–6)**: Intermediate School candidates
- **MS Division (Grades 7–8)**: Middle School candidates

Everything runs locally in the browser with no backend or account required.

---

## Features

### Evaluation

- **Dual-division normalization**: Scores are normalized within each division (`MI` vs. `MS`) using 90th-percentile (P90) benchmarks and tied percentile ranks.
- **Performance Index (PI)**: Composite score balancing top finishes and consistency across multiple tests (`PI = 0.7 × avg + 0.3 × top3` when tests ≥ 3).
- **Flexible candidate sorting**: Rank by Performance Index, overall average, top finishes, single best event, or historical tier.
- **Historical tiers**: Displays returning competitor context (`S+` through `D`) without biasing objective scoring calculations.

### Drafting

- **Interactive roster selection**: Add or remove candidates directly from the scoreboard, recommendation cards, or scout profiles.
- **Real-time coverage tracking**: Color-coded meters track candidate depth across all 23 competitive events.
- **Configurable targets**: Adjust target roster sizes, strong-event score thresholds, and required event depth on the fly.
- **Selection undo and redo**: Mistake recovery during live draft sessions via keyboard shortcuts (`Ctrl+Z` / `Ctrl+Shift+Z`).

### Recommendations

- **Automated gap detection**: Identifies understaffed events based on your configured coverage requirements.
- **Targeted suggestions**: Surfaces the highest-performing available candidates suited to fill specific event deficits.
- **One-click assignment**: Add suggested candidates directly from recommendation cards into the roster.

### Inspection & Analysis

- **Candidate scout profiles**: View event breakdown, raw scores, normalized percentiles, radar charts, and scouting statements.
- **Visual distributions**: Performance Index histograms, grade balance, tier mix, and aggregate team event strength charts.
- **Calculation reference**: Built-in reference tab documenting all mathematical formulas and normalization logic for transparency.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- [pnpm](https://pnpm.io/)

```bash
# Enable pnpm via Corepack if not already installed
corepack enable pnpm
```

### Setup & Commands

```bash
# Clone the repository
git clone https://github.com/A-Uranium-Atom/scioly-roster-dashboard.git
cd scioly-roster-dashboard

# Install dependencies
pnpm install

# Start local development server (localhost:3000)
pnpm dev

# Run unit tests
pnpm test:run

# Build for production
pnpm build
```

---

## Repository Layout

```
├── index.html              # SPA shell
├── css/styles.css          # Design tokens and stylesheet
├── js/
│   ├── main.js             # Bootstrap, loaders, event delegation
│   ├── config.js           # Configuration, constants, default thresholds
│   ├── models/             # Domain models (ScoreSet)
│   ├── scoring/            # P90 normalization and scoring pipeline
│   ├── services/           # State management, data loading, view-model derivation
│   ├── ui/                 # Component renderers (scoreboard, modals, charts, meters)
│   └── utils/              # Query helpers and candidate identity resolution
├── data/                   # Default tryout datasets
├── vite.config.js          # Vite and Vitest configuration
└── package.json            # Scripts and dependencies
```

---

## Tech Stack

| Layer             | Tool                                          | Notes                                               |
| ----------------- | --------------------------------------------- | --------------------------------------------------- |
| Runtime / Bundler | [Vite 8](https://vite.dev/)                   | Dev server on port 3000, production Rollup pipeline |
| Package Manager   | [pnpm](https://pnpm.io/)                      | Managed via `pnpm-lock.yaml`                        |
| Language          | Vanilla JavaScript                            | ES2022+ modules (`type: "module"`), named exports   |
| Styling           | Vanilla CSS                                   | CSS custom properties in `:root`                    |
| Charting          | [ApexCharts 7](https://apexcharts.com/) + SVG | Interactive canvas charts and inline SVG            |
| Testing           | [Vitest 5](https://vitest.dev/)               | Unit test suite co-located with source modules      |

---

## Roadmap

Planned features including multi-competition analytics, XLSX/CSV file imports, printable schedules, and collaboration tools are tracked in [ROADMAP.md](ROADMAP.md).

---

## License

This project is licensed under the [GNU General Public License v3.0 or later (GPL-3.0-or-later)](LICENSE).
