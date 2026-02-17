import HabitLog from '@/models/HabitLog';
import mongoose from 'mongoose';

export async function calculateStreak(habitId: string, userId: string): Promise<number> {
    const logs = await HabitLog.find({
        habitId: new mongoose.Types.ObjectId(habitId),
        userId: new mongoose.Types.ObjectId(userId),
        completed: true,
    }).sort({ date: -1 });

    if (!logs || logs.length === 0) {
        return 0;
    }

    let streak = 0;
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Create yesterday date
    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split('T')[0];

    // If the most recent completion was before yesterday, streak is broken
    // (unless the first log IS today or yesterday)
    const lastLogDate = logs[0].date;
    if (lastLogDate !== today && lastLogDate !== yesterday) {
        return 0;
    }

    let currentExpectedDate = new Date(lastLogDate);

    for (const log of logs) {
        // Compare dates as strings YYYY-MM-DD
        if (log.date === currentExpectedDate.toISOString().split('T')[0]) {
            streak++;
            // Decrement expected date by 1 day
            currentExpectedDate.setDate(currentExpectedDate.getDate() - 1);
        } else {
            // Gap found
            break;
        }
    }

    return streak;
}
