/**
 * Candidate Scoreboard table rendering.
 */

import { $ } from '../utils/dom.js';
import { tierBadge, gradeBadge, scoreBar } from './badges.js';

/**
 * Renders the candidate scoreboard rows and highlights sorted column.
 *
 * @param {Array<Object>} candidates - Filtered and sorted candidate list.
 * @param {Object} selected - Map of selected candidate IDs.
 * @param {string} sortKey - Active sort column key.
 */
export function renderScoreboard(candidates, selected, sortKey) {
  const tableBody = $('#body');
  if (!tableBody) return;

  document.querySelectorAll('#head th').forEach((h) => {
    h.classList.toggle('sorted', h.dataset.key === sortKey);
  });

  tableBody.innerHTML = candidates
    .map(
      (cand, idx) => `
    <tr class="${selected[cand.id] ? 'sel' : ''} ${cand.optout ? 'opt' : ''}">
      <td class="rank">${idx + 1}</td>
      <td><input type="checkbox" data-id="${cand.id}" ${selected[cand.id] ? 'checked' : ''}></td>
      <td>
        <span class="link" data-student="${cand.id}">${cand.name}</span><br>
        <small>${cand.id}</small>${cand.optout ? '<br><span class="tag inj">DO NOT SELECT</span>' : ''}
      </td>
      <td>${tierBadge(cand.tier)}</td>
      <td>${gradeBadge(cand.grade)}</td>
      <td>${cand.count}</td>
      <td>${scoreBar(cand.avg)}</td>
      <td>${scoreBar(cand.top4)}</td>
      <td>${scoreBar(cand.top3)}</td>
      <td>${scoreBar(cand.top2)}</td>
      <td>${scoreBar(cand.pi)}</td>
      <td class="eventstack">
        ${Object.entries(cand.events)
          .sort((a, b) => b[1].norm - a[1].norm)
          .slice(0, 3)
          .map(
            ([eventName, evData]) =>
              `<span class="eventrow"><span>${eventName}</span>${scoreBar(evData.norm)}</span>`
          )
          .join('')}
      </td>
    </tr>
  `
    )
    .join('');
}
