
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
    isAdmin: {
        type: Boolean,
        default: false,
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
    longestStreak: {
        type: Number,
        default: 0,
    },
    profilePicture: {
        type: String, // Storing as Base64 for now
        default: '',
    },
    preferences: {
        theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
        notifications: {
            email: { type: Boolean, default: true },
            push: { type: Boolean, default: true },
            weeklyReport: { type: Boolean, default: true },
        },
        privacy: {
            profileVisibility: { type: String, enum: ['public', 'private', 'friends'], default: 'public' },
            showStreak: { type: Boolean, default: true },
            allowInvites: { type: Boolean, default: true },
        }
    }
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
