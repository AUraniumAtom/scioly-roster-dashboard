/**
 * Application constants, tier scoring weights, and default values.
 */

export const TIER_WEIGHTS = {
  'S+': 8,
  S: 7,
  'A+': 6,
  A: 5,
  'B+': 4,
  B: 3,
  C: 2,
  D: 1,
  '': 0,
};

export const STORAGE_KEY = 'sciolySelection2027v6';

export const DEFAULTS = {
  rosterTarget: 45,
  strongThreshold: 60,
  coverageNeeded: 6,
  minimumTests: 3,
};
