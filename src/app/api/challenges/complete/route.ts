import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import ChallengeLog from '@/models/ChallengeLog';
import ChallengeParticipant from '@/models/ChallengeParticipant';
import { verifyAuth } from '@/lib/auth';
import { awardXP } from '@/lib/gamification';

export async function POST(req: Request) {
    try {
        const { userId } = await verifyAuth(req);
        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();
        const { challengeId } = await req.json();

        if (!challengeId) {
            return NextResponse.json({ message: 'Missing challengeId' }, { status: 400 });
        }

        // Check if participant
        const participant = await ChallengeParticipant.findOne({ userId, challengeId });
        if (!participant) {
            return NextResponse.json({ message: 'You must join the challenge first' }, { status: 403 });
        }

        const today = new Date().toISOString().split('T')[0];

        // Check if already completed today
        const existingLog = await ChallengeLog.findOne({
            userId,
            challengeId,
            date: today,
        });

        if (existingLog) {
            return NextResponse.json({ message: 'Already completed for today' }, { status: 400 });
        }

        const log = await ChallengeLog.create({
            userId,
            challengeId,
            date: today,
            completed: true,
        });

        // Streak Calculation
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (participant.lastCompletedDate === yesterdayStr) {
            participant.currentStreak += 1;
        } else {
            // Not completed yesterday, streak breaks or starts at 1
            participant.currentStreak = 1;
        }

        participant.longestStreak = Math.max(participant.longestStreak || 0, participant.currentStreak);
        participant.lastCompletedDate = today;
        await participant.save();

        const gamification = await awardXP(userId, 15);

        return NextResponse.json({
            ...log.toObject(),
            gamification
        }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
