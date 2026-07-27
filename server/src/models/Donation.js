import mongoose, { Schema } from 'mongoose';
const donationSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    charityId: { type: Schema.Types.ObjectId, ref: 'Charity', required: true },
    type: { type: String, enum: ['subscription_allocation', 'one_time'], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    subscriptionId: { type: Schema.Types.ObjectId, ref: 'Subscription' },
    stripePaymentIntentId: String,
    periodStart: Date,
    periodEnd: Date,
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
}, { timestamps: { createdAt: true, updatedAt: false } });
export const Donation = mongoose.model('Donation', donationSchema);
