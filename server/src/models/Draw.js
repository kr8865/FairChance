import mongoose, { Schema } from 'mongoose';
const drawSchema = new Schema({
    periodKey: { type: String, required: true, unique: true },
    status: {
        type: String,
        enum: ['draft', 'simulated', 'published', 'archived'],
        default: 'draft',
    },
    generationMode: {
        type: String,
        enum: ['random', 'weighted_frequency'],
        default: 'random',
    },
    winningNumbers: {
        tier5: [Number],
        tier4: [Number],
        tier3: [Number],
    },
    prizePoolSnapshot: Schema.Types.Mixed,
    publishedAt: Date,
    publishedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
drawSchema.index({ status: 1, publishedAt: -1 });
export const Draw = mongoose.model('Draw', drawSchema);
