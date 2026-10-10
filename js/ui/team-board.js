/**
 * Selected Roster team board rendering for the sidebar.
 */

import { $ } from '../utils/dom.js';
import { tierBadge, gradeBadge, scoreBar } from './badges.js';

/**
 * Renders the sidebar list of all selected candidates sorted by Performance Index.
 *
 * @param {Array<Object>} selectedCandidates - Selected candidates array.
 */
export function renderTeamBoard(selectedCandidates) {
  const container = $('#board');
  if (!container) return;

  container.innerHTML = selectedCandidates
    .sort((a, b) => b.pi - a.pi)
    .map(
      (cand, idx) => `
      <div class="pick">
        #${idx + 1} <span class="link" data-student="${cand.id}">${cand.name}</span><br>
        ${gradeBadge(cand.grade)} ${tierBadge(cand.tier)} ${scoreBar(cand.pi)}
      </div>
    `
    )
    .join('');
}
