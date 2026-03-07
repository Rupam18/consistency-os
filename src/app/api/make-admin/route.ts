import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function GET(req: Request) {
    try {
        await connectToDatabase();

        // Use raw collection to bypass Mongoose 'strict' mode stripping since the dev server hasn't rebooted
        const collection = mongoose.connection.collection('users');
        const result = await collection.updateMany(
            {},
            { $set: { isAdmin: true } }
        );

        return NextResponse.json({
            message: `Success! Made ${result.modifiedCount} users into admins.`,
            instruction: "You can now safely delete this file and load /admin in the app."
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json(
            { message: 'Internal server error', error: error.message },
            { status: 500 }
        );
    }
}
