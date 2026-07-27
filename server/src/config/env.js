import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 5001,

  mongoUri:
    process.env.MONGODB_URI ||
    "mongodb://127.0.0.1:27017/fairway_forward",

  jwtAccessSecret:
    process.env.JWT_ACCESS_SECRET || "dev-access-secret",

  jwtRefreshSecret:
    process.env.JWT_REFRESH_SECRET || "dev-refresh-secret",

  accessTokenExpiry: "15m",
  refreshTokenExpiry: "7d",

  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",

  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",

  uploadDir: process.env.UPLOAD_DIR || "uploads",

  emailFrom:
    process.env.EMAIL_FROM ||
    `"Fairway Forward" <${process.env.GMAIL_USER}>`,
};