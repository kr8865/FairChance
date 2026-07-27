import mongoose, { Schema } from 'mongoose';
const jackpotSchema = new Schema({
    fromDrawId: { type: Schema.Types.ObjectId, ref: 'Draw' },
    toDrawId: { type: Schema.Types.ObjectId, ref: 'Draw' },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'applied', 'paid_out'], default: 'pending' },
}, { timestamps: { createdAt: true, updatedAt: false } });
export const JackpotRollover = mongoose.model('JackpotRollover', jackpotSchema);
