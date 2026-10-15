/**
 * In-memory registry for loaded ScoreSets.
 * Future phases will back this with IndexedDB for persistence.
 */

/** @type {Map<string, import('../models/score-set.js').ScoreSet>} */
const store = new Map();

/** @type {string|null} */
let activeId = null;

/**
 * Adds or updates a ScoreSet in the store.
 * @param {import('../models/score-set.js').ScoreSet} scoreSet
 */
export function addScoreSet(scoreSet) {
  if (!scoreSet || !scoreSet.id) {
    throw new Error('ScoreSet must have a valid id.');
  }
  store.set(scoreSet.id, scoreSet);
}

/**
 * Retrieves a ScoreSet by its identifier.
 * @param {string} id
 * @returns {import('../models/score-set.js').ScoreSet|undefined}
 */
export function getScoreSet(id) {
  return store.get(id);
}

/**
 * Returns all registered ScoreSets.
 * @returns {Array<import('../models/score-set.js').ScoreSet>}
 */
export function getAllScoreSets() {
  return [...store.values()];
}

/**
 * Removes a ScoreSet from the store by id.
 * @param {string} id
 */
export function removeScoreSet(id) {
  store.delete(id);
  if (activeId === id) {
    activeId = null;
  }
}

/**
 * Sets the active ScoreSet ID. Throws if the score set does not exist.
 * @param {string} id
 */
export function setActiveScoreSet(id) {
  if (!store.has(id)) {
    throw new Error(`ScoreSet '${id}' not found in store.`);
  }
  activeId = id;
}

/**
 * Returns the currently active ScoreSet, or null if none active.
 * @returns {import('../models/score-set.js').ScoreSet|null}
 */
export function getActiveScoreSet() {
  return activeId ? store.get(activeId) || null : null;
}

/**
 * Clears all ScoreSets and resets activeId. Primarily for testing.
 */
export function clearStore() {
  store.clear();
  activeId = null;
}
