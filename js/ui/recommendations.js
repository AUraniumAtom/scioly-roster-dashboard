/**
 * Gap-closing candidate recommendations rendering.
 */

import { $ } from '../utils/dom.js';
import { tierBadge, gradeBadge } from './badges.js';

/**
 * Renders recommendations for unselected candidates who can fill undercovered events.
 *
 * @param {Array<Object>} allCandidates - All candidates in current division.
 * @param {Object} selected - Map of selected candidate IDs.
 * @param {string[]} gapEvents - Events with coverage less than needed.
 * @param {number} strongThreshold - Normalized score threshold to count as strong.
 */
export function renderRecommendations(
  allCandidates,
  selected,
  gapEvents,
  strongThreshold
) {
  const container = $('#recs');
  if (!container) return;

  const bestRecommendations = allCandidates
    .filter((cand) => !selected[cand.id] && !cand.optout)
    .map((cand) => ({
      cand,
      fixes: gapEvents.filter(
        (e) => cand.events[e] && cand.events[e].norm >= strongThreshold
      ),
    }))
    .filter((item) => item.fixes.length > 0)
    .sort((a, b) => b.fixes.length - a.fixes.length || b.cand.pi - a.cand.pi)
    .slice(0, 6);

  container.innerHTML =
    bestRecommendations
      .map(
        (rec) => `
    <div class="rec" data-student="${rec.cand.id}">
      <b>${rec.cand.name}</b> ${gradeBadge(rec.cand.grade)} ${tierBadge(rec.cand.tier)}
      <div>
        ${rec.fixes.map((e) => `<b>${e}</b>: ${rec.cand.events[e].norm.toFixed(1)} normalized, ${rec.cand.events[e].pct.toFixed(0)}th percentile`).join('<br>')}
      </div>
    </div>
  `
      )
      .join('') || '<small>No gap-closing recommendation yet.</small>';
}
