import { describe, expect, it } from '@jest/globals';
import {
  applyTier5Rollover,
  calculatePrizePool,
  splitPrizeAmongWinners,
} from './prizePool.js';

describe('calculatePrizePool', () => {
  it('calculates pool from 25% of revenue', () => {
    const result = calculatePrizePool({ activeRevenueCents: 100000 });
    expect(result.totalPool).toBe(25000);
    expect(result.tier5.amount).toBe(10000);
    expect(result.tier4.amount).toBe(8750);
    expect(result.tier3.amount).toBe(6250);
  });

  it('includes rollover in tier5', () => {
    const result = calculatePrizePool({
      activeRevenueCents: 100000,
      rolloverInCents: 5000,
    });
    expect(result.totalPool).toBe(30000);
    expect(result.tier5.amount).toBe(17000);
    expect(result.tier5.rolloverIn).toBe(5000);
  });
});

describe('applyTier5Rollover', () => {
  it('rolls over entire tier5 when no winners', () => {
    const pool = calculatePrizePool({ activeRevenueCents: 100000 });
    const updated = applyTier5Rollover(pool, 0);
    expect(updated.tier5.rolloverOut).toBe(pool.tier5.amount);
  });

  it('does not roll over when winners exist', () => {
    const pool = calculatePrizePool({ activeRevenueCents: 100000 });
    const updated = applyTier5Rollover(pool, 2);
    expect(updated.tier5.rolloverOut).toBe(0);
  });
});

describe('splitPrizeAmongWinners', () => {
  it('splits equally', () => {
    expect(splitPrizeAmongWinners(10000, 4)).toBe(2500);
  });

  it('returns 0 for no winners', () => {
    expect(splitPrizeAmongWinners(10000, 0)).toBe(0);
  });
});
