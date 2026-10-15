import { describe, it, expect, beforeEach } from 'vitest';
import { computeViewModel } from './render-controller.js';
import { createScoreSet } from '../models/score-set.js';
import { clearStore, addScoreSet, setActiveScoreSet } from './dataset-store.js';

describe('RenderController — computeViewModel', () => {
  beforeEach(() => {
    clearStore();
  });

  it('returns null if no ScoreSet is loaded', () => {
    const vm = computeViewModel();
    expect(vm).toBeNull();
  });

  it('computes complete view-model for loaded score set', () => {
    const mockScores = [
      { id: '101', name: 'Alice Smith', grade: 6, team: 'MI', event: 'Astronomy', raw: 95 },
      { id: '102', name: 'Bob Jones', grade: 6, team: 'MI', event: 'Astronomy', raw: 40 },
      { id: '101', name: 'Alice Smith', grade: 6, team: 'MI', event: 'Optics', raw: 85 },
      { id: '102', name: 'Bob Jones', grade: 6, team: 'MI', event: 'Optics', raw: 30 },
      { id: '103', name: 'Charlie Day', grade: 6, team: 'MI', event: 'Optics', raw: 60 },
    ];

    const mockProfiles = [
      { id: '101', name: 'Alice Smith', grade: 6, tier: 'S', optout: false },
      { id: '102', name: 'Bob Jones', grade: 6, tier: 'B', optout: false },
      { id: '103', name: 'Charlie Day', grade: 6, tier: '', optout: false },
    ];

    const scoreSet = createScoreSet({
      id: 'tryouts-2027',
      eventScores: mockScores,
      candidateProfiles: mockProfiles,
    });
    addScoreSet(scoreSet);
    setActiveScoreSet('tryouts-2027');

    const state = {
      team: 'MI',
      selected: { 'alice-smith-6': true },
      openEvent: null,
      activeScoreSetId: 'tryouts-2027',
    };

    const filters = {
      minTests: 0,
      searchQuery: '',
      tierFilter: '',
      sort: 'pi',
      coverageNeeded: 1,
      strongThreshold: 60,
      rosterTarget: 15,
    };

    const vm = computeViewModel(state, scoreSet, filters);

    expect(vm).toBeDefined();
    expect(vm.allCandidates).toHaveLength(3);
    expect(vm.selectedCandidates).toHaveLength(1);
    expect(vm.selectedCandidates[0].name).toBe('Alice Smith');
    expect(vm.divisionEvents).toEqual(['Astronomy', 'Optics']);
    expect(vm.gradeCounts).toEqual([0, 1]); // Grade 5 = 0, Grade 6 = 1
    expect(vm.gradeSpan).toEqual([5, 6]);
    expect(vm.returningCount).toBe(1); // Alice has tier 'S'
    expect(vm.eventCoverageCounts.Astronomy).toBeGreaterThanOrEqual(1);
    expect(vm.eventCoverageCounts.Optics).toBeGreaterThanOrEqual(1);
    expect(vm.gapEvents).toHaveLength(0);
  });

  it('filters candidates by searchQuery and minTests', () => {
    const mockScores = [
      { id: '101', name: 'Alice Smith', grade: 6, team: 'MI', event: 'Astronomy', raw: 95 },
      { id: '101', name: 'Alice Smith', grade: 6, team: 'MI', event: 'Optics', raw: 85 },
      { id: '102', name: 'Bob Jones', grade: 6, team: 'MI', event: 'Astronomy', raw: 40 },
    ];

    const mockProfiles = [
      { id: '101', name: 'Alice Smith', grade: 6, tier: 'S' },
      { id: '102', name: 'Bob Jones', grade: 6, tier: 'B' },
    ];

    const scoreSet = createScoreSet({
      id: 'tryouts-2027',
      eventScores: mockScores,
      candidateProfiles: mockProfiles,
    });

    const state = { team: 'MI', selected: {}, activeScoreSetId: 'tryouts-2027' };

    // Filter by minTests = 2 (Alice has 2 tests, Bob has 1 test)
    const vmMinTests = computeViewModel(
      state,
      scoreSet,
      { minTests: 2, searchQuery: '', tierFilter: '', sort: 'pi', coverageNeeded: 1, strongThreshold: 60, rosterTarget: 15 }
    );
    expect(vmMinTests.filteredList).toHaveLength(1);
    expect(vmMinTests.filteredList[0].name).toBe('Alice Smith');

    // Filter by search query 'bob'
    const vmSearch = computeViewModel(
      state,
      scoreSet,
      { minTests: 0, searchQuery: 'bob', tierFilter: '', sort: 'pi', coverageNeeded: 1, strongThreshold: 60, rosterTarget: 15 }
    );
    expect(vmSearch.filteredList).toHaveLength(1);
    expect(vmSearch.filteredList[0].name).toBe('Bob Jones');
  });
});
