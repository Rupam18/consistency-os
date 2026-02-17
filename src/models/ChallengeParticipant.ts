import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IChallengeParticipant extends Document {
    userId: mongoose.Types.ObjectId;
    challengeId: mongoose.Types.ObjectId;
    joinedAt: Date;
}

const ChallengeParticipantSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    challengeId: { type: Schema.Types.ObjectId, ref: 'Challenge', required: true },
    joinedAt: { type: Date, default: Date.now },
});

// Compound index to ensure a user can only join a challenge once
ChallengeParticipantSchema.index({ userId: 1, challengeId: 1 }, { unique: true });

const ChallengeParticipant: Model<IChallengeParticipant> = mongoose.models.ChallengeParticipant || mongoose.model<IChallengeParticipant>('ChallengeParticipant', ChallengeParticipantSchema);

export default ChallengeParticipant;
