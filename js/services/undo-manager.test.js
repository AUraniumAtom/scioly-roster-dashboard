import { describe, it, expect, beforeEach } from 'vitest';
import {
  pushUndo,
  undo,
  redo,
  canUndo,
  canRedo,
  clearHistory,
} from './undo-manager.js';

describe('UndoManager Service', () => {
  beforeEach(() => {
    clearHistory();
  });

  it('starts with empty stacks', () => {
    expect(canUndo()).toBe(false);
    expect(canRedo()).toBe(false);
    expect(undo({})).toBeNull();
    expect(redo({})).toBeNull();
  });

  it('handles push, undo, and redo cycle', () => {
    const state0 = { 'cand-1': true };
    const state1 = { 'cand-1': true, 'cand-2': true };
    const state2 = { 'cand-1': true, 'cand-2': true, 'cand-3': true };

    pushUndo(state0);
    expect(canUndo()).toBe(true);

    pushUndo(state1);
    expect(canUndo()).toBe(true);

    // Current is state2. Undo should return state1.
    const undone1 = undo(state2);
    expect(undone1).toEqual(state1);
    expect(canRedo()).toBe(true);

    // Current is now state1. Undo should return state0.
    const undone0 = undo(state1);
    expect(undone0).toEqual(state0);

    // Redo should return state1.
    const redone1 = redo(state0);
    expect(redone1).toEqual(state1);

    // Redo should return state2.
    const redone2 = redo(state1);
    expect(redone2).toEqual(state2);
  });

  it('clears redo stack when a new action is pushed', () => {
    pushUndo({ a: 1 });
    undo({ b: 2 });
    expect(canRedo()).toBe(true);

    pushUndo({ c: 3 });
    expect(canRedo()).toBe(false);
    expect(redo({ d: 4 })).toBeNull();
  });

  it('caps history stack at 50 entries', () => {
    for (let i = 0; i < 60; i++) {
      pushUndo({ step: i });
    }

    let undoCount = 0;
    let curr = { step: 60 };
    while (canUndo()) {
      curr = undo(curr);
      undoCount++;
    }
    expect(undoCount).toBe(50);
  });

  it('deep clones snapshots to avoid shared reference mutations', () => {
    const snap = { 'cand-1': true };
    pushUndo(snap);
    snap['cand-1'] = false;

    const restored = undo({ current: true });
    expect(restored).toEqual({ 'cand-1': true });
  });
});
