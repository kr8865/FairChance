export function validateStablefordScore(points) {
    return Number.isInteger(points) && points >= 1 && points <= 45;
}
export function sortScoresDesc(scores) {
    return [...scores].sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime());
}
export function getRollingScores(existing, newScore, maxCount = 5) {
    const combined = sortScoresDesc([newScore, ...existing]);
    return combined.slice(0, maxCount);
}
export function countMatches(userScores, winningSet) {
    const winSet = new Set(winningSet);
    return userScores.filter((s) => winSet.has(s)).length;
}
export function determineTier(userScores, winningNumbers) {
    if (countMatches(userScores, winningNumbers.tier5) === 5 &&
        winningNumbers.tier5.length === 5 &&
        winningNumbers.tier5.every((n) => userScores.includes(n))) {
        return 5;
    }
    if (countMatches(userScores, winningNumbers.tier4) >= 4) {
        return 4;
    }
    if (countMatches(userScores, winningNumbers.tier3) >= 3) {
        return 3;
    }
    return null;
}
export function generateRandomNumbers(count, min = 1, max = 45) {
    const nums = new Set();
    while (nums.size < count) {
        nums.add(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    return Array.from(nums).sort((a, b) => a - b);
}
export function generateWeightedNumbers(allScores, count, min = 1, max = 45) {
    const freq = new Map();
    for (let i = min; i <= max; i++)
        freq.set(i, 1);
    for (const s of allScores) {
        freq.set(s, (freq.get(s) ?? 0) + 1);
    }
    const selected = new Set();
    while (selected.size < count) {
        const candidates = Array.from(freq.entries()).filter(([n]) => !selected.has(n));
        const totalWeight = candidates.reduce((sum, [, w]) => sum + w, 0);
        let roll = Math.random() * totalWeight;
        for (const [num, weight] of candidates) {
            roll -= weight;
            if (roll <= 0) {
                selected.add(num);
                break;
            }
        }
    }
    return Array.from(selected).sort((a, b) => a - b);
}
export function simulateDrawWinners(entries, winningNumbers) {
    const winners = new Map();
    winners.set(5, []);
    winners.set(4, []);
    winners.set(3, []);
    for (const entry of entries) {
        const tier = determineTier(entry.scores, winningNumbers);
        if (tier) {
            winners.get(tier).push(entry.userId);
        }
    }
    return winners;
}
