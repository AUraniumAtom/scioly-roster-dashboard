/**
 * Data model for a collection of competition/tryout scores and candidate profiles.
 */

/**
 * @typedef {Object} ScoreSet
 * @property {string} id            - Unique identifier (slug, e.g. '2027-tryouts').
 * @property {string} label         - Human-readable name (e.g. 'Fall 2027 Tryouts').
 * @property {string} source        - Origin type: 'static-json' | 'csv-import' | 'xlsx-import'.
 * @property {Date}   importedAt    - Timestamp of when this set was loaded/imported.
 * @property {Array}  eventScores   - Raw event score records.
 * @property {Array}  candidateProfiles - Candidate metadata records.
 */

/**
 * Creates a ScoreSet from raw data.
 * @param {Object} params
 * @param {string} params.id
 * @param {string} [params.label]
 * @param {string} [params.source]
 * @param {Date}   [params.importedAt]
 * @param {Array}  params.eventScores
 * @param {Array}  params.candidateProfiles
 * @returns {ScoreSet}
 */
export function createScoreSet({
  id,
  label,
  source = 'static-json',
  importedAt = new Date(),
  eventScores = [],
  candidateProfiles = [],
}) {
  return {
    id,
    label: label || id,
    source,
    importedAt,
    eventScores,
    candidateProfiles,
  };
}
