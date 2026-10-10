/**
 * Centralized state management module.
 * Provides a single source of truth, reactive subscription, and localStorage persistence.
 */

import { STORAGE_KEY } from '../config.js';

const state = {
  team: 'MI',
  selected: JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'),
  openEvent: null,
  activeDataset: '2027-tryouts',
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
 * and notifies all subscribers.
 * @param {Object} patch - Partial state object to merge.
 */
export function dispatch(patch) {
  Object.assign(state, patch);
  if ('selected' in patch) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.selected));
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
    ds: state.activeDataset,
  }).toString();
}
