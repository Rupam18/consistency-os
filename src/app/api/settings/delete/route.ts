import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import Habit from '@/models/Habit';
import HabitLog from '@/models/HabitLog';
import ChallengeParticipant from '@/models/ChallengeParticipant';
import ChallengeLog from '@/models/ChallengeLog';
import { verifyAuth } from '@/lib/auth';

export async function DELETE(req: Request) {
    try {
        const { userId } = await verifyAuth(req);
        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();

        // Ensure user exists
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Cascade delete related records
        await Promise.all([
            Habit.deleteMany({ userId }),
            HabitLog.deleteMany({ userId }),
            ChallengeParticipant.deleteMany({ userId }),
            ChallengeLog.deleteMany({ userId }),
            User.findByIdAndDelete(userId)
        ]);

        return NextResponse.json({ message: 'Account and associated data deleted successfully' }, { status: 200 });

    } catch (error: any) {
        console.error("Account deletion error:", error);
        return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
    }
}
