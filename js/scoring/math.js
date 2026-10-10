/**
 * Pure mathematical scoring utilities: quantile and percentile rank calculations.
 */

/**
 * Calculates the q-th quantile of an array of numeric values using linear interpolation.
 * @param {number[]} values - Raw numeric values.
 * @param {number} q - Quantile in [0, 1] (e.g. 0.9 for P90, 0.5 for median).
 * @returns {number} The calculated quantile.
 */
export function quantile(values, q) {
  const sorted = [...values].sort((x, y) => x - y);
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const frac = pos - base;
  return (
    sorted[base] +
    (sorted[base + 1] === undefined
      ? 0
      : frac * (sorted[base + 1] - sorted[base]))
  );
}

/**
 * Calculates the percentile rank of a score within a score distribution.
 * Tied scores receive the midpoint of their positions.
 * @param {number[]} distribution - Event score distribution.
 * @param {number} score - Candidate's score.
 * @returns {number} Percentile in [0, 100].
 */
export function percentileRank(distribution, score) {
  const lowerCount = distribution.filter((v) => v < score).length;
  const equalCount = distribution.filter((v) => v === score).length;
  return distribution.length < 2
    ? 100
    : (100 * (lowerCount + 0.5 * (equalCount - 1))) / (distribution.length - 1);
}
