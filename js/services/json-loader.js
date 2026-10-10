/**
 * Concrete JSON data loader implementation fetching static files.
 */

/**
 * Loads event scores and candidate metadata from static JSON files.
 * @param {string} datasetId - Dataset folder name (e.g. '2027-tryouts').
 * @returns {Promise<{ eventScores: Array, candidateProfiles: Array }>}
 */
export async function jsonLoader(datasetId) {
  const [eventScores, candidateProfiles] = await Promise.all([
    fetch(`data/${datasetId}/event-scores.json`).then((res) => {
      if (!res.ok)
        throw new Error(`Failed to load event-scores.json: ${res.status}`);
      return res.json();
    }),
    fetch(`data/${datasetId}/candidates.json`).then((res) => {
      if (!res.ok)
        throw new Error(`Failed to load candidates.json: ${res.status}`);
      return res.json();
    }),
  ]);

  return { eventScores, candidateProfiles };
}
