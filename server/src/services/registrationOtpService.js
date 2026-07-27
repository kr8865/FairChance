import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { RegistrationOtp } from '../models/RegistrationOtp.js';
import { sendRegistrationOtpEmail } from './emailService.js';

const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 5;

function generateOtp() {
  return crypto.randomInt(100000, 999999).toString();
}

export async function requestRegistrationOtp(email) {
  const normalizedEmail = email.toLowerCase().trim();

  // Check if email already registered
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new Error('Email is already registered. Please sign in instead.');
  }

  // Invalidate previous unverified OTPs for this email
  await RegistrationOtp.deleteMany({ email: normalizedEmail, verified: false });

  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 8);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await RegistrationOtp.create({
    email: normalizedEmail,
    otpHash,
    expiresAt,
    attempts: 0,
    verified: false,
  });

  await sendRegistrationOtpEmail(normalizedEmail, otp);
  return { message: 'Verification code sent to your email.' };
}

export async function verifyRegistrationOtp(email, otp) {
  const normalizedEmail = email.toLowerCase().trim();

  const record = await RegistrationOtp.findOne({
    email: normalizedEmail,
    verified: false,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!record) {
    throw new Error('Invalid or expired verification code. Please request a new code.');
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    throw new Error('Too many failed attempts. Please request a new verification code.');
  }

  const isValid = await bcrypt.compare(otp, record.otpHash);
  if (!isValid) {
    await RegistrationOtp.findByIdAndUpdate(record._id, { $inc: { attempts: 1 } });
    throw new Error('Invalid verification code. Please try again.');
  }

  record.verified = true;
  await record.save();

  return { message: 'Email verified successfully.', verified: true };
}
