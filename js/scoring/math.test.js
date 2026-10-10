import { describe, it, expect } from 'vitest';
import { quantile, percentileRank } from './math.js';
import { buildCandidateModel } from './model-builder.js';

describe('Scoring Math — quantile', () => {
  it('calculates median (q = 0.5) correctly for odd length', () => {
    const scores = [10, 20, 30, 40, 50];
    expect(quantile(scores, 0.5)).toBe(30);
  });

  it('calculates median (q = 0.5) correctly for even length', () => {
    const scores = [10, 20, 30, 40];
    expect(quantile(scores, 0.5)).toBe(25);
  });

  it('calculates P90 correctly with interpolation', () => {
    const scores = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    // position = 9 * 0.9 = 8.1; sorted[8] = 90, sorted[9] = 100; 90 + 0.1 * 10 = 91
    expect(quantile(scores, 0.9)).toBeCloseTo(91, 1);
  });

  it('handles unordered array input', () => {
    const scores = [50, 10, 40, 20, 30];
    expect(quantile(scores, 0.5)).toBe(30);
  });

  it('handles boundary quantiles 0 and 1', () => {
    const scores = [15, 45, 95];
    expect(quantile(scores, 0)).toBe(15);
    expect(quantile(scores, 1)).toBe(95);
  });
});

describe('Scoring Math — percentileRank', () => {
  it('returns 100 for a single score array', () => {
    expect(percentileRank([50], 50)).toBe(100);
  });

  it('calculates 0th percentile for lowest distinct score', () => {
    const scores = [10, 20, 30, 40, 50];
    expect(percentileRank(scores, 10)).toBe(0);
  });

  it('calculates 100th percentile for highest distinct score', () => {
    const scores = [10, 20, 30, 40, 50];
    expect(percentileRank(scores, 50)).toBe(100);
  });

  it('applies midpoint resolution for tied scores', () => {
    // Array: [10, 20, 20, 40, 50] (N = 5)
    // score = 20 -> lower = 1 (10), equal = 2 (20, 20)
    // 100 * (1 + 0.5 * 1) / (5 - 1) = 100 * 1.5 / 4 = 37.5
    const scores = [10, 20, 20, 40, 50];
    expect(percentileRank(scores, 20)).toBe(37.5);
  });
});

describe('Scoring Engine — buildCandidateModel', () => {
  it('aggregates candidate performance metrics accurately', () => {
    const mockScores = [
      {
        id: '101',
        name: 'Alice',
        grade: 6,
        team: 'MI',
        event: 'Astronomy',
        raw: 90,
        note: '',
      },
      {
        id: '102',
        name: 'Bob',
        grade: 6,
        team: 'MI',
        event: 'Astronomy',
        raw: 45,
        note: '',
      },
      {
        id: '101',
        name: 'Alice',
        grade: 6,
        team: 'MI',
        event: 'Microbe Mission',
        raw: 80,
        note: '',
      },
      {
        id: '102',
        name: 'Bob',
        grade: 6,
        team: 'MI',
        event: 'Microbe Mission',
        raw: 40,
        note: '',
      },
      {
        id: '101',
        name: 'Alice',
        grade: 6,
        team: 'MI',
        event: 'Optics',
        raw: 70,
        note: '',
      },
      {
        id: '102',
        name: 'Bob',
        grade: 6,
        team: 'MI',
        event: 'Optics',
        raw: 35,
        note: '',
      },
    ];

    const mockProfiles = [
      {
        id: '101',
        name: 'Alice',
        grade: 6,
        tier: 'S',
        statement: '',
        ice: '',
        optout: false,
      },
      {
        id: '102',
        name: 'Bob',
        grade: 6,
        tier: 'B',
        statement: '',
        ice: '',
        optout: false,
      },
    ];

    const model = buildCandidateModel('MI', mockScores, mockProfiles);
    expect(model.length).toBe(2);

    const alice = model.find((c) => c.id === '101');
    expect(alice).toBeDefined();
    expect(alice.count).toBe(3);
    expect(alice.tierVal).toBe(7); // 'S' tier = 7
    expect(alice.pi).toBeGreaterThan(0);
    // PI formula with 3 tests: 0.7 * avg + 0.3 * top3
    expect(alice.pi).toBeCloseTo(0.7 * alice.avg + 0.3 * alice.top3, 2);
  });
});
