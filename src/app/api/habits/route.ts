
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Habit from '@/models/Habit';
import { verifyToken } from '@/lib/auth';

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

        return NextResponse.json(habits, { status: 200 });
    } catch (error) {
        console.error('Get habits error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
