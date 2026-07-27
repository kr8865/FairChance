import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { User } from '../models/User.js';
import { Subscription } from '../models/Subscription.js';
export function signAccessToken(userId, role) {
    return jwt.sign({ sub: userId, role }, config.jwtAccessSecret, {
        expiresIn: config.accessTokenExpiry,
    });
}
export function signRefreshToken(userId) {
    return jwt.sign({ sub: userId }, config.jwtRefreshSecret, {
        expiresIn: config.refreshTokenExpiry,
    });
}
export async function authenticate(req, res, next) {
    try {
        const header = req.headers.authorization;
        if (!header?.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        const token = header.slice(7);
        const payload = jwt.verify(token, config.jwtAccessSecret);
        const user = await User.findById(payload.sub);
        if (!user || user.status !== 'active') {
            res.status(401).json({ error: 'Invalid or inactive user' });
            return;
        }
        req.user = user;
        const sub = await Subscription.findOne({ userId: user._id });
        req.subscriptionActive = sub?.status === 'active' || sub?.status === 'trialing';
        next();
    }
    catch {
        res.status(401).json({ error: 'Invalid token' });
    }
}
export function requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        res.status(403).json({ error: 'Admin access required' });
        return;
    }
    next();
}
export function requireSubscription(req, res, next) {
    if (!req.subscriptionActive) {
        res.status(403).json({ error: 'Active subscription required', code: 'SUBSCRIPTION_REQUIRED' });
        return;
    }
    next();
}
export async function optionalAuth(req, _res, next) {
    try {
        const header = req.headers.authorization;
        if (header?.startsWith('Bearer ')) {
            const token = header.slice(7);
            const payload = jwt.verify(token, config.jwtAccessSecret);
            const user = await User.findById(payload.sub);
            if (user && user.status === 'active') {
                req.user = user;
                const sub = await Subscription.findOne({ userId: user._id });
                req.subscriptionActive = sub?.status === 'active' || sub?.status === 'trialing';
            }
        }
    }
    catch {
        // optional — ignore
    }
    next();
}
