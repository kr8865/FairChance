import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { getAdminReports, simulateDraw, publishDraw, sanitizeUser, } from '../services/appService.js';
import { User } from '../models/User.js';
import { Subscription } from '../models/Subscription.js';
import { Charity } from '../models/Charity.js';
import { Draw } from '../models/Draw.js';
import { Winner } from '../models/Winner.js';
import { DrawEntry } from '../models/DrawEntry.js';
import { activateDemoSubscription } from '../services/appService.js';
export const adminRouter = Router();
adminRouter.use(authenticate, requireAdmin);
adminRouter.get('/reports', async (_req, res) => {
    const reports = await getAdminReports();
    res.json(reports);
});
adminRouter.get('/users', async (_req, res) => {
    const users = await User.find({ role: 'subscriber' }).select('-passwordHash -refreshTokenHash');
    const subs = await Subscription.find({});
    const subMap = new Map(subs.map((s) => [s.userId.toString(), s]));
    res.json(users.map((u) => ({
        ...sanitizeUser(u),
        subscription: subMap.get(u._id.toString()) ?? null,
    })));
});
adminRouter.patch('/users/:id/status', async (req, res) => {
    const { status } = z.object({ status: z.enum(['active', 'suspended']) }).parse(req.body);
    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(user ? sanitizeUser(user) : null);
});
adminRouter.post('/users/:id/activate-sub', async (req, res) => {
    const { plan } = z.object({ plan: z.enum(['monthly', 'yearly']).default('monthly') }).parse(req.body);
    await activateDemoSubscription(req.params.id, plan);
    const sub = await Subscription.findOne({ userId: req.params.id });
    res.json(sub);
});
adminRouter.get('/charities', async (_req, res) => {
    const charities = await Charity.find({});
    res.json(charities);
});
adminRouter.post('/charities', async (req, res) => {
    const schema = z.object({
        slug: z.string(),
        name: z.string(),
        shortDescription: z.string(),
        fullDescription: z.string(),
        categories: z.array(z.string()).default([]),
        isFeatured: z.boolean().default(false),
        websiteUrl: z.string().optional(),
        coverImageUrl: z.string().optional(),
        logoUrl: z.string().optional(),
    });
    const data = schema.parse(req.body);
    const charity = await Charity.create(data);
    res.status(201).json(charity);
});
adminRouter.patch('/charities/:id', async (req, res) => {
    const charity = await Charity.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(charity);
});
adminRouter.delete('/charities/:id', async (req, res) => {
    await Charity.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ ok: true });
});
adminRouter.get('/draws', async (_req, res) => {
    const draws = await Draw.find({}).sort({ periodKey: -1 });
    res.json(draws);
});
adminRouter.post('/draws/:periodKey/simulate', async (req, res) => {
    const periodKey = String(req.params.periodKey);
    const { mode } = z
        .object({ mode: z.enum(['random', 'weighted_frequency']).default('random') })
        .parse(req.body);
    const result = await simulateDraw(periodKey, mode);
    res.json(result);
});
adminRouter.post('/draws/:periodKey/publish', async (req, res) => {
    try {
        const periodKey = String(req.params.periodKey);
        const draw = await publishDraw(periodKey, req.user._id.toString());
        res.json(draw);
    }
    catch (err) {
        res.status(400).json({ error: err instanceof Error ? err.message : 'Publish failed' });
    }
});
adminRouter.get('/draws/:periodKey/entries', async (req, res) => {
    const draw = await Draw.findOne({ periodKey: req.params.periodKey });
    if (!draw)
        return res.status(404).json({ error: 'Draw not found' });
    const entries = await DrawEntry.find({ drawId: draw._id }).populate('userId', 'email profile');
    res.json(entries);
});
adminRouter.get('/winners', async (_req, res) => {
    const winners = await Winner.find({})
        .populate('userId', 'email profile')
        .populate('drawId', 'periodKey')
        .sort({ createdAt: -1 });
    res.json(winners);
});
adminRouter.patch('/winners/:id/verify', async (req, res) => {
    const schema = z.object({
        verificationStatus: z.enum(['approved', 'rejected']),
        rejectionReason: z.string().optional(),
    });
    const data = schema.parse(req.body);
    const winner = await Winner.findById(req.params.id);
    if (!winner)
        return res.status(404).json({ error: 'Not found' });
    winner.verificationStatus = data.verificationStatus;
    winner.proof.reviewedAt = new Date();
    winner.proof.reviewedBy = req.user._id;
    if (data.rejectionReason)
        winner.proof.rejectionReason = data.rejectionReason;
    await winner.save();
    res.json(winner);
});
adminRouter.patch('/winners/:id/payout', async (req, res) => {
    const winner = await Winner.findById(req.params.id);
    if (!winner)
        return res.status(404).json({ error: 'Not found' });
    winner.payoutStatus = 'paid';
    winner.paidAt = new Date();
    winner.paidBy = req.user._id;
    await winner.save();
    res.json(winner);
});
