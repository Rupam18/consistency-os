import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';

export async function GET(req: Request) {
    try {
        await connectToDatabase();

        // Fetch all users and sort by XP descending, then currentStreak descending
        const users = await User.find({})
            .select('name xp level currentStreak badges')
            .sort({ xp: -1, currentStreak: -1 })
            .limit(100);

        return NextResponse.json(users, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
    }
}
