/**
 * Abstract data service interface for pluggable loaders (JSON, CSV, XLSX, remote DB).
 */

import { addScoreSet, setActiveScoreSet } from './dataset-store.js';

let currentLoader = null;

/**
 * Registers a concrete loader function that conforms to the contract:
 * (datasetId: string) => Promise<import('../models/score-set.js').ScoreSet>
 */
export function registerLoader(loader) {
  currentLoader = loader;
}

/**
 * Loads dataset by ID using the registered loader.
 * Registers the loaded ScoreSet into DatasetStore and marks it active.
 * @param {string} datasetId - Dataset directory identifier (e.g., '2027-tryouts').
 * @returns {Promise<import('../models/score-set.js').ScoreSet>}
 */
export async function loadData(datasetId) {
  if (!currentLoader) {
    throw new Error('No data loader registered in DataService.');
  }
  const scoreSet = await currentLoader(datasetId);
  addScoreSet(scoreSet);
  setActiveScoreSet(scoreSet.id);
  return scoreSet;
}

