import bcrypt from 'bcryptjs';
import { connectDatabase } from '../config/database.js';
import { config } from '../config/env.js';
import { User } from '../models/User.js';
import { Subscription } from '../models/Subscription.js';
import { Charity } from '../models/Charity.js';
import { Score } from '../models/Score.js';
async function seed() {
    await connectDatabase(config.mongoUri);
    await Promise.all([
        User.deleteMany({}),
        Subscription.deleteMany({}),
        Charity.deleteMany({}),
        Score.deleteMany({}),
    ]);
    const adminHash = await bcrypt.hash('Admin123!', 12);
    const userHash = await bcrypt.hash('User12345!', 12);
    const admin = await User.create({
        email: 'admin@fairwayforward.com',
        passwordHash: adminHash,
        role: 'admin',
        profile: { firstName: 'Admin', lastName: 'User' },
        emailVerified: true,
    });
    const subscriber = await User.create({
        email: 'demo@fairwayforward.com',
        passwordHash: userHash,
        role: 'subscriber',
        profile: { firstName: 'Demo', lastName: 'Player' },
        emailVerified: true,
    });
    const charities = await Charity.insertMany([
        {
            slug: 'youth-golf-foundation',
            name: 'Youth Golf Foundation',
            shortDescription: 'Bringing golf to underserved communities across the UK.',
            fullDescription: 'The Youth Golf Foundation provides equipment, coaching, and access to courses for young people who would otherwise never pick up a club. Every subscription helps fund a new generation of players.',
            categories: ['youth', 'sport'],
            isFeatured: true,
            coverImageUrl: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800',
            events: [
                {
                    title: 'Community Golf Day',
                    description: 'Free coaching session for local youth',
                    eventDate: new Date('2026-08-15'),
                    location: 'Manchester',
                },
            ],
            totalRaisedSnapshot: 125000,
        },
        {
            slug: 'green-horizons',
            name: 'Green Horizons Trust',
            shortDescription: 'Environmental restoration through community sport.',
            fullDescription: 'Green Horizons combines ecological restoration with community wellbeing programmes. Your contribution supports tree planting and accessible outdoor recreation.',
            categories: ['environment', 'community'],
            isFeatured: true,
            coverImageUrl: 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=800',
            totalRaisedSnapshot: 89000,
        },
        {
            slug: 'fair-play-health',
            name: 'Fair Play Health Initiative',
            shortDescription: 'Mental health support through active living.',
            fullDescription: 'Fair Play Health Initiative uses sport and outdoor activity as pathways to mental wellness, offering counselling and group programmes nationwide.',
            categories: ['health', 'mental-health'],
            isFeatured: false,
            coverImageUrl: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800',
            totalRaisedSnapshot: 67000,
        },
    ]);
    subscriber.charityPreference.charityId = charities[0]._id;
    subscriber.charityPreference.contributionPercent = 15;
    await subscriber.save();
    const now = new Date();
    const end = new Date(now);
    end.setMonth(end.getMonth() + 1);
    await Subscription.create({
        userId: subscriber._id,
        plan: 'monthly',
        status: 'active',
        priceAmount: 999,
        currentPeriodStart: now,
        currentPeriodEnd: end,
    });
    const demoScores = [38, 34, 36, 32, 35];
    for (let i = 0; i < demoScores.length; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() - i * 7);
        await Score.create({ userId: subscriber._id, stablefordPoints: demoScores[i], playedAt: d });
    }
    console.log('Seed complete!');
    console.log('Admin: admin@fairwayforward.com / Admin123!');
    console.log('Demo user: demo@fairwayforward.com / User12345!');
    console.log(`Admin ID: ${admin._id}`);
    process.exit(0);
}
seed().catch((err) => {
    console.error(err);
    process.exit(1);
});
