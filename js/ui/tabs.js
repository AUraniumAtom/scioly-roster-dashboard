/**
 * Tab switching management: Scoreboard Room view, Tier Rankings, Calculation Reference.
 */

import { $ } from '../utils/dom.js';
import { tierBadge, gradeBadge, scoreBar } from './badges.js';
import { TIER_WEIGHTS } from '../config.js';

/**
 * Activates the Main Selection scoreboard view.
 */
export function showMainRoom() {
  const room = $('#room');
  const tierView = $('#tierView');
  const calcView = $('#calcView');
  if (room) room.style.display = 'block';
  if (tierView) tierView.style.display = 'none';
  if (calcView) calcView.style.display = 'none';
}

/**
 * Activates and renders the Tier Rankings view across both divisions.
 *
 * @param {Function} buildCandidatesFn - (team: string) => Array<Object>
 */
export function showTierView(buildCandidatesFn) {
  const room = $('#room');
  const tierView = $('#tierView');
  const calcView = $('#calcView');
  const tiersContainer = $('#tiers');

  if (room) room.style.display = 'none';
  if (calcView) calcView.style.display = 'none';
  if (tierView) tierView.style.display = 'block';

  const miCandidates = buildCandidatesFn('MI');
  const msCandidates = buildCandidatesFn('MS');
  const allTiered = [...miCandidates, ...msCandidates]
    .filter((c) => c.tier)
    .sort((a, b) => b.tierVal - a.tierVal || b.pi - a.pi);

  const tierGroups = {};
  allTiered.forEach((cand) => {
    (tierGroups[cand.tier] ??= []).push(cand);
  });

  if (tiersContainer) {
    tiersContainer.innerHTML = Object.keys(TIER_WEIGHTS)
      .filter((tier) => tier && tierGroups[tier])
      .map(
        (tier) => `
        <h3>${tierBadge(tier)}</h3>
        <div class="board">
          ${tierGroups[tier]
            .map(
              (cand, idx) => `
            <div class="pick">
              #${idx + 1} <span class="link" data-tier-student="${cand.id}" data-team="${cand.grade < 7 ? 'MI' : 'MS'}">${cand.name}</span> ${gradeBadge(cand.grade)}<br>
              ${scoreBar(cand.pi)}
            </div>
          `
            )
            .join('')}
        </div>
      `
      )
      .join('');
  }
}

/**
 * Activates the Calculation Reference documentation view.
 */
export function showCalcView() {
  const room = $('#room');
  const tierView = $('#tierView');
  const calcView = $('#calcView');

  if (room) room.style.display = 'none';
  if (tierView) tierView.style.display = 'none';
  if (calcView) calcView.style.display = 'block';
}
