import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { config } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { authRouter, meRouter, scoresRouter, charitiesRouter, drawsRouter, winningsRouter, donationsRouter, } from './routes/index.js';
import { billingRouter, stripeWebhookHandler } from './routes/billing.js';
import { adminRouter } from './routes/admin.js';
import { charityRouter } from "./routes/charity.js";
const app = express();
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
    origin:[ process.env.CLIENT_URL,
        "https://fair-chance-client-git-main-kr8865s-projects.vercel.app/" ],

    credentials: true,
}));
app.use(cookieParser());
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
}));
app.use('/uploads', express.static(path.resolve(config.uploadDir)));
app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), stripeWebhookHandler);
app.use(express.json());
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', name: 'Fairway Forward API' });
});
app.use('/api/auth', authRouter);
app.use('/api/me', meRouter);
app.use('/api/scores', scoresRouter);
app.use('/api/charities', charitiesRouter);
app.use('/api/draws', drawsRouter);
app.use('/api/winnings', winningsRouter);
app.use('/api/billing', billingRouter);
app.use('/api/donations', donationsRouter);
app.use('/api/admin', adminRouter);
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});


app.use("/api/charities", charityRouter);
async function start() {
    await connectDatabase(config.mongoUri);
    app.listen(config.port, () => {
        console.log(`Server running on http://localhost:${config.port}`);
    });
}
start().catch(console.error);
