import { Router } from 'express';
import { z } from 'zod';
import { registerUser, loginUser, sanitizeUser, getDashboardData, addScore, } from '../services/appService.js';
import {
    requestPasswordResetOtp,
    verifyPasswordResetOtp,
    resetPasswordWithToken,
} from '../services/passwordResetService.js';
import { authenticate, requireSubscription } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { Subscription } from '../models/Subscription.js';
import { Charity } from '../models/Charity.js';
import { Draw } from '../models/Draw.js';
import { Winner } from '../models/Winner.js';
import { Donation } from '../models/Donation.js';
import bcrypt from 'bcryptjs';
import { signAccessToken } from '../middleware/auth.js';
import { config } from '../config/env.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
const uploadDir = config.uploadDir;
if (!fs.existsSync(uploadDir))
    fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({ dest: uploadDir });
export const authRouter = Router();
const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    charityId: z.string().optional(),
    contributionPercent: z.number().min(10).max(100).optional(),
});
authRouter.post('/register', async (req, res) => {
    try {
        const data = registerSchema.parse(req.body);
        const result = await registerUser(data);
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.status(201).json({ user: result.user, accessToken: result.accessToken });
    }
    catch (err) {
        res.status(400).json({ error: err instanceof Error ? err.message : 'Registration failed' });
    }
});
authRouter.post('/login', async (req, res) => {
    try {
        const { email, password } = z.object({ email: z.string(), password: z.string() }).parse(req.body);
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
    }
    catch {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});
authRouter.post('/refresh', async (req, res) => {
    try {
        const token = req.cookies?.refreshToken || req.body.refreshToken;
        if (!token)
            return res.status(401).json({ error: 'No refresh token' });
        const jwt = await import('jsonwebtoken');
        const payload = jwt.default.verify(token, config.jwtRefreshSecret);
        const user = await User.findById(payload.sub);
        if (!user?.refreshTokenHash)
            return res.status(401).json({ error: 'Invalid refresh' });
        const valid = await bcrypt.compare(token, user.refreshTokenHash);
        if (!valid)
            return res.status(401).json({ error: 'Invalid refresh' });
        const accessToken = signAccessToken(user._id.toString(), user.role);
        res.json({ accessToken });
    }
    catch {
        res.status(401).json({ error: 'Invalid refresh token' });
    }
});
authRouter.post('/logout', authenticate, async (req, res) => {
    if (req.user) {
        req.user.refreshTokenHash = undefined;
        await req.user.save();
    }
    res.clearCookie('refreshToken');
    res.json({ ok: true });
});
authRouter.post('/forgot-password', async (req, res) => {
    try {
        const { email } = z.object({ email: z.string().email() }).parse(req.body);
        const result = await requestPasswordResetOtp(email);
        res.json(result);
    }
    catch (err) {
        res.status(400).json({ error: err instanceof Error ? err.message : 'Request failed' });
    }
});
authRouter.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = z
            .object({ email: z.string().email(), otp: z.string().length(6) })
            .parse(req.body);
        const result = await verifyPasswordResetOtp(email, otp);
        res.json(result);
    }
    catch (err) {
        res.status(400).json({ error: err instanceof Error ? err.message : 'Verification failed' });
    }
});
authRouter.post('/reset-password', async (req, res) => {
    try {
        const { email, resetToken, newPassword } = z
            .object({
            email: z.string().email(),
            resetToken: z.string().min(1),
            newPassword: z.string().min(8),
        })
            .parse(req.body);
        const result = await resetPasswordWithToken(email, resetToken, newPassword);
        res.json(result);
    }
    catch (err) {
        res.status(400).json({ error: err instanceof Error ? err.message : 'Reset failed' });
    }
});
export const meRouter = Router();
meRouter.use(authenticate);
meRouter.get('/', async (req, res) => {
    const data = await getDashboardData(req.user._id.toString());
    res.json(data);
});
meRouter.patch('/', async (req, res) => {
    const schema = z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        charityId: z.string().optional(),
        contributionPercent: z.number().min(10).max(100).optional(),
    });
    const data = schema.parse(req.body);
    const user = req.user;
    if (data.firstName)
        user.profile.firstName = data.firstName;
    if (data.lastName)
        user.profile.lastName = data.lastName;
    if (data.charityId)
        user.charityPreference.charityId = data.charityId;
    if (data.contributionPercent)
        user.charityPreference.contributionPercent = data.contributionPercent;
    await user.save();
    res.json({ user: sanitizeUser(user) });
});
meRouter.get('/subscription', async (req, res) => {
    const sub = await Subscription.findOne({ userId: req.user._id });
    res.json(sub);
});
export const scoresRouter = Router();
scoresRouter.use(authenticate, requireSubscription);
scoresRouter.get('/', async (req, res) => {
    const { Score } = await import('../models/Score.js');
    const scores = await Score.find({ userId: req.user._id }).sort({ playedAt: -1 }).limit(5);
    res.json(scores);
});
scoresRouter.post('/', async (req, res) => {
    try {
        const { stablefordPoints, playedAt } = z
            .object({
            stablefordPoints: z.number().int().min(1).max(45),
            playedAt: z.string().datetime().or(z.string()),
        })
            .parse(req.body);
        const scores = await addScore(req.user._id.toString(), stablefordPoints, new Date(playedAt));
        res.status(201).json(scores);
    }
    catch (err) {
        res.status(400).json({ error: err instanceof Error ? err.message : 'Invalid score' });
    }
});
export const charitiesRouter = Router();
charitiesRouter.get('/', async (req, res) => {
    const { q, category } = req.query;
    const filter = { isActive: true };
    if (category)
        filter.categories = category;
    let query = Charity.find(filter);
    if (q)
        query = Charity.find({ ...filter, $text: { $search: String(q) } });
    const charities = await query.sort({ isFeatured: -1, name: 1 });
    res.json(charities);
});
charitiesRouter.get('/featured', async (_req, res) => {
    const charities = await Charity.find({ isActive: true, isFeatured: true }).limit(3);
    res.json(charities);
});
charitiesRouter.get('/:slug', async (req, res) => {
    const charity = await Charity.findOne({ slug: req.params.slug, isActive: true });
    if (!charity)
        return res.status(404).json({ error: 'Charity not found' });
    res.json(charity);
});
export const drawsRouter = Router();
drawsRouter.get('/current', async (_req, res) => {
    const draw = await Draw.findOne({ status: 'published' }).sort({ publishedAt: -1 });
    res.json(draw);
});
drawsRouter.get('/:periodKey', async (req, res) => {
    const draw = await Draw.findOne({ periodKey: req.params.periodKey, status: 'published' });
    if (!draw)
        return res.status(404).json({ error: 'Draw not found' });
    res.json(draw);
});
export const winningsRouter = Router();
winningsRouter.use(authenticate);
winningsRouter.get('/', async (req, res) => {
    const winnings = await Winner.find({ userId: req.user._id }).populate('drawId').sort({ createdAt: -1 });
    res.json(winnings);
});
winningsRouter.post('/:id/proof', authenticate, upload.single('proof'), async (req, res) => {
    const winner = await Winner.findOne({ _id: req.params.id, userId: req.user._id });
    if (!winner)
        return res.status(404).json({ error: 'Winner record not found' });
    if (!req.file)
        return res.status(400).json({ error: 'Proof file required' });
    winner.proof.fileUrl = `/uploads/${path.basename(req.file.path)}`;
    winner.proof.uploadedAt = new Date();
    winner.verificationStatus = 'proof_submitted';
    await winner.save();
    res.json(winner);
});
export const donationsRouter = Router();
donationsRouter.use(authenticate);
donationsRouter.post('/one-time', async (req, res) => {
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
});
