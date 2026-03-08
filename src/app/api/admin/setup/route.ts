import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';

export async function GET() {
    try {
        await connectToDatabase();

        const email = 'admin@nozeroday.com';

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email });
        if (existingAdmin) {
            return NextResponse.json(
                { message: 'Admin user already exists. You can log in at /admin/login.' },
                { status: 200 }
            );
        }

        // Create the default admin
        const hashedPassword = await bcrypt.hash('adminpassword', 10);

        const newAdmin = new User({
            name: 'System Admin',
            email,
            password: hashedPassword,
            isAdmin: true,
            level: 99,
            xp: 9999,
            badges: ['Admin', 'Founder']
        });

        await newAdmin.save();

        return NextResponse.json(
            {
                message: 'Admin account created successfully!',
                credentials: {
                    email: 'admin@nozeroday.com',
                    password: 'adminpassword'
                },
                instruction: 'Please go to /admin/login to sign in.'
            },
            { status: 201 }
        );

    } catch (error: any) {
        console.error('Admin setup error:', error);
        return NextResponse.json(
            { message: 'Internal server error', error: error.message },
            { status: 500 }
        );
    }
}
