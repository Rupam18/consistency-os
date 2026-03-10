import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import HabitLog from '@/models/HabitLog';
import ChallengeParticipant from '@/models/ChallengeParticipant';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const { userId } = await verifyAuth(req);
        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();

        // Use a string for the ID query to be safe, though User.findById usually handles this
        const user = await User.findById(userId.toString()).select('-password');

        if (!user) {
            console.error(`[Profile API] User with ID ${userId} not found in database.`);
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Fetch Gamification Stats
        // isAdmin is handled by the schema, so user.isAdmin works if it's truthy
        const totalHabitsCompleted = await HabitLog.countDocuments({ userId, completed: true });

        // Let's just return total challenges joined for now to match the UI spec "Challenges Joined"
        const challengesJoined = await ChallengeParticipant.countDocuments({ userId });

        // Fetch Recent Activity (last 5 completed habits)
        // Sorting by createdAt is usually more reliable than 'date' string
        const recentActivity = await HabitLog.find({ userId, completed: true })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('habitId', 'title');

        return NextResponse.json({
            user: {
                ...user.toObject(),
                totalHabitsCompleted,
                challengesJoined,
                recentActivity
            }
        }, { status: 200 });
    } catch (error: any) {
        console.error('[Profile API Error]:', error);
        return NextResponse.json({
            message: error.message || 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
