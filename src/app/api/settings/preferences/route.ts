import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { verifyAuth } from '@/lib/auth';

export async function PUT(req: Request) {
    try {
        const { userId } = await verifyAuth(req);
        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { theme, notifications, privacy } = body;

        await connectToDatabase();
        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Initialize preferences if they don't exist
        if (!user.preferences) {
            user.preferences = {
                theme: 'system',
                notifications: { email: true, push: true, weeklyReport: true },
                privacy: { profileVisibility: 'public', showStreak: true, allowInvites: true }
            };
        }

        if (theme) user.preferences.theme = theme;

        if (notifications) {
            if (typeof notifications.email === 'boolean') user.preferences.notifications.email = notifications.email;
            if (typeof notifications.push === 'boolean') user.preferences.notifications.push = notifications.push;
            if (typeof notifications.weeklyReport === 'boolean') user.preferences.notifications.weeklyReport = notifications.weeklyReport;
        }

        if (privacy) {
            if (privacy.profileVisibility) user.preferences.privacy.profileVisibility = privacy.profileVisibility;
            if (typeof privacy.showStreak === 'boolean') user.preferences.privacy.showStreak = privacy.showStreak;
            if (typeof privacy.allowInvites === 'boolean') user.preferences.privacy.allowInvites = privacy.allowInvites;
        }

        await user.save();

        return NextResponse.json({
            message: 'Preferences updated successfully',
            preferences: user.preferences
        }, { status: 200 });

    } catch (error: any) {
        console.error("Settings Preferences update error:", error);
        return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
    }
}
