import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import Habit from '@/models/Habit';
import HabitLog from '@/models/HabitLog';
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

        // 1. Verify this user is an admin
        // Use raw collection to bypass NextJS/Mongoose dev schema caching
        const collection = mongoose.connection.collection('users');
        const requestingUser = await collection.findOne({ _id: new mongoose.Types.ObjectId(decoded.userId) });

        if (!requestingUser || !requestingUser.isAdmin) {
            return NextResponse.json(
                { message: 'Forbidden. Admin access required.' },
                { status: 403 }
            );
        }

        // 2. Fetch all users
        // Only select non-sensitive fields
        const users = await User.find({}).select('-password -preferences').sort({ createdAt: -1 });

        // 3. For each user, attach total habits created and total logs
        const usersWithStats = await Promise.all(users.map(async (user) => {
            const habitCount = await Habit.countDocuments({ userId: user._id });
            const completionsCount = await HabitLog.countDocuments({ userId: user._id, completed: true });

            return {
                ...user.toObject(),
                totalHabitsCreated: habitCount,
                totalHabitsCompleted: completionsCount
            };
        }));

        // 4. Calculate some global aggregations for the top of the dashboard
        const totalUsers = users.length;
        const totalHabitsGlobal = await Habit.countDocuments();
        const totalCompletionsGlobal = await HabitLog.countDocuments({ completed: true });

        return NextResponse.json({
            metrics: {
                totalUsers,
                totalHabitsGlobal,
                totalCompletionsGlobal
            },
            users: usersWithStats
        }, { status: 200 });

    } catch (error) {
        console.error('Get admin users error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
