
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Habit from '@/models/Habit';
import { verifyToken } from '@/lib/auth';

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
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

        // Wait for params to be available
        const { id } = await params;

        const habit = await Habit.findOne({ _id: id, userId: decoded.userId });

        if (!habit) {
            return NextResponse.json(
                { message: 'Habit not found or unauthorized' },
                { status: 404 }
            );
        }

        await Habit.deleteOne({ _id: id });

        return NextResponse.json({ message: 'Habit deleted' }, { status: 200 });
    } catch (error) {
        console.error('Delete habit error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
