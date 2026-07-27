export const POOL_PERCENT = 0.25;
export const TIER_SPLITS = { tier5: 0.4, tier4: 0.35, tier3: 0.25 };
export function calculatePrizePool(input) {
    const poolPercent = input.poolPercent ?? POOL_PERCENT;
    const rolloverIn = input.rolloverInCents ?? 0;
    const totalPool = Math.floor(input.activeRevenueCents * poolPercent) + rolloverIn;
    const tier5Base = Math.floor(totalPool * TIER_SPLITS.tier5);
    const tier4Amount = Math.floor(totalPool * TIER_SPLITS.tier4);
    const tier3Amount = totalPool - tier5Base - tier4Amount;
    return {
        totalPool,
        revenueBasis: input.activeRevenueCents,
        rolloverIn,
        tier5: {
            amount: tier5Base + rolloverIn,
            rolloverIn,
            rolloverOut: 0,
        },
        tier4: { amount: tier4Amount },
        tier3: { amount: tier3Amount },
    };
}
export function applyTier5Rollover(pool, tier5WinnerCount, unclaimedCents = 0) {
    const rolloverOut = tier5WinnerCount === 0 ? pool.tier5.amount : unclaimedCents;
    return {
        ...pool,
        tier5: {
            ...pool.tier5,
            rolloverOut,
        },
    };
}
export function splitPrizeAmongWinners(totalCents, winnerCount) {
    if (winnerCount <= 0)
        return 0;
    return Math.floor(totalCents / winnerCount);
}
