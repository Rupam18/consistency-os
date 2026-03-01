import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Challenge from '@/models/Challenge';
import ChallengeParticipant from '@/models/ChallengeParticipant';
import ChallengeLog from '@/models/ChallengeLog';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();
        // Await the params object before accessing properties
        const { id } = await params;

        const challenge = await Challenge.findById(id).populate('createdBy', 'name');
        if (!challenge) {
            return NextResponse.json({ message: 'Challenge not found' }, { status: 404 });
        }

        const participants = await ChallengeParticipant.find({ challengeId: id }).populate('userId', 'name email');
        const logs = await ChallengeLog.find({ challengeId: id });

        // Calculate Leaderboard
        const today = new Date().toISOString().split('T')[0];

        const leaderboard = participants.map((p) => {
            const user = p.userId as any; // Type assertion since it's populated
            const userLogs = logs.filter(l => l.userId.toString() === user._id.toString());
            const completedToday = userLogs.some(l => l.date === today);

            // Use the streak directly from the participant document
            const currentStreak = p.currentStreak || 0;
            const longestStreak = p.longestStreak || 0;
            const totalCompletions = userLogs.length;

            return {
                userId: user._id,
                name: user.name,
                email: user.email,
                completedToday,
                totalCompletions,
                currentStreak,
                longestStreak
            };
        });

        // Sort by current streak desc
        leaderboard.sort((a, b) => b.currentStreak - a.currentStreak);

        return NextResponse.json({
            challenge,
            participantsCount: participants.length,
            leaderboard,
        }, { status: 200 });

    } catch (error: any) {
        console.error("Error details:", error);
        return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
