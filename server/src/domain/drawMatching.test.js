import { describe, expect, it } from '@jest/globals';
import {
  countMatches,
  determineTier,
  getRollingScores,
  simulateDrawWinners,
  validateStablefordScore,
} from './drawMatching.js';

describe('validateStablefordScore', () => {
  it('accepts valid scores', () => {
    expect(validateStablefordScore(36)).toBe(true);
    expect(validateStablefordScore(1)).toBe(true);
    expect(validateStablefordScore(45)).toBe(true);
  });

  it('rejects invalid scores', () => {
    expect(validateStablefordScore(0)).toBe(false);
    expect(validateStablefordScore(46)).toBe(false);
    expect(validateStablefordScore(36.5)).toBe(false);
  });
});

describe('getRollingScores', () => {
  it('keeps only latest 5 scores', () => {
    const existing = Array.from({ length: 5 }, (_, i) => ({
      stablefordPoints: 30 + i,
      playedAt: new Date(2026, 0, i + 1),
    }));
    const newScore = { stablefordPoints: 40, playedAt: new Date(2026, 0, 10) };
    const result = getRollingScores(existing, newScore);
    expect(result).toHaveLength(5);
    expect(result[0].stablefordPoints).toBe(40);
  });
});

describe('determineTier', () => {
  const winning = {
    tier5: [10, 20, 30, 35, 40],
    tier4: [10, 20, 30, 35],
    tier3: [10, 20, 30],
  };

  it('detects 5-match', () => {
    expect(determineTier([10, 20, 30, 35, 40], winning)).toBe(5);
  });

  it('detects 4-match', () => {
    expect(determineTier([10, 20, 30, 35, 22], winning)).toBe(4);
  });

  it('detects 3-match', () => {
    expect(determineTier([10, 20, 30, 22, 33], winning)).toBe(3);
  });

  it('returns null for no match', () => {
    expect(determineTier([1, 2, 3, 4, 5], winning)).toBe(null);
  });
});

describe('countMatches', () => {
  it('counts overlapping numbers', () => {
    expect(countMatches([10, 20, 30, 40, 50], [10, 20, 30])).toBe(3);
  });
});

describe('simulateDrawWinners', () => {
  it('groups winners by tier', () => {
    const entries = [
      { userId: 'a', scores: [10, 20, 30, 35, 40] },
      { userId: 'b', scores: [10, 20, 30, 35, 22] },
    ];
    const winning = {
      tier5: [10, 20, 30, 35, 40],
      tier4: [10, 20, 30, 35],
      tier3: [10, 20, 30],
    };
    const result = simulateDrawWinners(entries, winning);
    expect(result.get(5)).toContain('a');
    expect(result.get(4)).toContain('b');
  });
});
