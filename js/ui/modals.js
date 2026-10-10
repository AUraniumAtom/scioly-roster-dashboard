/**
 * Modal dialog management for Candidate Profile and Event Leaderboard.
 */

import { $ } from '../utils/dom.js';
import { tierBadge, gradeBadge, scoreBar } from './badges.js';
import { renderSvgBarChart } from './charts.js';
import { quantile } from '../scoring/math.js';
import { getState, dispatch } from '../services/state-manager.js';

/**
 * Opens the shared modal dialog with provided title and body HTML.
 */
export function openModal(titleHtml, bodyHtml) {
  const modalTitle = $('#mt');
  const modalBody = $('#mb');
  const modal = $('#modal');

  if (modalTitle) modalTitle.innerHTML = titleHtml;
  if (modalBody) modalBody.innerHTML = bodyHtml;
  if (modal) modal.classList.add('show');
}

/**
 * Closes the modal dialog.
 */
export function closeModal() {
  const modal = $('#modal');
  if (modal) modal.classList.remove('show');
  dispatch({ openEvent: null });
}

/**
 * Opens the candidate detail profile modal.
 *
 * @param {string} candidateId - ID of candidate to display.
 * @param {Array<Object>} candidateModel - Candidate model list for current division.
 */
export function showCandidateModal(candidateId, candidateModel) {
  dispatch({ openEvent: null });
  const candidate = candidateModel.find((c) => c.id === candidateId);
  if (!candidate) return;

  const state = getState();
  const sortedEvents = Object.entries(candidate.events).sort(
    (a, b) => b[1].norm - a[1].norm
  );
  const isSelected = !!state.selected[candidateId];

  openModal(
    `${candidate.name} ${gradeBadge(candidate.grade)} ${tierBadge(candidate.tier)}`,
    `${candidate.optout ? '<div class="inj" style="padding:10px"><b>DO NOT SELECT</b></div>' : ''}
     <div class="scout">
       <h3>Candidate Scouting Note</h3>
       <div>${candidate.statement || 'No scouting statement provided.'}</div>
       <span class="ice">Ice Cream: ${candidate.ice || 'Not Provided'}</span>
     </div>
     <button class="btn ${isSelected ? 'remove' : ''}" data-pick-id="${candidateId}" data-pick-val="${!isSelected}">
       ${isSelected ? 'Remove from Team' : 'Select for Team'}
     </button>
     <div class="stats" style="margin-top:10px">
       ${[
         ['Index', candidate.pi],
         ['Average', candidate.avg],
         ['Top 4', candidate.top4],
         ['Top 3', candidate.top3],
         ['Top 2', candidate.top2],
         ['Tests', candidate.count],
       ]
         .map(
           (stat) =>
             `<div class="stat"><b>${scoreBar(stat[1])}</b>${stat[0]}</div>`
         )
         .join('')}
     </div>
     <div class="two">
       <div>
         <h3>Event Scoring</h3>
         <table>
           <thead>
             <tr><th>Event</th><th>Raw</th><th>P90</th><th>Percentile</th><th>Normalized</th></tr>
           </thead>
           <tbody>
             ${sortedEvents
               .map(
                 ([eventName, evData]) => `
               <tr>
                 <td><span class="link" data-event="${eventName}">${eventName}</span></td>
                 <td>${evData.raw}</td>
                 <td>${evData.p90.toFixed(1)}</td>
                 <td>${scoreBar(evData.pct, 100)}</td>
                 <td>${scoreBar(evData.norm)}</td>
               </tr>
             `
               )
               .join('')}
           </tbody>
         </table>
       </div>
       <div>
         <h3>Candidate Score Profile</h3>
         <div id="pc" class="svgchart"></div>
       </div>
     </div>`
  );

  setTimeout(() => {
    const pc = $('#pc');
    if (pc) {
      renderSvgBarChart(
        pc,
        sortedEvents.map((e) => e[0]),
        sortedEvents.map((e) => e[1].norm),
        sortedEvents.map((e) =>
          e[1].norm >= 80 ? '#5b9f46' : e[1].norm >= 60 ? '#efb536' : '#2574b8'
        ),
        'Normalized'
      );
    }
  }, 0);
}

/**
 * Opens the event leaderboard modal showing scores and rankings across candidates.
 *
 * @param {string} eventName - Name of the event to display.
 * @param {Array<Object>} candidateModel - Candidate model list for current division.
 */
export function showEventModal(eventName, candidateModel) {
  dispatch({ openEvent: eventName });
  const state = getState();
  const strongInput = $('#strong');
  const strongVal = strongInput ? Number(strongInput.value) : 60;

  const participants = candidateModel
    .filter((cand) => cand.events[eventName])
    .map((cand) => ({ ...cand, ev: cand.events[eventName] }))
    .sort((a, b) => b.ev.norm - a.ev.norm);
  const rawValues = participants.map((cand) => cand.ev.raw);

  const mean = rawValues.length
    ? rawValues.reduce((a, b) => a + b, 0) / rawValues.length
    : 0;
  const median = quantile(rawValues, 0.5);
  const p90 = quantile(rawValues, 0.9);
  const strongCount = participants.filter(
    (cand) => cand.ev.norm >= strongVal
  ).length;
  const selectedCount = participants.filter(
    (cand) => state.selected[cand.id]
  ).length;

  openModal(
    `${eventName} Event Scores`,
    `<div class="stats">
       ${[
         ['Participants', participants.length],
         ['Selected', selectedCount],
         ['Mean', mean],
         ['Median', median],
         ['P90', p90],
         ['Strong', strongCount],
       ]
         .map(
           ([lbl, val]) =>
             `<div class="stat"><b>${Number(val).toFixed(Number(val) % 1 ? 1 : 0)}</b>${lbl}</div>`
         )
         .join('')}
     </div>
     <div id="ec" class="svgchart"></div>
     <table>
       <thead>
         <tr><th>#</th><th>Select</th><th>Candidate</th><th>Grade</th><th>Tier</th><th>Raw</th><th>Percentile</th><th>Normalized</th><th>Index</th></tr>
       </thead>
       <tbody>
         ${participants
           .map(
             (cand, idx) => `
           <tr class="${state.selected[cand.id] ? 'sel' : ''} ${cand.optout ? 'opt' : ''}">
             <td class="rank">${idx + 1}</td>
             <td><input type="checkbox" data-id="${cand.id}" data-stay="1" ${state.selected[cand.id] ? 'checked' : ''}></td>
             <td><span class="link" data-student="${cand.id}">${cand.name}</span></td>
             <td>${gradeBadge(cand.grade)}</td>
             <td>${tierBadge(cand.tier)}</td>
             <td>${cand.ev.raw}</td>
             <td>${scoreBar(cand.ev.pct, 100)}</td>
             <td>${scoreBar(cand.ev.norm)}</td>
             <td>${scoreBar(cand.pi)}</td>
           </tr>
         `
           )
           .join('')}
       </tbody>
     </table>`
  );

  setTimeout(() => {
    const ec = $('#ec');
    if (ec) {
      renderSvgBarChart(
        ec,
        participants.slice(0, 30).map((cand) => cand.name),
        participants.slice(0, 30).map((cand) => cand.ev.norm),
        participants.slice(0, 30).map((cand) =>
          getComputedStyle(document.documentElement)
            .getPropertyValue('--g' + cand.grade)
            .trim()
        ),
        'Normalized'
      );
    }
  }, 0);
}
