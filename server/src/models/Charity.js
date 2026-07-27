import mongoose, { Schema } from 'mongoose';
const charitySchema = new Schema({
    slug: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String, required: true },
    shortDescription: { type: String, required: true },
    fullDescription: { type: String, required: true },
    logoUrl: String,
    coverImageUrl: String,
    categories: [{ type: String }],
    countryCode: { type: String, default: 'IN' },
    websiteUrl: String,
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    events: [
        {
            title: String,
            description: String,
            eventDate: Date,
            location: String,
            imageUrl: String,
        },
    ],
    totalRaisedSnapshot: { type: Number, default: 0 },
}, { timestamps: true });
charitySchema.index({ isActive: 1, isFeatured: 1 });
charitySchema.index({ name: 'text', shortDescription: 'text' });
export const Charity = mongoose.model('Charity', charitySchema);
