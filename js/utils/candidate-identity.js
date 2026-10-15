/**
 * Canonical candidate identity resolution.
 *
 * Generates a deterministic key from name + grade so the same student
 * can be matched across different score sets even if their source IDs differ.
 */

/**
 * Normalizes a name for matching: lowercase, strip diacritics, collapse whitespace.
 * @param {string} name
 * @returns {string}
 */
export function normalizeName(name) {
  return String(name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generates a canonical candidate key.
 * @param {string} name  - Candidate's display name.
 * @param {number|string} grade - Grade level.
 * @returns {string} Deterministic key like "evaan-banerjee-5".
 */
export function canonicalKey(name, grade) {
  const normName = normalizeName(name).replace(/ /g, '-');
  return `${normName}-${grade}`;
}
