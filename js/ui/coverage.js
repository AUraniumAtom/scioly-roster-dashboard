/**
 * Event coverage tracker rendering for the sidebar.
 */

import { $ } from '../utils/dom.js';

/**
 * Renders the coverage bars for all division events.
 *
 * @param {string[]} events - Alphabetical list of events.
 * @param {Object} coverageCounts - Map of event name to count of strong selected candidates.
 * @param {number} neededThreshold - Coverage needed threshold per event.
 */
export function renderCoverage(events, coverageCounts, neededThreshold) {
  const container = $('#coverage');
  if (!container) return;

  container.innerHTML = events
    .map((e) => {
      const count = coverageCounts[e] || 0;
      const colorClass =
        count >= neededThreshold ? 'green' : count ? 'yellow' : 'red';
      const percent = Math.min(100, (count / neededThreshold) * 100);
      return `
      <div class="cov" data-event="${e}">
        <span>${e}</span>
        <div class="track"><div class="fill ${colorClass}" style="width:${percent}%"></div></div>
        <b>${count}/${neededThreshold}</b>
      </div>`;
    })
    .join('');
}
