/**
 * Science Olympiad Roster Dashboard — Main Application Orchestration Entry Point
 */

import { registerLoader, loadData } from './services/data-service.js';
import { jsonLoader } from './services/json-loader.js';
import { getState, dispatch, subscribe } from './services/state-manager.js';
import { buildCandidateModel } from './scoring/model-builder.js';
import { renderScoreboard } from './ui/scoreboard.js';
import { renderKPIs } from './ui/kpis.js';
import { renderCoverage } from './ui/coverage.js';
import { renderRecommendations } from './ui/recommendations.js';
import { renderTeamBoard } from './ui/team-board.js';
import { renderSvgBarChart, renderHistogram } from './ui/charts.js';
import {
  openModal,
  closeModal,
  showCandidateModal,
  showEventModal,
} from './ui/modals.js';
import { showMainRoom, showTierView, showCalcView } from './ui/tabs.js';
import { getFilterValues, bindControlListeners } from './ui/controls.js';
import { $, $$ } from './utils/dom.js';

let rawData = null;
let currentCandidates = [];

/**
 * Toggles a candidate's selection state and refreshes UI.
 */
function pickCandidate(id, isSelected, stayInModal = false) {
  const state = getState();
  const nextSelected = { ...state.selected, [id]: isSelected };
  dispatch({ selected: nextSelected });

  if (stayInModal && state.openEvent) {
    const model = buildCandidateModel(
      state.team,
      rawData.eventScores,
      rawData.candidateProfiles
    );
    showEventModal(state.openEvent, model);
  } else if (!stayInModal) {
    closeModal();
  }
}

/**
 * Primary UI render routine: aggregates models, filters, populates scoreboard,
 * updates sidebars, and draws visual charts.
 */
function render() {
  if (!rawData) return;
  const state = getState();
  const filters = getFilterValues();

  showMainRoom();
  const allCandidates = buildCandidateModel(
    state.team,
    rawData.eventScores,
    rawData.candidateProfiles
  );
  currentCandidates = allCandidates;

  // Filter candidates according to user controls
  const filteredList = allCandidates
    .filter(
      (cand) =>
        cand.count >= filters.minTests &&
        (cand.name.toLowerCase().includes(filters.searchQuery) ||
          String(cand.id).includes(filters.searchQuery)) &&
        (!filters.tierFilter ||
          (filters.tierFilter === 'NEW'
            ? !cand.tier
            : cand.tier === filters.tierFilter))
    )
    .sort((a, b) =>
      filters.sort === 'name'
        ? a.name.localeCompare(b.name)
        : b[filters.sort] - a[filters.sort]
    );

  // Render main scoreboard table
  renderScoreboard(filteredList, state.selected, filters.sort);

  // Compute coverage, metrics, and gaps
  const selectedCandidates = allCandidates.filter((c) => state.selected[c.id]);
  const divisionEvents = [
    ...new Set(
      rawData.eventScores
        .filter((x) => x.team === state.team)
        .map((x) => x.event)
    ),
  ].sort();

  const eventAvgNorm = {};
  divisionEvents.forEach((evt) => {
    const selScores = selectedCandidates
      .filter((c) => c.events[evt])
      .map((c) => c.events[evt].norm);
    eventAvgNorm[evt] = selScores.length
      ? selScores.reduce((a, b) => a + b, 0) / selScores.length
      : 0;
  });

  const eventCoverageCounts = {};
  selectedCandidates.forEach((cand) => {
    Object.entries(cand.events).forEach(([evt, evData]) => {
      if (evData.norm >= filters.strongThreshold) {
        eventCoverageCounts[evt] = (eventCoverageCounts[evt] || 0) + 1;
      }
    });
  });

  const coveredEventsCount = divisionEvents.filter(
    (e) => (eventCoverageCounts[e] || 0) >= filters.coverageNeeded
  ).length;
  const gradeSpan = state.team === 'MI' ? [5, 6] : [7, 8];
  const gradeCounts = [
    selectedCandidates.filter((c) => c.grade === gradeSpan[0]).length,
    selectedCandidates.filter((c) => c.grade === gradeSpan[1]).length,
  ];

  // Render KPI cards
  const teamIndexAvg = selectedCandidates.length
    ? selectedCandidates.reduce((sum, c) => sum + c.pi, 0) /
      selectedCandidates.length
    : 0;
  const top3Avg = selectedCandidates.length
    ? selectedCandidates.reduce((sum, c) => sum + c.top3, 0) /
      selectedCandidates.length
    : 0;

  renderKPIs({
    listCount: filteredList.length,
    selectedCount: selectedCandidates.length,
    rosterTarget: filters.rosterTarget,
    teamIndexAvg,
    top3Avg,
    coverageCount: coveredEventsCount,
    totalEvents: divisionEvents.length,
    returningCount: selectedCandidates.filter((c) => c.tier).length,
    gradeCounts,
    gradeSpan,
  });

  // Render sidebar coverage & team board
  renderCoverage(divisionEvents, eventCoverageCounts, filters.coverageNeeded);
  renderTeamBoard(selectedCandidates);

  // Render gap recommendations
  const gapEvents = divisionEvents.filter(
    (e) => (eventCoverageCounts[e] || 0) < filters.coverageNeeded
  );
  renderRecommendations(
    allCandidates,
    state.selected,
    gapEvents,
    filters.strongThreshold
  );

  // Render charts
  const histContainer = $('#hist');
  if (histContainer) {
    renderHistogram(
      histContainer,
      filteredList.map((c) => c.pi)
    );
  }

  const gradeChartContainer = $('#gradeChart');
  if (gradeChartContainer) {
    renderSvgBarChart(
      gradeChartContainer,
      gradeSpan.map((g) => `Grade ${g}`),
      gradeCounts,
      gradeSpan.map((g) =>
        getComputedStyle(document.documentElement)
          .getPropertyValue(`--g${g}`)
          .trim()
      ),
      'Selected'
    );
  }

  const tierKeys = ['S+', 'S', 'A+', 'A', 'B+', 'B', 'C', 'D', 'NEW'];
  const tierChartContainer = $('#tierChart');
  if (tierChartContainer) {
    renderSvgBarChart(
      tierChartContainer,
      tierKeys,
      tierKeys.map(
        (t) => selectedCandidates.filter((c) => (c.tier || 'NEW') === t).length
      ),
      tierKeys.map(() => '#6f78b8'),
      'Selected'
    );
  }

  const strengthChartContainer = $('#strengthChart');
  if (strengthChartContainer) {
    renderSvgBarChart(
      strengthChartContainer,
      divisionEvents,
      divisionEvents.map((e) => eventAvgNorm[e]),
      divisionEvents.map((e) =>
        eventAvgNorm[e] >= 80
          ? '#5b9f46'
          : eventAvgNorm[e] >= 60
            ? '#efb536'
            : '#2574b8'
      ),
      'Average normalized'
    );
  }
}

/**
 * Initializes delegated event listeners on stable parent containers.
 */
function setupEventDelegation() {
  // Global document click delegation
  document.body.addEventListener('click', (event) => {
    // 1. Candidate link clicked (scoreboard, recs, sidebar board)
    const studentElem = event.target.closest('[data-student]');
    if (studentElem) {
      event.preventDefault();
      const candId = studentElem.dataset.student;
      showCandidateModal(candId, currentCandidates);
      return;
    }

    // 2. Event link or coverage bar clicked
    const eventElem = event.target.closest('[data-event]');
    if (eventElem) {
      event.preventDefault();
      const eventName = eventElem.dataset.event;
      showEventModal(eventName, currentCandidates);
      return;
    }

    // 3. Tier student link clicked in Tier Rankings view
    const tierStudentElem = event.target.closest('[data-tier-student]');
    if (tierStudentElem) {
      event.preventDefault();
      const studentId = tierStudentElem.dataset.tierStudent;
      const targetTeam = tierStudentElem.dataset.team;
      dispatch({ team: targetTeam });
      $$('.tab').forEach((tab) => {
        tab.classList.toggle('on', tab.dataset.team === targetTeam);
      });
      render();
      showCandidateModal(studentId, currentCandidates);
      return;
    }

    // 4. Modal action button (select/remove candidate)
    const pickBtn = event.target.closest('[data-pick-id]');
    if (pickBtn) {
      event.preventDefault();
      pickCandidate(pickBtn.dataset.pickId, pickBtn.dataset.pickVal === 'true');
      return;
    }

    // 5. Modal close button
    const closeBtn = event.target.closest('#modal .close');
    if (closeBtn) {
      event.preventDefault();
      closeModal();
      return;
    }

    // 6. Navigation tabs
    const tabBtn = event.target.closest('.tab');
    if (tabBtn) {
      $$('.tab').forEach((t) => t.classList.toggle('on', t === tabBtn));

      if (tabBtn.dataset.team) {
        dispatch({ team: tabBtn.dataset.team });
        render();
      } else if (tabBtn.id === 'tierTab') {
        showTierView((team) =>
          buildCandidateModel(
            team,
            rawData.eventScores,
            rawData.candidateProfiles
          )
        );
      } else if (tabBtn.id === 'calcTab') {
        showCalcView();
      }
      return;
    }
  });

  // Checkbox change delegation for candidate selection
  document.body.addEventListener('change', (event) => {
    const checkbox = event.target.closest('input[data-id]');
    if (checkbox) {
      pickCandidate(
        checkbox.dataset.id,
        checkbox.checked,
        checkbox.dataset.stay === '1'
      );
    }
  });

  // Scoreboard column header clicks for sorting
  const tableHead = $('#head');
  if (tableHead) {
    tableHead.addEventListener('click', (event) => {
      const th = event.target.closest('th[data-key]');
      if (th) {
        const sortSelect = $('#sort');
        if (sortSelect) {
          sortSelect.value = th.dataset.key;
          render();
        }
      }
    });
  }
}

/**
 * Application startup bootstrap.
 */
async function init() {
  registerLoader(jsonLoader);
  rawData = await loadData(getState().activeDataset);

  setupEventDelegation();
  bindControlListeners(render);
  subscribe(render);

  render();
}

// Launch application on DOM readiness
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
