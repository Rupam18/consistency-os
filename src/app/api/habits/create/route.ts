
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Habit from '@/models/Habit';
import { verifyToken } from '@/lib/auth';

export async function POST(req: Request) {
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

        const { title } = await req.json();

        if (!title) {
            return NextResponse.json(
                { message: 'Title is required' },
                { status: 400 }
            );
        }

        await connectToDatabase();

        const habit = await Habit.create({
            title,
            userId: decoded.userId,
        });

        return NextResponse.json(habit, { status: 201 });
    } catch (error) {
        console.error('Create habit error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
