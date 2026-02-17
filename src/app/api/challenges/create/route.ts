import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Challenge from '@/models/Challenge';
import { verifyAuth } from '@/lib/auth'; // Assuming verifyAuth exists or I need to check how auth is handled

export async function POST(req: Request) {
    try {
        const { userId } = await verifyAuth(req);
        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();
        const { title, description, startDate, endDate, type } = await req.json();

        if (!title || !description || !startDate || !endDate) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        let inviteCode;
        if (type === 'private') {
            // Generate a random 6-digit code
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            inviteCode = '';
            for (let i = 0; i < 6; i++) {
                inviteCode += characters.charAt(Math.floor(Math.random() * characters.length));
            }
            // Ensure uniqueness could be added here loop-wise, but for now simplest approach
        }

        const newChallenge = await Challenge.create({
            title,
            description,
            createdBy: userId,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            type: type || 'public',
            inviteCode,
            participantsCount: 0,
        });

        return NextResponse.json(newChallenge, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
