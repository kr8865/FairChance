import mongoose, { Schema } from 'mongoose';
const drawEntrySchema = new Schema({
    drawId: { type: Schema.Types.ObjectId, ref: 'Draw', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    scoresSnapshot: [
        {
            stablefordPoints: Number,
            playedAt: Date,
        },
    ],
    matchedTier: { type: Number, enum: [3, 4, 5, null] },
    matchedCount: Number,
    isWinner: { type: Boolean, default: false },
}, { timestamps: { createdAt: true, updatedAt: false } });
drawEntrySchema.index({ drawId: 1, userId: 1 }, { unique: true });
drawEntrySchema.index({ drawId: 1, isWinner: 1 });
export const DrawEntry = mongoose.model('DrawEntry', drawEntrySchema);
