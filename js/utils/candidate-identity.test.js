import { describe, it, expect } from 'vitest';
import { normalizeName, canonicalKey } from './candidate-identity.js';

describe('Candidate Identity Resolution', () => {
  describe('normalizeName', () => {
    it('lowercases strings', () => {
      expect(normalizeName('John DOE')).toBe('john doe');
    });

    it('strips diacritics and accents', () => {
      expect(normalizeName('Renée Müller')).toBe('renee muller');
    });

    it('collapses extra whitespace', () => {
      expect(normalizeName('   Jane     Smith   ')).toBe('jane smith');
    });

    it('removes punctuation and special characters', () => {
      expect(normalizeName('Mary-Jane O’Connor')).toBe('mary jane o connor');
    });
  });

  describe('canonicalKey', () => {
    it('generates deterministic hyphenated key with grade', () => {
      expect(canonicalKey('Evaan Banerjee', 5)).toBe('evaan-banerjee-5');
    });

    it('produces identical keys for equivalent names with different casing and spacing', () => {
      const key1 = canonicalKey('Alex Smith', 6);
      const key2 = canonicalKey('  alex   SMITH  ', 6);
      expect(key1).toBe(key2);
    });

    it('differentiates same name across different grades', () => {
      expect(canonicalKey('Alex Smith', 6)).not.toBe(canonicalKey('Alex Smith', 7));
    });
  });
});
