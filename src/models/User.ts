
import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name for this user.'],
        maxlength: [60, 'Name cannot be more than 60 characters'],
    },
    email: {
        type: String,
        required: [true, 'Please provide an email for this user.'],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'Please provide a password for this user.'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    xp: {
        type: Number,
        default: 0,
    },
    level: {
        type: Number,
        default: 1,
    },
    badges: {
        type: [String],
        default: [],
    },
    currentStreak: {
        type: Number,
        default: 0,
    },
    lastActiveDate: {
        type: String,
        default: null, // "YYYY-MM-DD"
    },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
