import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Challenge from '@/models/Challenge';

export async function GET(req: Request) {
    try {
        await connectToDatabase();

        // Fetch public challenges that haven't ended yet
        const challenges = await Challenge.find({
            endDate: { $gte: new Date() },
            type: 'public'
        }).sort({ createdAt: -1 });

        return NextResponse.json(challenges, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
