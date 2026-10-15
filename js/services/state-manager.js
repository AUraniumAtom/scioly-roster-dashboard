/**
 * Centralized state management module.
 * Provides a single source of truth, reactive subscription, and localStorage persistence.
 */

import { STORAGE_KEY } from '../config.js';
import { pushUndo } from './undo-manager.js';

const getInitialSelected = () => {
  try {
    if (typeof localStorage !== 'undefined') {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    }
  } catch {
    // Fall back to empty selection if storage access or JSON parsing fails
  }
  return {};
};

const state = {
  team: 'MI',
  selected: getInitialSelected(),
  openEvent: null,
  activeScoreSetId: '2027-tryouts',
};

const listeners = new Set();

/**
 * Returns the current application state.
 */
export function getState() {
  return state;
}

/**
 * Subscribes a listener callback to state changes.
 * @param {Function} fn - Callback receiving the updated state.
 * @returns {Function} Unsubscribe function.
 */
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/**
 * Dispatches a partial state update, persists selections to localStorage,
 * pushes previous selection to undo history, and notifies all subscribers.
 * @param {Object} patch - Partial state object to merge.
 * @param {Object} [options]
 * @param {boolean} [options.skipUndo=false] - Whether to bypass recording this change in the undo stack.
 */
export function dispatch(patch, { skipUndo = false } = {}) {
  if (!skipUndo && 'selected' in patch) {
    pushUndo(state.selected);
  }
  Object.assign(state, patch);
  if ('selected' in patch) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.selected));
      }
    } catch {
      // Ignore in environments without localStorage
    }
  }
  listeners.forEach((fn) => fn(state));
}

/**
 * Serializes state to URL query parameters for shareable links.
 */
export function serializeState() {
  return new URLSearchParams({
    team: state.team,
    sel: JSON.stringify(state.selected),
    ds: state.activeScoreSetId,
  }).toString();
}
