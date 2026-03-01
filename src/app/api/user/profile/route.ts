import { NextResponse } from 'next/server';
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
        const user = await User.findById(userId).select('-password');

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Fetch Gamification Stats
        const totalHabitsCompleted = await HabitLog.countDocuments({ userId, completed: true });

        // Let's just return total challenges joined for now to match the UI spec "Challenges Joined"
        const challengesJoined = await ChallengeParticipant.countDocuments({ userId });

        // Fetch Recent Activity (last 5 completed habits)
        const recentActivity = await HabitLog.find({ userId, completed: true })
            .sort({ date: -1 })
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
        return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
    }
}
