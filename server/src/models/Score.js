import mongoose, { Schema } from 'mongoose';
const scoreSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    stablefordPoints: { type: Number, required: true, min: 1, max: 45 },
    playedAt: { type: Date, required: true },
}, { timestamps: true });
scoreSchema.index({ userId: 1, playedAt: -1 });
export const Score = mongoose.model('Score', scoreSchema);
