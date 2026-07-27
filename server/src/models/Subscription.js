import mongoose, { Schema } from 'mongoose';
const subscriptionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    stripeCustomerId: String,
    stripeSubscriptionId: { type: String, sparse: true },
    plan: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
    status: {
        type: String,
        enum: ['active', 'past_due', 'canceled', 'lapsed', 'trialing', 'none'],
        default: 'none',
    },
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    cancelAtPeriodEnd: { type: Boolean, default: false },
    priceAmount: { type: Number, default: 999 },
    currency: { type: String, default: 'INR' },
    lastWebhookEventId: String,
}, { timestamps: true });
subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ stripeSubscriptionId: 1 }, { sparse: true });
export const Subscription = mongoose.model('Subscription', subscriptionSchema);
