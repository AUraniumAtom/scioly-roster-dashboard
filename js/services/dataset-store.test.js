import { describe, it, expect, beforeEach } from 'vitest';
import {
  addScoreSet,
  getScoreSet,
  getAllScoreSets,
  removeScoreSet,
  setActiveScoreSet,
  getActiveScoreSet,
  clearStore,
} from './dataset-store.js';
import { createScoreSet } from '../models/score-set.js';

describe('DatasetStore Service', () => {
  beforeEach(() => {
    clearStore();
  });

  it('adds and retrieves score sets', () => {
    const set = createScoreSet({ id: 'set-a', eventScores: [], candidateProfiles: [] });
    addScoreSet(set);

    expect(getScoreSet('set-a')).toBe(set);
    expect(getAllScoreSets()).toEqual([set]);
  });

  it('throws when setting active score set that does not exist', () => {
    expect(() => setActiveScoreSet('nonexistent')).toThrowError(
      "ScoreSet 'nonexistent' not found in store."
    );
  });

  it('activates score sets and gets active score set', () => {
    const setA = createScoreSet({ id: 'set-a', eventScores: [], candidateProfiles: [] });
    const setB = createScoreSet({ id: 'set-b', eventScores: [], candidateProfiles: [] });
    addScoreSet(setA);
    addScoreSet(setB);

    setActiveScoreSet('set-a');
    expect(getActiveScoreSet()).toBe(setA);

    setActiveScoreSet('set-b');
    expect(getActiveScoreSet()).toBe(setB);
  });

  it('removes score sets and resets activeId if active is removed', () => {
    const setA = createScoreSet({ id: 'set-a', eventScores: [], candidateProfiles: [] });
    addScoreSet(setA);
    setActiveScoreSet('set-a');
    expect(getActiveScoreSet()).toBe(setA);

    removeScoreSet('set-a');
    expect(getScoreSet('set-a')).toBeUndefined();
    expect(getActiveScoreSet()).toBeNull();
  });
});
