import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { signToken } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { message: 'Missing email or password' },
                { status: 400 }
            );
        }

        await connectToDatabase();

        // Use raw collection to bypass NextJS/Mongoose dev schema caching 
        // which strips new fields until the dev server is restarted.
        const collection = mongoose.connection.collection('users');
        const user = await collection.findOne({ email });

        if (!user) {
            return NextResponse.json(
                { message: 'Invalid admin credentials' },
                { status: 401 }
            );
        }

        // CRITICAL CHECK: Ensure this user actually has admin privileges
        if (!user.isAdmin) {
            return NextResponse.json(
                { message: 'Access Denied: You do not have administrator privileges.' },
                { status: 403 }
            );
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json(
                { message: 'Invalid admin credentials' },
                { status: 401 }
            );
        }

        // Sign token with a longer expiration for admin convenience, or attach a specific admin role claim
        const token = signToken({ userId: user._id, email: user.email, role: 'admin' });

        return NextResponse.json(
            { token, user: { id: user._id, name: user.name, email: user.email, isAdmin: true } },
            { status: 200 }
        );
    } catch (error) {
        console.error('Admin login error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
