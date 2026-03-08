
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
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

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json(
                { message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json(
                { message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        const token = signToken({ userId: user._id, email: user.email });

        return NextResponse.json(
            { token, user: { id: user._id, name: user.name, email: user.email } },
            { status: 200 }
        );
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
