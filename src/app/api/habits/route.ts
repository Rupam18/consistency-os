
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Habit from '@/models/Habit';
import HabitLog from '@/models/HabitLog';
import { verifyToken } from '@/lib/auth';
import { calculateStreak } from '@/lib/streak';
import ChallengeParticipant from '@/models/ChallengeParticipant';
import ChallengeLog from '@/models/ChallengeLog';

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token) as any;

        if (!decoded || !decoded.userId) {
            return NextResponse.json(
                { message: 'Invalid token' },
                { status: 401 }
            );
        }

        await connectToDatabase();

        const habits = await Habit.find({ userId: decoded.userId }).sort({ createdAt: -1 });

        const habitsWithStats = await Promise.all(habits.map(async (habit) => {
            const streak = await calculateStreak(habit._id.toString(), decoded.userId);
            const today = new Date().toISOString().split('T')[0];
            const log = await HabitLog.findOne({
                habitId: habit._id,
                userId: decoded.userId,
                date: today,
                completed: true
            });
            return {
                ...habit.toObject(),
                streak,
                completedToday: !!log
            };
        }));

        // Fetch User Challenges
        const participations = await ChallengeParticipant.find({ userId: decoded.userId }).populate('challengeId');

        const now = new Date();
        const challengesWithStats = await Promise.all(
            participations
                .filter(p => {
                    const challenge = p.challengeId as any;
                    return challenge && new Date(challenge.endDate) >= now;
                })
                .map(async (p: any) => {
                    const challenge = p.challengeId;
                    const today = new Date().toISOString().split('T')[0];
                    const log = await ChallengeLog.findOne({
                        challengeId: challenge._id,
                        userId: decoded.userId,
                        date: today,
                        completed: true
                    });

                    return {
                        _id: challenge._id.toString(),
                        title: challenge.title,
                        streak: p.currentStreak || 0,
                        completedToday: !!log,
                        createdAt: challenge.createdAt,
                        isChallenge: true
                    };
                })
        );

        const allItems = [...habitsWithStats, ...challengesWithStats].sort(
            (a, b) => new Date(b.createdAt as any).getTime() - new Date(a.createdAt as any).getTime()
        );

        return NextResponse.json(allItems, { status: 200 });
    } catch (error) {
        console.error('Get habits error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
