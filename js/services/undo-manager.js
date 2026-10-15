/**
 * Lightweight undo/redo stack for state.selected changes.
 * Stores snapshots of the selected map; capped to avoid memory bloat.
 */

const MAX_HISTORY = 50;
const undoStack = [];
const redoStack = [];

/**
 * Pushes the current selected state onto the undo stack.
 * Clears the redo stack (new action invalidates redo history).
 * @param {Object} selectedSnapshot - Deep copy of state.selected before the change.
 */
export function pushUndo(selectedSnapshot) {
  undoStack.push(JSON.parse(JSON.stringify(selectedSnapshot || {})));
  if (undoStack.length > MAX_HISTORY) {
    undoStack.shift();
  }
  redoStack.length = 0;
}

/**
 * Pops the last undo snapshot and returns it.
 * Pushes the current state onto redo.
 * @param {Object} currentSelected - Current state.selected before undo.
 * @returns {Object|null} Previous selected state, or null if nothing to undo.
 */
export function undo(currentSelected) {
  if (undoStack.length === 0) return null;
  redoStack.push(JSON.parse(JSON.stringify(currentSelected || {})));
  return undoStack.pop();
}

/**
 * Pops the last redo snapshot and returns it.
 * Pushes the current state onto undo.
 * @param {Object} currentSelected - Current state.selected before redo.
 * @returns {Object|null} Next selected state, or null if nothing to redo.
 */
export function redo(currentSelected) {
  if (redoStack.length === 0) return null;
  undoStack.push(JSON.parse(JSON.stringify(currentSelected || {})));
  return redoStack.pop();
}

/**
 * Checks if undo history is available.
 * @returns {boolean}
 */
export function canUndo() {
  return undoStack.length > 0;
}

/**
 * Checks if redo history is available.
 * @returns {boolean}
 */
export function canRedo() {
  return redoStack.length > 0;
}

/**
 * Clears history stacks. Primarily for testing.
 */
export function clearHistory() {
  undoStack.length = 0;
  redoStack.length = 0;
}
