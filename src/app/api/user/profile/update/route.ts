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
        const { name, profilePicture } = body;

        if (!name || name.trim() === '') {
            return NextResponse.json({ message: 'Name is required' }, { status: 400 });
        }

        await connectToDatabase();

        // Find and update the user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { name: name.trim(), profilePicture: profilePicture || '' },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            message: 'Profile updated successfully',
            user: updatedUser
        }, { status: 200 });

    } catch (error: any) {
        console.error("Profile update error:", error);
        return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
    }
}
