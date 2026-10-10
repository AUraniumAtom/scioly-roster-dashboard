/**
 * Abstract data service interface for pluggable loaders (JSON, CSV, XLSX, remote DB).
 */

let currentLoader = null;

/**
 * Registers a concrete loader function that conforms to the contract:
 * (datasetId: string) => Promise<{ eventScores: Array, candidateProfiles: Array }>
 */
export function registerLoader(loader) {
  currentLoader = loader;
}

/**
 * Loads dataset by ID using the registered loader.
 * @param {string} datasetId - Dataset directory identifier (e.g., '2027-tryouts').
 * @returns {Promise<{ eventScores: Array, candidateProfiles: Array }>}
 */
export async function loadData(datasetId) {
  if (!currentLoader) {
    throw new Error('No data loader registered in DataService.');
  }
  return currentLoader(datasetId);
}
