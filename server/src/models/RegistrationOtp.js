import mongoose, { Schema } from 'mongoose';

const registrationOtpSchema = new Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

registrationOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
registrationOtpSchema.index({ email: 1, verified: 1, createdAt: -1 });

export const RegistrationOtp = mongoose.model('RegistrationOtp', registrationOtpSchema);
