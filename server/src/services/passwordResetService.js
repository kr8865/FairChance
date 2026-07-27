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

  if (!user) {
    return { message: GENERIC_MESSAGE };
  }

  await PasswordResetOtp.updateMany({ email: normalizedEmail, used: false }, { used: true });

  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await PasswordResetOtp.create({
    userId: user._id,
    email: normalizedEmail,
    otpHash,
    expiresAt,
  });

  await sendPasswordResetOtpEmail(user, otp);

  return { message: GENERIC_MESSAGE };
}

export async function verifyPasswordResetOtp(email, otp) {
  const normalizedEmail = email.toLowerCase().trim();
  const record = await PasswordResetOtp.findOne({
    email: normalizedEmail,
    used: false,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!record) {
    throw new Error('Invalid or expired verification code');
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    throw new Error('Too many attempts. Please request a new code.');
  }

  const valid = await bcrypt.compare(otp, record.otpHash);
  if (!valid) {
    record.attempts += 1;
    await record.save();
    throw new Error('Invalid verification code');
  }

  record.used = true;
  await record.save();

  const resetToken = jwt.sign(
    { sub: record.userId.toString(), email: normalizedEmail, purpose: 'password_reset' },
    config.jwtAccessSecret,
    { expiresIn: '15m' },
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
    throw new Error('User not found');
  }

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  user.refreshTokenHash = undefined;
  await user.save();

  return { message: 'Password reset successfully' };
}
