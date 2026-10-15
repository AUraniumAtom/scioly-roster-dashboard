import { describe, it, expect } from 'vitest';
import { createScoreSet } from './score-set.js';

describe('ScoreSet Model', () => {
  it('creates a ScoreSet with defaults', () => {
    const set = createScoreSet({
      id: 'test-2027',
      eventScores: [{ id: '1', event: 'Astronomy', raw: 100 }],
      candidateProfiles: [{ id: '1', name: 'Student 1' }],
    });

    expect(set.id).toBe('test-2027');
    expect(set.label).toBe('test-2027');
    expect(set.source).toBe('static-json');
    expect(set.importedAt).toBeInstanceOf(Date);
    expect(set.eventScores).toHaveLength(1);
    expect(set.candidateProfiles).toHaveLength(1);
  });

  it('respects provided label, source, and importedAt', () => {
    const customDate = new Date('2026-01-01');
    const set = createScoreSet({
      id: 'mock-1',
      label: 'First Mock Exam',
      source: 'csv-import',
      importedAt: customDate,
      eventScores: [],
      candidateProfiles: [],
    });

    expect(set.label).toBe('First Mock Exam');
    expect(set.source).toBe('csv-import');
    expect(set.importedAt).toBe(customDate);
  });
});
