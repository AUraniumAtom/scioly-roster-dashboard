# 🔬 Science Olympiad Tryout Scores & Team Roster Selection Dashboard

[![GitHub Pages Ready](https://img.shields.io/badge/GitHub%20Pages-Ready-brightgreen?logo=github)](https://A-Uranium-Atom.github.io/scioly-roster-dashboard/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![HTML5 / Vanilla JS](https://img.shields.io/badge/Stack-HTML5%20%7C%20CSS3%20%7C%20Vanilla%20JS-orange.svg)](#technical-architecture)
[![Events: 23](https://img.shields.io/badge/Events-23%20Included-teal.svg)](#features)

An interactive, high-performance web dashboard designed for Science Olympiad coaches and selection committees to evaluate tryout performance, simulate team rosters, analyze 23-event coverage, and optimize team composition.

---

## 🌟 Overview

Selecting a competitive Science Olympiad team requires balancing individual candidate performance across multiple events with comprehensive team-wide coverage across all 23 competitive events.

This dashboard provides coaches with an interactive, data-driven workspace to evaluate tryout results, identify event gaps in real time, and build balanced rosters for both:
- **MI Division (Grades 5–6)**: Intermediate School candidates
- **MS Division (Grades 7–8)**: Middle School candidates

---

## ✨ Key Features

### 1. Dual Division Analysis
- **Independent Normalization**: Candidates are evaluated and ranked strictly within their appropriate competitive division (`MI` vs. `MS`).
- **One-Click Switch**: Seamlessly toggle between divisions without losing roster selections or filter settings.

### 2. Live Team Selection & Coverage Meter
- **Interactive Roster Builder**: Add or remove candidates directly from the scoreboard or scout profile modals.
- **Real-Time Coverage Tracking**: Visual status bars track candidate depth for every one of the 23 events:
  - 🔴 **Red**: Critical coverage gap (below minimum threshold)
  - 🟡 **Yellow**: Moderate coverage (approaching target depth)
  - 🟢 **Green**: Fully covered event
- **Target Roster Configuration**: Dynamically adjust target roster size (e.g., 45 students), strong-event score thresholds, and required depth per event.

### 3. Intelligent Gap Analysis & Candidate Recommendations
- **Automated Recommendations**: Detects weakly staffed events and instantly suggests the highest-performing available candidates suited to fill those specific gaps.
- **Quick-Add Actions**: One-click candidate addition straight from recommendation cards.

### 4. Robust Statistical Scoring Engine
- **Event P90 Normalization**: Calculates the 90th percentile score per event within each division, mitigating single-outlier skew while maintaining a rigorous high-performance benchmark.
- **Midpoint Tied Percentiles**: Fair, rank-ordered percentile calculation accounting for ties.
- **Performance Index (PI)**: Composite metric weighting top event finishes and consistency across multiple tests.
- **Flexible Sorting**: Sort candidates by Performance Index, All-Test Average, Top 4, Top 3, Top 2, Single Best Event, or Tier.

### 5. Candidate Scout Profiles
- Detailed candidate modal displaying:
  - Overall standing, grade, and test count
  - Event-by-event raw scores, normalized percentiles, and relative rankings
  - Visual performance radar / bar charts
  - Direct roster selection toggle

### 6. Interactive Visualizations
- **Score Distribution Histogram**: Understand candidate distribution across Performance Index bands.
- **Grade Mix Visualizer**: Monitor age balance across grades 5–6 (MI) and grades 7–8 (MS).
- **Tier Mix Chart**: Track distribution of historical returning members versus new recruits.
- **Event Strength Profile**: Inspect aggregate team strength across all 23 events.

### 7. Historical Tier Rankings
- Track returning competitors across tiers (`S+`, `S`, `A+`, `A`, `B+`, `B`, `C`, `D`).
- *Note:* Historical tiers serve as context and do not alter objective tryout score computations.

### 8. Built-in Calculation Reference
- Integrated tab documenting all mathematical formulas, percentiles, normalization logic, and index definitions for full transparency with parents, students, and coaches.

---

## 🚀 Getting Started

### Option 1: Live on GitHub Pages
Once GitHub Pages is enabled on this repository:
1. Navigate to **Settings > Pages** in your GitHub repository.
2. Under **Build and deployment > Source**, select **Deploy from a branch**.
3. Choose the `main` branch and `/ (root)` folder, then click **Save**.
4. Access your live dashboard at:
   ```
   https://A-Uranium-Atom.github.io/scioly-roster-dashboard/
   ```

### Option 2: Running Locally
This application is completely self-contained with **zero external dependencies** and requires no build steps or local servers:
1. Clone the repository:
   ```bash
   git clone https://github.com/A-Uranium-Atom/scioly-roster-dashboard.git
   cd scioly-roster-dashboard
   ```
2. Open `index.html` in any modern web browser (Chrome, Edge, Firefox, Safari):
   - Double-click `index.html` or run:
     ```bash
     # Windows
     start index.html

     # macOS
     open index.html

     # Linux
     xdg-open index.html
     ```

---

## 📁 Repository Structure

```
scioly-roster-dashboard/
├── .gitignore                                           # Standard ignore rules
├── 2027_Science_Olympiad_Tryout_Scores_and_Selection_v6.html  # Versioned source dashboard
├── index.html                                           # Primary web entry point (GitHub Pages)
└── README.md                                            # Project documentation & reference
```

---

## 🛠️ Technical Architecture

- **Pure Client-Side**: 100% vanilla HTML5, CSS3, and modern JavaScript (ES6+).
- **No External CDN/Build Dependencies**: Fully functional offline without npm packages, Webpack, or external libraries.
- **Dynamic Inline SVG**: Ultra-lightweight chart rendering using raw SVG for crisp scaling and zero layout shifts.
- **Responsive Layout**: CSS Grid and Flexbox layout optimized for high-resolution desktop monitors, projectors, and tablets.

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).
