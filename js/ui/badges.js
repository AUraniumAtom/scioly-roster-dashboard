/**
 * UI Badge and Progress Bar helpers.
 */

/**
 * Maps tier labels to their CSS color classes.
 * @param {string} tier - Tier label ('S+', 'S', 'A+', etc.).
 * @returns {string} CSS class name.
 */
export function tierCssClass(tier) {
  return (
    {
      'S+': 'sp',
      S: 'ss',
      'A+': 'ap',
      A: 'aa',
      'B+': 'bp',
      B: 'bb',
      C: 'cc',
      D: 'dd',
    }[tier] || 'new'
  );
}

/**
 * Returns HTML for a tier badge tag.
 * @param {string} tier - Tier label.
 * @returns {string} HTML snippet.
 */
export function tierBadge(tier) {
  return `<span class="tag tier ${tierCssClass(tier)}">${tier || 'NEW'}</span>`;
}

/**
 * Returns HTML for a grade badge tag.
 * @param {number} grade - Grade level (5, 6, 7, 8).
 * @returns {string} HTML snippet.
 */
export function gradeBadge(grade) {
  return `<span class="tag g${grade}">Grade ${grade}</span>`;
}

/**
 * Returns HTML for a score bar component.
 * @param {number} value - Score value.
 * @param {number} max - Scale maximum (defaults to 105).
 * @returns {string} HTML snippet.
 */
export function scoreBar(value, max = 105) {
  const colorClass = value >= 80 ? 'hi' : value >= 60 ? 'mid' : '';
  const percentWidth = Math.max(0, Math.min(100, (value / max) * 100));
  return `<div class="bar ${colorClass}"><i style="width:${percentWidth}%"></i><span>${Number(value).toFixed(1)}</span></div>`;
}
