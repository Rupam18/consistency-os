import User from '@/models/User';
import connectToDatabase from './db';

const BADGES = {
    STREAK_7: '7 Day Streak',
    STREAK_30: '30 Day Streak',
    STREAK_100: '100 Day Streak',
    XP_500: '500 XP',
    XP_1000: '1000 XP'
};

export function calculateLevel(xp: number): number {
    return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export async function awardXP(userId: string, amount: number) {
    await connectToDatabase();

    const user = await User.findById(userId);
    if (!user) return null;

    user.xp += amount;

    // Check level up
    const newLevel = calculateLevel(user.xp);
    const leveledUp = newLevel > user.level;
    if (leveledUp) {
        user.level = newLevel;
    }

    const newBadges: string[] = [];

    // Streak Logic
    const today = new Date().toISOString().split('T')[0];
    if (user.lastActiveDate !== today) {
        if (user.lastActiveDate) {
            const lastActive = new Date(user.lastActiveDate);
            const currentDate = new Date(today);
            const diffTime = Math.abs(currentDate.getTime() - lastActive.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                user.currentStreak += 1;
            } else if (diffDays > 1) {
                user.currentStreak = 1; // reset streak if missed a day
            }
        } else {
            user.currentStreak = 1;
        }
        user.lastActiveDate = today;
    }

    // Evaluate XP Badges
    if (user.xp >= 500 && !user.badges.includes(BADGES.XP_500)) {
        user.badges.push(BADGES.XP_500);
        newBadges.push(BADGES.XP_500);
    }
    if (user.xp >= 1000 && !user.badges.includes(BADGES.XP_1000)) {
        user.badges.push(BADGES.XP_1000);
        newBadges.push(BADGES.XP_1000);
    }

    // Evaluate Streak Badges
    if (user.currentStreak >= 7 && !user.badges.includes(BADGES.STREAK_7)) {
        user.badges.push(BADGES.STREAK_7);
        newBadges.push(BADGES.STREAK_7);
    }
    if (user.currentStreak >= 30 && !user.badges.includes(BADGES.STREAK_30)) {
        user.badges.push(BADGES.STREAK_30);
        newBadges.push(BADGES.STREAK_30);
    }
    if (user.currentStreak >= 100 && !user.badges.includes(BADGES.STREAK_100)) {
        user.badges.push(BADGES.STREAK_100);
        newBadges.push(BADGES.STREAK_100);
    }

    await user.save();

    return {
        xp: user.xp,
        level: user.level,
        currentStreak: user.currentStreak,
        leveledUp,
        newBadges
    };
}
