import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getState, dispatch, subscribe, serializeState } from './state-manager.js';
import { clearHistory, canUndo, undo } from './undo-manager.js';

describe('StateManager Service', () => {
  beforeEach(() => {
    clearHistory();
    dispatch({ team: 'MI', selected: {}, openEvent: null, activeScoreSetId: '2027-tryouts' }, { skipUndo: true });
  });

  it('provides current state', () => {
    const s = getState();
    expect(s.team).toBe('MI');
    expect(s.activeScoreSetId).toBe('2027-tryouts');
    expect(s.selected).toEqual({});
  });

  it('notifies subscribers on dispatch and records undo history for selections', () => {
    const listener = vi.fn();
    const unsubscribe = subscribe(listener);

    dispatch({ selected: { 'candidate-1-5': true } });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(getState().selected).toEqual({ 'candidate-1-5': true });
    expect(canUndo()).toBe(true);

    unsubscribe();
  });

  it('skips undo recording when skipUndo is true', () => {
    dispatch({ selected: { 'candidate-2-6': true } }, { skipUndo: true });
    expect(canUndo()).toBe(false);
  });

  it('serializes state using activeScoreSetId (ds param)', () => {
    dispatch({ team: 'MS', selected: { 'test-student-7': true }, activeScoreSetId: 'mock-1' }, { skipUndo: true });
    const serialized = serializeState();
    const params = new URLSearchParams(serialized);

    expect(params.get('team')).toBe('MS');
    expect(params.get('ds')).toBe('mock-1');
    expect(JSON.parse(params.get('sel'))).toEqual({ 'test-student-7': true });
  });
});
