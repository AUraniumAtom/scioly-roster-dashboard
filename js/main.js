/**
 * Science Olympiad Roster Dashboard — Main Application Orchestration Entry Point
 */

import { registerLoader, loadData } from './services/data-service.js';
import { jsonLoader } from './services/json-loader.js';
import { getState, dispatch, subscribe } from './services/state-manager.js';
import { getActiveScoreSet } from './services/dataset-store.js';
import { buildCandidateModel } from './scoring/model-builder.js';
import { computeViewModel } from './services/render-controller.js';
import { undo, redo } from './services/undo-manager.js';
import { renderScoreboard } from './ui/scoreboard.js';
import { renderKPIs } from './ui/kpis.js';
import { renderCoverage } from './ui/coverage.js';
import { renderRecommendations } from './ui/recommendations.js';
import { renderTeamBoard } from './ui/team-board.js';
import { renderSvgBarChart, renderHistogram } from './ui/charts.js';
import {
  closeModal,
  showCandidateModal,
  showEventModal,
} from './ui/modals.js';
import { showMainRoom, showTierView, showCalcView } from './ui/tabs.js';
import { bindControlListeners } from './ui/controls.js';
import { $, $$ } from './utils/dom.js';

let currentCandidates = [];

/**
 * Toggles a candidate's selection state and refreshes UI.
 * @param {string} canonicalId - Candidate canonical identifier.
 * @param {boolean} isSelected - Whether candidate is selected.
 * @param {boolean} [stayInModal=false] - Whether to stay in open event modal.
 */
function pickCandidate(canonicalId, isSelected, stayInModal = false) {
  const state = getState();
  const nextSelected = { ...state.selected, [canonicalId]: isSelected };
  dispatch({ selected: nextSelected });

  if (stayInModal && state.openEvent) {
    showEventModal(state.openEvent, currentCandidates);
  } else if (!stayInModal) {
    closeModal();
  }
}

/**
 * Migrates existing selection keys from raw ID to canonicalId.
 * @param {Array<Object>} candidates
 */
function migrateSelections(candidates) {
  const state = getState();
  const newSelected = {};
  let changed = false;
  for (const [key, val] of Object.entries(state.selected || {})) {
    const match = candidates.find((c) => c.id === key);
    if (match) {
      newSelected[match.canonicalId] = val;
      changed = true;
    } else {
      newSelected[key] = val;
    }
  }
  if (changed) {
    dispatch({ selected: newSelected }, { skipUndo: true });
  }
}

/**
 * Primary UI render routine: delegates view-model computation to RenderController
 * and dispatches to thin UI renderers.
 */
function render() {
  const vm = computeViewModel();
  if (!vm) return;
  currentCandidates = vm.allCandidates;

  showMainRoom();
  renderScoreboard(vm.filteredList, vm.state.selected, vm.filters.sort);
  renderKPIs({
    listCount: vm.filteredList.length,
    selectedCount: vm.selectedCandidates.length,
    rosterTarget: vm.filters.rosterTarget,
    teamIndexAvg: vm.teamIndexAvg,
    top3Avg: vm.top3Avg,
    coverageCount: vm.coveredEventsCount,
    totalEvents: vm.divisionEvents.length,
    returningCount: vm.returningCount,
    gradeCounts: vm.gradeCounts,
    gradeSpan: vm.gradeSpan,
  });
  renderCoverage(vm.divisionEvents, vm.eventCoverageCounts, vm.filters.coverageNeeded);
  renderTeamBoard(vm.selectedCandidates);
  renderRecommendations(vm.allCandidates, vm.state.selected, vm.gapEvents, vm.filters.strongThreshold);

  renderHistogram($('#hist'), vm.filteredList.map((c) => c.pi));
  renderSvgBarChart($('#gradeChart'), vm.gradeSpan.map((g) => `Grade ${g}`), vm.gradeCounts, vm.gradeSpan.map((g) => getComputedStyle(document.documentElement).getPropertyValue(`--g${g}`).trim()), 'Selected');
  const tierKeys = ['S+', 'S', 'A+', 'A', 'B+', 'B', 'C', 'D', 'NEW'];
  renderSvgBarChart($('#tierChart'), tierKeys, tierKeys.map((t) => vm.selectedCandidates.filter((c) => (c.tier || 'NEW') === t).length), tierKeys.map(() => '#6f78b8'), 'Selected');
  renderSvgBarChart($('#strengthChart'), vm.divisionEvents, vm.divisionEvents.map((e) => vm.eventAvgNorm[e]), vm.divisionEvents.map((e) => vm.eventAvgNorm[e] >= 80 ? '#5b9f46' : vm.eventAvgNorm[e] >= 60 ? '#efb536' : '#2574b8'), 'Average normalized');
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
        const activeSet = getActiveScoreSet();
        if (activeSet) {
          showTierView((team) =>
            buildCandidateModel(
              team,
              activeSet.eventScores,
              activeSet.candidateProfiles
            )
          );
        }
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

  // Keyboard shortcuts for Undo (Ctrl+Z) and Redo (Ctrl+Shift+Z / Ctrl+Y)
  document.addEventListener('keydown', (e) => {
    const isUndo = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey;
    const isRedo =
      (e.ctrlKey || e.metaKey) &&
      ((e.key.toLowerCase() === 'z' && e.shiftKey) || e.key.toLowerCase() === 'y');

    if (isUndo) {
      e.preventDefault();
      const prev = undo(getState().selected);
      if (prev) {
        dispatch({ selected: prev }, { skipUndo: true });
      }
    } else if (isRedo) {
      e.preventDefault();
      const next = redo(getState().selected);
      if (next) {
        dispatch({ selected: next }, { skipUndo: true });
      }
    }
  });
}

/**
 * Application startup bootstrap.
 */
async function init() {
  registerLoader(jsonLoader);
  const scoreSet = await loadData(getState().activeScoreSetId);
  const initialCandidates = buildCandidateModel(
    getState().team,
    scoreSet.eventScores,
    scoreSet.candidateProfiles
  );
  migrateSelections(initialCandidates);

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
