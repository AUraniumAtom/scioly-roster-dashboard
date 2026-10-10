/**
 * Pure aggregation pipeline that transforms raw event scores and candidate profiles
 * into normalized candidate model records.
 */

import { quantile, percentileRank } from './math.js';
import { TIER_WEIGHTS } from '../config.js';

/**
 * Builds candidate model records for a specified division ('MI' or 'MS').
 * Calculates event P90, percentiles, normalized scores, Top-N metrics, and Performance Index.
 *
 * @param {string} team - Division ('MI' or 'MS').
 * @param {Array<Object>} eventScores - Raw event score records.
 * @param {Array<Object>} candidateProfiles - Metadata profiles for candidates.
 * @returns {Array<Object>} Aggregated candidate profiles with performance metrics.
 */
export function buildCandidateModel(team, eventScores, candidateProfiles) {
  const teamScores = eventScores.filter((x) => x.team === team);
  const scoreDistributions = {};
  teamScores.forEach((x) => {
    (scoreDistributions[x.event] ??= []).push(x.raw);
  });

  const candidateMap = {};
  teamScores.forEach((scoreRec) => {
    const dist = scoreDistributions[scoreRec.event];
    const p90 = quantile(dist, 0.9);
    const pct = percentileRank(dist, scoreRec.raw);
    const weights = dist.length < 10 ? [0.85, 0.15] : [0.7, 0.3];
    const normalized =
      100 *
      (weights[0] * Math.min(1.05, p90 ? scoreRec.raw / p90 : 0) +
        (weights[1] * pct) / 100);
    const profile = candidateProfiles.find((y) => y.id === scoreRec.id) || {};

    const candidate = (candidateMap[scoreRec.id] ??= {
      ...profile,
      events: {},
    });
    candidate.events[scoreRec.event] = {
      raw: scoreRec.raw,
      p90,
      pct,
      norm: normalized,
      n: dist.length,
    };
  });

  return Object.values(candidateMap).map((candidate) => {
    const norms = Object.values(candidate.events)
      .map((x) => x.norm)
      .sort((a, b) => b - a);
    const averageTopN = (n) =>
      norms.slice(0, n).reduce((a, b) => a + b, 0) / Math.min(n, norms.length);
    const avg = averageTopN(norms.length);
    const top3 = averageTopN(3);

    return {
      ...candidate,
      count: norms.length,
      avg,
      top4: averageTopN(4),
      top3,
      top2: averageTopN(2),
      best: averageTopN(1),
      pi: norms.length >= 3 ? 0.7 * avg + 0.3 * top3 : avg,
      tierVal: TIER_WEIGHTS[candidate.tier] || 0,
    };
  });
}
