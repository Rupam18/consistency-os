import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import HabitLog from '@/models/HabitLog';
import Habit from '@/models/Habit';
import { verifyToken } from '@/lib/auth';
import type { JwtPayload } from 'jsonwebtoken';
import { awardXP } from '@/lib/gamification';

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);

        if (!decoded || typeof decoded !== 'object' || !decoded.userId) {
            return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
        }

        const userId = (decoded as JwtPayload).userId;

        await connectToDatabase();

        const body = await req.json();
        const { habitId } = body;

        if (!habitId) {
            return NextResponse.json({ message: 'Habit ID is required' }, { status: 400 });
        }

        // Verify habit ownership
        const habit = await Habit.findOne({ _id: habitId, userId });
        if (!habit) {
            return NextResponse.json({ message: 'Habit not found' }, { status: 404 });
        }

        const today = new Date().toISOString().split('T')[0];

        // Check if already completed
        const existingLog = await HabitLog.findOne({
            habitId,
            userId,
            date: today
        });

        if (existingLog) {
            return NextResponse.json({ message: 'Already completed today' }, { status: 200 });
        }

        // Create log
        await HabitLog.create({
            habitId,
            userId,
            date: today,
            completed: true
        });

        const gamification = await awardXP(userId as string, 10);

        return NextResponse.json({
            message: 'Habit completed',
            gamification
        }, { status: 201 });

    } catch (error) {
        console.error('Error completing habit:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
