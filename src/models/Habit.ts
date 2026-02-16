
import mongoose, { Schema, Document } from 'mongoose';

export interface IHabit extends Document {
  title: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const HabitSchema: Schema = new Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title for this habit.'],
    maxlength: [100, 'Title cannot be more than 100 characters'],
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Habit || mongoose.model<IHabit>('Habit', HabitSchema);
