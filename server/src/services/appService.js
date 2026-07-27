import { User } from '../models/User.js';
import { Subscription } from '../models/Subscription.js';
import { Score } from '../models/Score.js';
import { Charity } from '../models/Charity.js';
import { Draw } from '../models/Draw.js';
import { DrawEntry } from '../models/DrawEntry.js';
import { Winner } from '../models/Winner.js';
import { Donation } from '../models/Donation.js';
import { JackpotRollover } from '../models/JackpotRollover.js';
import bcrypt from 'bcryptjs';
import { signAccessToken, signRefreshToken } from '../middleware/auth.js';
import {
  generateRandomNumbers,
  generateWeightedNumbers,
  simulateDrawWinners,
  determineTier,
  countMatches,
} from '../domain/drawMatching.js';
import {
  calculatePrizePool,
  applyTier5Rollover,
  splitPrizeAmongWinners,
} from '../domain/prizePool.js';
import { sendDrawResultsEmail, sendWinnerAlertEmail } from '../services/emailService.js';

export async function registerUser(data) {
  const normalizedEmail = data.email.toLowerCase().trim();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) throw new Error('Email already registered');

  const passwordHash = await bcrypt.hash(data.password, 12);
  const user = await User.create({
    email: normalizedEmail,
    passwordHash,
    profile: { firstName: data.firstName, lastName: data.lastName },
    charityPreference: {
      charityId: data.charityId || undefined,
      contributionPercent: data.contributionPercent ?? 10,
    },
  });

  await Subscription.create({ userId: user._id, status: 'none', priceAmount: 999 });

  const accessToken = signAccessToken(user._id.toString(), user.role);
  const refreshToken = signRefreshToken(user._id.toString());
  user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  await user.save();

  return { user: sanitizeUser(user), accessToken, refreshToken };
}

export async function loginUser(email, password) {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) throw new Error('Invalid credentials');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error('Invalid credentials');

  const accessToken = signAccessToken(user._id.toString(), user.role);
  const refreshToken = signRefreshToken(user._id.toString());
  user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  await user.save();

  const subscription = await Subscription.findOne({ userId: user._id });
  return { user: sanitizeUser(user), accessToken, refreshToken, subscription };
}

export function sanitizeUser(user) {
  return {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    status: user.status,
    profile: user.profile,
    charityPreference: user.charityPreference,
    emailVerified: user.emailVerified,
  };
}

export async function getDashboardData(userId) {
  const [user, subscription, scores, winnings, currentDraw] = await Promise.all([
    User.findById(userId).populate('charityPreference.charityId'),
    Subscription.findOne({ userId }),
    Score.find({ userId }).sort({ playedAt: -1 }).limit(5),
    Winner.find({ userId }).sort({ createdAt: -1 }),
    Draw.findOne({ status: 'published' }).sort({ publishedAt: -1 }),
  ]);

  const entries = currentDraw
    ? await DrawEntry.findOne({ drawId: currentDraw._id, userId })
    : null;

  const totalWon = winnings
    .filter((w) => w.payoutStatus === 'paid')
    .reduce((sum, w) => sum + w.prizeAmount, 0);

  const isActive = subscription?.status === 'active' || subscription?.status === 'trialing';
  const isEligible = isActive && scores.length >= 5;

  return {
    user: user ? sanitizeUser(user) : null,
    subscription,
    scores,
    winnings,
    totalWon,
    currentDraw,
    isEntered: !!entries,
    isEligible,
    scoresNeeded: Math.max(0, 5 - scores.length),
  };
}

export async function addScore(userId, stablefordPoints, playedAt) {
  await Score.create({ userId, stablefordPoints, playedAt });
  
  // Keep only the most recent 5 scores per user
  const all = await Score.find({ userId }).sort({ playedAt: -1 });
  if (all.length > 5) {
    const toDelete = all.slice(5);
    await Score.deleteMany({ _id: { $in: toDelete.map((s) => s._id) } });
  }

  return Score.find({ userId }).sort({ playedAt: -1 }).limit(5);
}

export async function getAdminReports() {
  const [userCount, activeSubs, charities, draws, donations, winners] = await Promise.all([
    User.countDocuments({ role: 'subscriber', status: 'active' }),
    Subscription.countDocuments({ status: 'active' }),
    Charity.countDocuments({ isActive: true }),
    Draw.countDocuments({ status: 'published' }),
    Donation.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Winner.aggregate([
      { $group: { _id: '$payoutStatus', count: { $sum: 1 }, total: { $sum: '$prizeAmount' } } },
    ]),
  ]);

  const latestDraw = await Draw.findOne({ status: 'published' }).sort({ publishedAt: -1 });
  const pendingRollover = await JackpotRollover.findOne({ status: 'pending' });

  return {
    userCount,
    activeSubs,
    charityCount: charities,
    publishedDraws: draws,
    totalDonations: donations[0]?.total ?? 0,
    winners,
    latestDraw,
    pendingRollover: pendingRollover?.amount ?? 0,
  };
}

export async function simulateDraw(periodKey, mode) {
  let draw = await Draw.findOne({ periodKey });
  if (!draw) {
    draw = await Draw.create({ periodKey, generationMode: mode });
  }

  const activeSubs = await Subscription.find({ status: 'active' });
  const userIds = activeSubs.map((s) => s.userId);
  const allScores = await Score.find({ userId: { $in: userIds } });

  const scoreMap = new Map();
  for (const s of allScores) {
    const uid = s.userId.toString();
    if (!scoreMap.has(uid)) scoreMap.set(uid, []);
    scoreMap.get(uid).push(s.stablefordPoints);
  }

  const eligibleEntries = [...scoreMap.entries()]
    .filter(([, scores]) => scores.length >= 5)
    .map(([userId, scores]) => ({ userId, scores: scores.slice(0, 5) }));

  const flatScores = eligibleEntries.flatMap((e) => e.scores);
  const winningNumbers =
    mode === 'weighted_frequency'
      ? {
          tier5: generateWeightedNumbers(flatScores, 5),
          tier4: generateWeightedNumbers(flatScores, 4),
          tier3: generateWeightedNumbers(flatScores, 3),
        }
      : {
          tier5: generateRandomNumbers(5),
          tier4: generateRandomNumbers(4),
          tier3: generateRandomNumbers(3),
        };

  const revenueBasis = activeSubs.reduce((sum, s) => sum + s.priceAmount, 0);
  const pendingRollover = await JackpotRollover.findOne({ status: 'pending' });

  const pool = calculatePrizePool({
    activeRevenueCents: revenueBasis,
    rolloverInCents: pendingRollover?.amount ?? 0,
  });

  const winnerMap = simulateDrawWinners(eligibleEntries, winningNumbers);
  const tier5Count = winnerMap.get(5)?.length ?? 0;
  const tier4Count = winnerMap.get(4)?.length ?? 0;
  const tier3Count = winnerMap.get(3)?.length ?? 0;

  const simulation = {
    periodKey,
    mode,
    eligibleEntries: eligibleEntries.length,
    winningNumbers,
    prizePool: pool,
    winners: {
      tier5: { count: tier5Count, prizeEach: splitPrizeAmongWinners(pool.tier5.amount, tier5Count) },
      tier4: { count: tier4Count, prizeEach: splitPrizeAmongWinners(pool.tier4.amount, tier4Count) },
      tier3: { count: tier3Count, prizeEach: splitPrizeAmongWinners(pool.tier3.amount, tier3Count) },
    },
    rolloverIfNoTier5Winners: tier5Count === 0 ? pool.tier5.amount : 0,
  };

  draw.generationMode = mode;
  draw.winningNumbers = winningNumbers;
  draw.prizePoolSnapshot = {
    ...pool,
    activeSubscriberCount: activeSubs.length,
    revenueBasis,
  };
  draw.status = 'simulated';
  await draw.save();

  return simulation;
}

export async function publishDraw(periodKey, adminId) {
  const draw = await Draw.findOne({ periodKey });
  if (!draw || !draw.winningNumbers) {
    throw new Error('Draw must be simulated first');
  }

  const activeSubs = await Subscription.find({ status: 'active' });
  const userIds = activeSubs.map((s) => s.userId);

  // Clear previous entries for this draw if re-publishing
  await DrawEntry.deleteMany({ drawId: draw._id });

  const drawEntriesToCreate = [];

  for (const userId of userIds) {
    const scores = await Score.find({ userId }).sort({ playedAt: -1 }).limit(5);
    if (scores.length < 5) continue;

    const userScores = scores.map((s) => s.stablefordPoints);
    const tier = determineTier(userScores, draw.winningNumbers);
    const matchedCount = tier
      ? countMatches(userScores, draw.winningNumbers[`tier${tier}`])
      : 0;

    drawEntriesToCreate.push({
      drawId: draw._id,
      userId,
      scoresSnapshot: scores.map((s) => ({
        stablefordPoints: s.stablefordPoints,
        playedAt: s.playedAt,
      })),
      matchedTier: tier,
      matchedCount,
      isWinner: !!tier,
    });
  }

  // Bulk insert entries for better database performance
  if (drawEntriesToCreate.length > 0) {
    await DrawEntry.insertMany(drawEntriesToCreate);
  }

  const pool = draw.prizePoolSnapshot;
  const entries = await DrawEntry.find({ drawId: draw._id, isWinner: true });

  const winnersToCreate = [];
  for (const tier of [5, 4, 3]) {
    const tierWinners = entries.filter((e) => e.matchedTier === tier);
    const tierAmount = pool[`tier${tier}`];
    const amount = 'amount' in tierAmount ? tierAmount.amount : 0;
    const prizeEach = splitPrizeAmongWinners(amount, tierWinners.length);

    for (const entry of tierWinners) {
      winnersToCreate.push({
        drawId: draw._id,
        userId: entry.userId,
        tier,
        prizeAmount: prizeEach,
      });
    }
  }

  if (winnersToCreate.length > 0) {
    await Winner.insertMany(winnersToCreate);
  }

  const tier5Winners = entries.filter((e) => e.matchedTier === 5).length;
  const poolForRollover = {
    totalPool: pool.totalPool,
    revenueBasis: pool.revenueBasis,
    rolloverIn: pool.tier5?.rolloverIn ?? 0,
    tier5: pool.tier5,
    tier4: pool.tier4,
    tier3: pool.tier3,
  };

  const updatedPool = applyTier5Rollover(poolForRollover, tier5Winners);
  draw.prizePoolSnapshot = {
    ...updatedPool,
    activeSubscriberCount: activeSubs.length,
    revenueBasis: pool.revenueBasis,
  };

  if (tier5Winners === 0) {
    await JackpotRollover.create({
      fromDrawId: draw._id,
      amount: updatedPool.tier5.rolloverOut,
      status: 'pending',
    });
  } else {
    await JackpotRollover.updateMany(
      { status: 'pending' },
      { status: 'applied', toDrawId: draw._id }
    );
  }

  draw.status = 'published';
  draw.publishedAt = new Date();
  draw.publishedBy = adminId;
  await draw.save();

  // Async non-blocking email dispatch to avoid blocking HTTP response
  dispatchDrawEmails(draw._id).catch((err) =>
    console.error('Failed to dispatch draw emails asynchronously:', err)
  );

  return draw;
}

/**
  Non-blocking helper function to deliver email alerts
 */
async function dispatchDrawEmails(drawId) {
  const draw = await Draw.findById(drawId);
  if (!draw) return;

  const winners = await Winner.find({ drawId }).populate('userId');
  const userWinMap = new Map();

  for (const w of winners) {
    const uid = w.userId?._id?.toString() || w.userId?.toString();
    if (!uid) continue;
    if (!userWinMap.has(uid)) userWinMap.set(uid, []);
    userWinMap.get(uid).push(w);
  }

  const allEntries = await DrawEntry.find({ drawId }).populate('userId');
  const notifiedUsers = new Set();

  const emailPromises = [];

  for (const entry of allEntries) {
    const user = entry.userId;
    if (!user || !user.email || notifiedUsers.has(user._id.toString())) continue;
    notifiedUsers.add(user._id.toString());

    const userWins = userWinMap.get(user._id.toString()) ?? [];

    // Queue email tasks without awaiting each individually
    emailPromises.push(
      (async () => {
        try {
          await sendDrawResultsEmail(user, draw, userWins);
          for (const win of userWins) {
            await sendWinnerAlertEmail(user, win);
          }
        } catch (err) {
          console.error(`Email error for ${user.email}:`, err);
        }
      })()
    );
  }

  await Promise.allSettled(emailPromises);
}

export async function activateDemoSubscription(userId, plan) {
  const priceAmount = plan === 'yearly' ? 9900 : 999;
  const now = new Date();
  const end = new Date(now);

  if (plan === 'yearly') end.setFullYear(end.getFullYear() + 1);
  else end.setMonth(end.getMonth() + 1);

  await Subscription.findOneAndUpdate(
    { userId },
    {
      plan,
      status: 'active',
      priceAmount,
      currentPeriodStart: now,
      currentPeriodEnd: end,
      cancelAtPeriodEnd: false,
    },
    { upsert: true }
  );
}