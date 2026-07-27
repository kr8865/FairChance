export const config = {
  port: Number(process.env.PORT) || 5001,

  mongoUri: process.env.MONGODB_URI,

  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,

  // Add these two lines
  accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || "15m",
  refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || "7d",

  clientUrl: process.env.CLIENT_URL,

  brevoApiKey: process.env.BREVO_API_KEY,

  emailFrom: process.env.EMAIL_FROM,
  emailFromName: process.env.EMAIL_FROM_NAME || "Fairway Forward",

  uploadDir: process.env.UPLOAD_DIR || "uploads",
};