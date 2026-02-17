import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import HabitLog from '@/models/HabitLog';
import { verifyToken } from '@/lib/auth';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();

        // 1. Auth Check
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);
        if (!decoded || typeof decoded === 'string') {
            return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
        }

        const userId = decoded.userId;

        // 2. Date Range Calculation (Last 90 days)
        const today = new Date();
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(today.getDate() - 90);
        const startDateStr = ninetyDaysAgo.toISOString().split('T')[0];

        // 3. Aggregation Query
        // We want to group by 'date' and count the number of logs per date.
        const logs = await HabitLog.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    date: { $gte: startDateStr },
                    completed: true
                }
            },
            {
                $group: {
                    _id: "$date",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    count: 1
                }
            },
            {
                $sort: { date: 1 }
            }
        ]);

        return NextResponse.json(logs, { status: 200 });

    } catch (error) {
        console.error('Error fetching heatmap data:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
