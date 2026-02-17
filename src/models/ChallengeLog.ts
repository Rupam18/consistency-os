import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IChallengeLog extends Document {
    userId: mongoose.Types.ObjectId;
    challengeId: mongoose.Types.ObjectId;
    date: string; // YYYY-MM-DD
    completed: boolean;
    createdAt: Date;
}

const ChallengeLogSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    challengeId: { type: Schema.Types.ObjectId, ref: 'Challenge', required: true },
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    completed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

// Compound index to ensure unique log per user per challenge per day
ChallengeLogSchema.index({ userId: 1, challengeId: 1, date: 1 }, { unique: true });

const ChallengeLog: Model<IChallengeLog> = mongoose.models.ChallengeLog || mongoose.model<IChallengeLog>('ChallengeLog', ChallengeLogSchema);

export default ChallengeLog;
