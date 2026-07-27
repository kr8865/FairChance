import mongoose, { Schema } from 'mongoose';
const userSchema = new Schema({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['subscriber', 'admin'], default: 'subscriber' },
    profile: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        avatarUrl: String,
        countryCode: { type: String, default: 'INR' },
        timezone: { type: String, default: 'INDIA' },
    },
    charityPreference: {
        charityId: { type: Schema.Types.ObjectId, ref: 'Charity' },
        contributionPercent: { type: Number, default: 10, min: 10, max: 100 },
    },
    emailVerified: { type: Boolean, default: false },
    refreshTokenHash: String,
    status: { type: String, enum: ['active', 'suspended', 'deleted'], default: 'active' },
}, { timestamps: true });
userSchema.index({ role: 1, status: 1 });
export const User = mongoose.model('User', userSchema);
