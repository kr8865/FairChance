import dotenv from 'dotenv';
dotenv.config();
export const config = {
    port: parseInt(process.env.PORT || '5001', 10),
    mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fairway_forward',
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret-change-me',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-me',
    accessTokenExpiry: '15m',
    refreshTokenExpiry: '7d',
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    stripeMonthlyPriceId: process.env.STRIPE_MONTHLY_PRICE_ID || '',
    stripeYearlyPriceId: process.env.STRIPE_YEARLY_PRICE_ID || '',
    uploadDir: process.env.UPLOAD_DIR || 'uploads',
    emailFrom: process.env.EMAIL_FROM || 'Fairway Forward <noreply@fairwayforward.com>',
    smtpHost: process.env.SMTP_HOST || '',
    smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
    smtpSecure: process.env.SMTP_SECURE === 'true',
    smtpUser: process.env.SMTP_USER || '',
    smtpPass: process.env.SMTP_PASS || '',
};
