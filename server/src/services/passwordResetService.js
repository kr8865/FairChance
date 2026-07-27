import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { PasswordResetOtp } from '../models/PasswordResetOtp.js';
import { sendPasswordResetOtpEmail } from './emailService.js';
import { config } from '../config/env.js';

const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const GENERIC_MESSAGE =
  'If an account exists with this email, you will receive a verification code shortly.';

function generateOtp() {
  return crypto.randomInt(100000, 999999).toString();
}

export async function requestPasswordResetOtp(email) {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail, status: 'active' });

  // Security: Prevent user enumeration by returning the generic message early
  if (!user) {
    return { message: GENERIC_MESSAGE };
  }

  // Invalidate any existing unused OTPs for this email
  await PasswordResetOtp.updateMany(
    { email: normalizedEmail, used: false },
    { used: true }
  );

  const otp = generateOtp();
  
  // 8 rounds is fast enough for server performance while remaining secure for short-lived OTPs
  const otpHash = await bcrypt.hash(otp, 8);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await PasswordResetOtp.create({
    userId: user._id,
    email: normalizedEmail,
    otpHash,
    expiresAt,
    attempts: 0,
    used: false,
  });

  // Safely send the email without crashing the request on provider error
  try {
    await sendPasswordResetOtpEmail(user, otp);
  } catch (err) {
    console.error(`Failed to send password reset email to ${normalizedEmail}:`, err);
    // You can choose whether to throw or fail gracefully depending on your logging setup
    throw new Error('Could not send verification email. Please try again later.');
  }

  return { message: GENERIC_MESSAGE };
}

export async function verifyPasswordResetOtp(email, otp) {
  const normalizedEmail = email.toLowerCase().trim();

  // Find the latest unused, non-expired OTP record
  const record = await PasswordResetOtp.findOne({
    email: normalizedEmail,
    used: false,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!record) {
    throw new Error('Invalid or expired verification code');
  }

  // Check attempt limit
  if (record.attempts >= MAX_ATTEMPTS) {
    // Optionally mark as used so it cannot be tried further
    record.used = true;
    await record.save();
    throw new Error('Too many attempts. Please request a new code.');
  }

  const valid = await bcrypt.compare(otp, record.otpHash);

  if (!valid) {
    // Atomic increment to prevent concurrency race conditions
    await PasswordResetOtp.findByIdAndUpdate(record._id, {
      $inc: { attempts: 1 },
    });
    throw new Error('Invalid verification code');
  }

  // Mark OTP as used on successful verification
  record.used = true;
  await record.save();

  // Issue a short-lived reset token (15 mins)
  const resetToken = jwt.sign(
    { sub: record.userId.toString(), email: normalizedEmail, purpose: 'password_reset' },
    config.jwtAccessSecret,
    { expiresIn: '15m' }
  );

  return { resetToken };
}

export async function resetPasswordWithToken(email, resetToken, newPassword) {
  const normalizedEmail = email.toLowerCase().trim();

  let payload;
  try {
    payload = jwt.verify(resetToken, config.jwtAccessSecret);
  } catch {
    throw new Error('Invalid or expired reset token');
  }

  if (payload.purpose !== 'password_reset' || payload.email !== normalizedEmail) {
    throw new Error('Invalid reset token');
  }

  const user = await User.findById(payload.sub);
  if (!user || user.status !== 'active') {
    throw new Error('User not found or account is inactive');
  }

  // Hash new password and invalidate active refresh tokens/sessions
  user.passwordHash = await bcrypt.hash(newPassword, 12);
  user.refreshTokenHash = undefined;
  await user.save();

  return { message: 'Password reset successfully' };
}