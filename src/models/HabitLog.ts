import mongoose, { Schema, Document } from 'mongoose';

export interface IHabitLog extends Document {
  habitId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD
  completed: boolean;
  createdAt: Date;
}

const HabitLogSchema: Schema = new Schema({
  habitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: String, // Storing as string YYYY-MM-DD for easier querying
    required: true,
  },
  completed: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to ensure one log per habit per day
HabitLogSchema.index({ habitId: 1, date: 1 }, { unique: true });

export default mongoose.models.HabitLog || mongoose.model<IHabitLog>('HabitLog', HabitLogSchema);
