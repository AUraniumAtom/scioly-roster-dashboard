/**
 * Filter controls and parameter inputs reader and binder.
 */

import { $ } from '../utils/dom.js';

/**
 * Returns current control panel filter values.
 */
export function getFilterValues() {
  const sort = $('#sort')?.value || 'pi';
  const searchQuery = ($('#q')?.value || '').toLowerCase().trim();
  const tierFilter = $('#tf')?.value || '';
  const minTests = Number($('#min')?.value || 3);
  const rosterTarget = Number($('#target')?.value || 45);
  const strongThreshold = Number($('#strong')?.value || 60);
  const coverageNeeded = Number($('#need')?.value || 6);

  return {
    sort,
    searchQuery,
    tierFilter,
    minTests,
    rosterTarget,
    strongThreshold,
    coverageNeeded,
  };
}

/**
 * Binds input change listeners to all control fields to trigger re-rendering.
 *
 * @param {Function} onInputChange - Callback invoked whenever any filter changes.
 */
export function bindControlListeners(onInputChange) {
  document
    .querySelectorAll('.controls input, .controls select')
    .forEach((elem) => {
      elem.oninput = onInputChange;
    });
}
