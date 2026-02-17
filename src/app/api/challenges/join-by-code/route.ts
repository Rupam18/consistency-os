import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import ChallengeParticipant from '@/models/ChallengeParticipant';
import Challenge from '@/models/Challenge';
import { verifyAuth } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const { userId } = await verifyAuth(req);
        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();
        const { inviteCode } = await req.json();

        if (!inviteCode) {
            return NextResponse.json({ message: 'Missing invite code' }, { status: 400 });
        }

        const challenge = await Challenge.findOne({ inviteCode });
        if (!challenge) {
            return NextResponse.json({ message: 'Invalid invite code' }, { status: 404 });
        }

        // Check if already joined
        const existingParticipant = await ChallengeParticipant.findOne({
            userId,
            challengeId: challenge._id,
        });

        if (existingParticipant) {
            return NextResponse.json({ message: 'Already joined this challenge' }, { status: 400 });
        }

        const participant = await ChallengeParticipant.create({
            userId,
            challengeId: challenge._id,
            joinedAt: new Date(),
        });

        // Increment participants count
        await Challenge.findByIdAndUpdate(challenge._id, { $inc: { participantsCount: 1 } });

        return NextResponse.json(participant, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
