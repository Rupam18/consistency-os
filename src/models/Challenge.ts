import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IChallenge extends Document {
    title: string;
    description: string;
    createdBy: mongoose.Types.ObjectId;
    startDate: Date;
    endDate: Date;
    createdAt: Date;
    type: 'public' | 'private';
    inviteCode?: string;
    participantsCount: number;
}

const ChallengeSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
    type: { type: String, enum: ['public', 'private'], default: 'public' },
    inviteCode: { type: String, unique: true, sparse: true },
    participantsCount: { type: Number, default: 0 },
});

const Challenge: Model<IChallenge> = mongoose.models.Challenge || mongoose.model<IChallenge>('Challenge', ChallengeSchema);

export default Challenge;
