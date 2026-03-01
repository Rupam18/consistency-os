import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Challenge from '@/models/Challenge';
import ChallengeParticipant from '@/models/ChallengeParticipant';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        await connectToDatabase();

        // Try to get user context if logged in
        let userId = null;
        try {
            const authResult = await verifyAuth(req);
            userId = authResult.userId;
        } catch (e) {
            // Unauthenticated requests just won't have myChallenges
        }

        const now = new Date();

        let myChallenges: any[] = [];
        let joinedChallengeIds: string[] = [];

        if (userId) {
            // Find challenges the user is participating in
            const participations = await ChallengeParticipant.find({ userId }).populate('challengeId');
            myChallenges = participations
                .map(p => p.challengeId)
                .filter(c => c && new Date((c as any).endDate) >= now);

            joinedChallengeIds = myChallenges.map((c: any) => c._id.toString());
        }

        // Fetch public challenges that haven't ended yet and user hasn't joined
        const discoverChallenges = await Challenge.find({
            _id: { $nin: joinedChallengeIds },
            endDate: { $gte: now },
            type: 'public'
        }).sort({ createdAt: -1 });

        return NextResponse.json({
            myChallenges,
            discoverChallenges
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
