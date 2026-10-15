/**
 * Centralized render pipeline: computes derived view-model from state + data,
 * then delegates to UI renderers.
 */

import { getState } from './state-manager.js';
import { getActiveScoreSet } from './dataset-store.js';
import { buildCandidateModel } from '../scoring/model-builder.js';
import { getFilterValues } from '../ui/controls.js';

/**
 * Computes the full view-model from current state, active score set, and filters.
 * Pure computation — no DOM side effects.
 *
 * @param {Object} [customState] - Optional state override (useful for unit testing).
 * @param {import('../models/score-set.js').ScoreSet} [customActiveSet] - Optional ScoreSet override.
 * @param {Object} [customFilters] - Optional filters override.
 * @returns {Object|null} ViewModel or null if no data loaded.
 */
export function computeViewModel(customState, customActiveSet, customFilters) {
  const activeSet = customActiveSet || getActiveScoreSet();
  if (!activeSet) return null;

  const state = customState || getState();
  let filters = customFilters;
  if (!filters) {
    try {
      filters = getFilterValues();
    } catch {
      filters = {
        minTests: 0,
        searchQuery: '',
        tierFilter: '',
        sort: 'pi',
        coverageNeeded: 2,
        strongThreshold: 60,
        rosterTarget: 15,
      };
    }
  }

  const allCandidates = buildCandidateModel(
    state.team,
    activeSet.eventScores,
    activeSet.candidateProfiles
  );

  const query = (filters.searchQuery || '').toLowerCase();
  const filteredList = allCandidates
    .filter(
      (cand) =>
        cand.count >= (filters.minTests ?? 0) &&
        (cand.name.toLowerCase().includes(query) ||
          String(cand.id).includes(query)) &&
        (!filters.tierFilter ||
          (filters.tierFilter === 'NEW'
            ? !cand.tier
            : cand.tier === filters.tierFilter))
    )
    .sort((a, b) =>
      filters.sort === 'name'
        ? a.name.localeCompare(b.name)
        : (b[filters.sort] ?? 0) - (a[filters.sort] ?? 0)
    );

  const selectedCandidates = allCandidates.filter(
    (c) => state.selected && (state.selected[c.canonicalId] || state.selected[c.id])
  );

  const divisionEvents = [
    ...new Set(
      activeSet.eventScores
        .filter((x) => x.team === state.team)
        .map((x) => x.event)
    ),
  ].sort();

  const eventAvgNorm = {};
  divisionEvents.forEach((evt) => {
    const selScores = selectedCandidates
      .filter((c) => c.events && c.events[evt])
      .map((c) => c.events[evt].norm);
    eventAvgNorm[evt] = selScores.length
      ? selScores.reduce((a, b) => a + b, 0) / selScores.length
      : 0;
  });

  const eventCoverageCounts = {};
  selectedCandidates.forEach((cand) => {
    if (cand.events) {
      Object.entries(cand.events).forEach(([evt, evData]) => {
        if (evData.norm >= (filters.strongThreshold ?? 60)) {
          eventCoverageCounts[evt] = (eventCoverageCounts[evt] || 0) + 1;
        }
      });
    }
  });

  const coverageNeeded = filters.coverageNeeded ?? 2;
  const coveredEventsCount = divisionEvents.filter(
    (e) => (eventCoverageCounts[e] || 0) >= coverageNeeded
  ).length;

  const gradeSpan = state.team === 'MI' ? [5, 6] : [7, 8];
  const gradeCounts = [
    selectedCandidates.filter((c) => c.grade === gradeSpan[0]).length,
    selectedCandidates.filter((c) => c.grade === gradeSpan[1]).length,
  ];

  const teamIndexAvg = selectedCandidates.length
    ? selectedCandidates.reduce((sum, c) => sum + c.pi, 0) /
      selectedCandidates.length
    : 0;

  const top3Avg = selectedCandidates.length
    ? selectedCandidates.reduce((sum, c) => sum + c.top3, 0) /
      selectedCandidates.length
    : 0;

  const gapEvents = divisionEvents.filter(
    (e) => (eventCoverageCounts[e] || 0) < coverageNeeded
  );

  const returningCount = selectedCandidates.filter((c) => c.tier).length;

  return {
    allCandidates,
    filteredList,
    selectedCandidates,
    divisionEvents,
    eventAvgNorm,
    eventCoverageCounts,
    coveredEventsCount,
    returningCount,
    gradeCounts,
    gradeSpan,
    teamIndexAvg,
    top3Avg,
    gapEvents,
    filters,
    state,
  };
}
