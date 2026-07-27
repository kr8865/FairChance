import { Router } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import bcrypt from 'bcryptjs';

import {
  registerUser,
  loginUser,
  sanitizeUser,
  getDashboardData,
  addScore,
} from '../services/appService.js';

import {
  requestPasswordResetOtp,
  verifyPasswordResetOtp,
  resetPasswordWithToken,
} from '../services/passwordResetService.js';

import { authenticate, requireSubscription, signAccessToken } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { Subscription } from '../models/Subscription.js';
import { Charity } from '../models/Charity.js';
import { Draw } from '../models/Draw.js';
import { Winner } from '../models/Winner.js';
import { Donation } from '../models/Donation.js';
import { config } from '../config/env.js';

// Setup secure upload directory and Multer storage
const uploadDir = config.uploadDir;
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${crypto.randomUUID()}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|webp/;
    const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mime = allowedTypes.test(file.mimetype);
    if (ext && mime) {
      return cb(null, true);
    }
    cb(new Error('Only images (JPEG, PNG, WEBP) and PDFs are allowed.'));
  },
});

// Helper for handling async errors in Express 4
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/* ==========================================================================
   1. AUTH ROUTER
   ========================================================================== */
export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  charityId: z.string().optional(),
  contributionPercent: z.number().min(10).max(100).optional(),
});

authRouter.post(
  '/register',
  asyncHandler(async (req, res) => {
    const data = registerSchema.parse(req.body);
    const result = await registerUser(data);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ user: result.user, accessToken: result.accessToken });
  })
);

authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = z
      .object({ email: z.string(), password: z.string() })
      .parse(req.body);

    const result = await loginUser(email, password);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      user: result.user,
      accessToken: result.accessToken,
      subscription: result.subscription,
    });
  })
);

authRouter.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const token = req.cookies?.refreshToken || req.body.refreshToken;
    if (!token) return res.status(401).json({ error: 'No refresh token' });

    const jwt = await import('jsonwebtoken');
    const payload = jwt.default.verify(token, config.jwtRefreshSecret);

    const user = await User.findById(payload.sub);
    if (!user?.refreshTokenHash) return res.status(401).json({ error: 'Invalid refresh' });

    const valid = await bcrypt.compare(token, user.refreshTokenHash);
    if (!valid) return res.status(401).json({ error: 'Invalid refresh' });

    const accessToken = signAccessToken(user._id.toString(), user.role);
    res.json({ accessToken });
  })
);

authRouter.post(
  '/logout',
  authenticate,
  asyncHandler(async (req, res) => {
    if (req.user) {
      req.user.refreshTokenHash = undefined;
      await req.user.save();
    }
    res.clearCookie('refreshToken');
    res.json({ ok: true });
  })
);

authRouter.post(
  '/forgot-password',
  asyncHandler(async (req, res) => {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);
    const result = await requestPasswordResetOtp(email);
    res.json(result);
  })
);

authRouter.post(
  '/verify-otp',
  asyncHandler(async (req, res) => {
    const { email, otp } = z
      .object({ email: z.string().email(), otp: z.string().length(6) })
      .parse(req.body);
    const result = await verifyPasswordResetOtp(email, otp);
    res.json(result);
  })
);

authRouter.post(
  '/reset-password',
  asyncHandler(async (req, res) => {
    const { email, resetToken, newPassword } = z
      .object({
        email: z.string().email(),
        resetToken: z.string().min(1),
        newPassword: z.string().min(8),
      })
      .parse(req.body);

    const result = await resetPasswordWithToken(email, resetToken, newPassword);
    res.json(result);
  })
);

/* ==========================================================================
   2. PROFILE ROUTER (/me)
   ========================================================================== */
export const meRouter = Router();
meRouter.use(authenticate);

meRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const data = await getDashboardData(req.user._id.toString());
    res.json(data);
  })
);

meRouter.patch(
  '/',
  asyncHandler(async (req, res) => {
    const schema = z.object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      charityId: z.string().optional(),
      contributionPercent: z.number().min(10).max(100).optional(),
    });

    const data = schema.parse(req.body);
    const user = req.user;

    if (data.firstName) user.profile.firstName = data.firstName;
    if (data.lastName) user.profile.lastName = data.lastName;
    if (data.charityId) user.charityPreference.charityId = data.charityId;
    if (data.contributionPercent) user.charityPreference.contributionPercent = data.contributionPercent;

    await user.save();
    res.json({ user: sanitizeUser(user) });
  })
);

meRouter.get(
  '/subscription',
  asyncHandler(async (req, res) => {
    const sub = await Subscription.findOne({ userId: req.user._id });
    res.json(sub);
  })
);

/* ==========================================================================
   3. SCORES ROUTER
   ========================================================================== */
export const scoresRouter = Router();
scoresRouter.use(authenticate, requireSubscription);

scoresRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const { Score } = await import('../models/Score.js');
    const scores = await Score.find({ userId: req.user._id }).sort({ playedAt: -1 }).limit(5);
    res.json(scores);
  })
);

scoresRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const { stablefordPoints, playedAt } = z
      .object({
        stablefordPoints: z.number().int().min(1).max(45),
        playedAt: z.string().datetime().or(z.string()),
      })
      .parse(req.body);

    const scores = await addScore(req.user._id.toString(), stablefordPoints, new Date(playedAt));
    res.status(201).json(scores);
  })
);

/* ==========================================================================
   4. CHARITIES ROUTER
   ========================================================================== */
export const charitiesRouter = Router();

charitiesRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const { q, category } = req.query;
    const filter = { isActive: true };

    if (category) filter.categories = category;

    let query = Charity.find(filter);
    if (q) query = Charity.find({ ...filter, $text: { $search: String(q) } });

    const charities = await query.sort({ isFeatured: -1, name: 1 });
    res.json(charities);
  })
);

charitiesRouter.get(
  '/featured',
  asyncHandler(async (_req, res) => {
    const charities = await Charity.find({ isActive: true, isFeatured: true }).limit(3);
    res.json(charities);
  })
);

charitiesRouter.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const charity = await Charity.findOne({ slug: req.params.slug, isActive: true });
    if (!charity) return res.status(404).json({ error: 'Charity not found' });
    res.json(charity);
  })
);

/* ==========================================================================
   5. DRAWS ROUTER
   ========================================================================== */
export const drawsRouter = Router();

drawsRouter.get(
  '/current',
  asyncHandler(async (_req, res) => {
    const draw = await Draw.findOne({ status: 'published' }).sort({ publishedAt: -1 });
    res.json(draw);
  })
);

drawsRouter.get(
  '/:periodKey',
  asyncHandler(async (req, res) => {
    const draw = await Draw.findOne({ periodKey: req.params.periodKey, status: 'published' });
    if (!draw) return res.status(404).json({ error: 'Draw not found' });
    res.json(draw);
  })
);

/* ==========================================================================
   6. WINNINGS ROUTER
   ========================================================================== */
export const winningsRouter = Router();
winningsRouter.use(authenticate);

winningsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const winnings = await Winner.find({ userId: req.user._id })
      .populate('drawId')
      .sort({ createdAt: -1 });
    res.json(winnings);
  })
);

winningsRouter.post(
  '/:id/proof',
  authenticate,
  upload.single('proof'),
  asyncHandler(async (req, res) => {
    const winner = await Winner.findOne({ _id: req.params.id, userId: req.user._id });
    if (!winner) return res.status(404).json({ error: 'Winner record not found' });
    if (!req.file) return res.status(400).json({ error: 'Proof file required' });

    winner.proof = {
      fileUrl: `/uploads/${req.file.filename}`,
      uploadedAt: new Date(),
    };
    winner.verificationStatus = 'proof_submitted';
    await winner.save();

    res.json(winner);
  })
);

/* ==========================================================================
   7. DONATIONS ROUTER
   ========================================================================== */
export const donationsRouter = Router();
donationsRouter.use(authenticate);

donationsRouter.post(
  '/one-time',
  asyncHandler(async (req, res) => {
    const { charityId, amount } = z
      .object({ charityId: z.string(), amount: z.number().min(100) })
      .parse(req.body);

    const donation = await Donation.create({
      userId: req.user._id,
      charityId,
      type: 'one_time',
      amount,
      status: 'completed',
    });

    await Charity.findByIdAndUpdate(charityId, { $inc: { totalRaisedSnapshot: amount } });

    res.status(201).json(donation);
  })
);