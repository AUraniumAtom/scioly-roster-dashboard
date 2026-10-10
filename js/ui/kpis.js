/**
 * KPI summary metrics card rendering.
 */

import { $ } from '../utils/dom.js';

/**
 * Updates KPI metric summary cards at the top of the dashboard.
 */
export function renderKPIs({
  listCount,
  selectedCount,
  rosterTarget,
  teamIndexAvg,
  top3Avg,
  coverageCount,
  totalEvents,
  returningCount,
  gradeCounts,
  gradeSpan,
}) {
  const k1 = $('#k1');
  const k2 = $('#k2');
  const k3 = $('#k3');
  const k4 = $('#k4');
  const k5 = $('#k5');
  const k6 = $('#k6');
  const k7 = $('#k7');
  const k8 = $('#k8');
  const k9 = $('#k9');
  const ll = $('#ll');
  const hl = $('#hl');
  const lk = $('#lk');
  const hk = $('#hk');

  if (k1) k1.textContent = listCount;
  if (k2) k2.textContent = `${selectedCount}/${rosterTarget}`;
  if (k3) k3.textContent = selectedCount ? teamIndexAvg.toFixed(1) : '0';
  if (k4) k4.textContent = selectedCount ? top3Avg.toFixed(1) : '0';
  if (k5) k5.textContent = `${coverageCount}/${totalEvents}`;
  if (k6) k6.textContent = totalEvents - coverageCount;
  if (k7) k7.textContent = returningCount;
  if (k8) k8.textContent = gradeCounts[0] || 0;
  if (k9) k9.textContent = gradeCounts[1] || 0;

  if (ll) ll.textContent = `Grade ${gradeSpan[0]} selected`;
  if (hl) hl.textContent = `Grade ${gradeSpan[1]} selected`;
  if (lk) lk.className = `kpi grade${gradeSpan[0]}`;
  if (hk) hk.className = `kpi grade${gradeSpan[1]}`;
}
