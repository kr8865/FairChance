import mongoose, { Schema } from 'mongoose';
const winnerSchema = new Schema({
    drawId: { type: Schema.Types.ObjectId, ref: 'Draw', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tier: { type: Number, enum: [3, 4, 5], required: true },
    prizeAmount: { type: Number, required: true },
    verificationStatus: {
        type: String,
        enum: ['pending_proof', 'proof_submitted', 'approved', 'rejected'],
        default: 'pending_proof',
    },
    proof: {
        fileUrl: String,
        uploadedAt: Date,
        reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        reviewedAt: Date,
        rejectionReason: String,
    },
    payoutStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
    paidAt: Date,
    paidBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
winnerSchema.index({ drawId: 1, tier: 1 });
winnerSchema.index({ userId: 1 });
winnerSchema.index({ verificationStatus: 1, payoutStatus: 1 });
export const Winner = mongoose.model('Winner', winnerSchema);
