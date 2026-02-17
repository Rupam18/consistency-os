'use client';

import { Check, Flame, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface HabitCardProps {
    habit: {
        _id: string;
        title: string;
        streak: number;
        completedToday: boolean;
        createdAt: string;
    };
    onComplete: (id: string) => void;
    onDelete: (id: string) => void;
    index: number;
}

export default function HabitCard({ habit, onComplete, onDelete, index }: HabitCardProps) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={cn(
                "group relative bg-white rounded-xl border p-5 shadow-sm transition-all duration-200",
                habit.completedToday
                    ? "border-green-100 bg-green-50/30"
                    : "border-gray-100 hover:border-indigo-100 hover:shadow-md"
            )}
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className={cn(
                        "text-lg font-semibold tracking-tight transition-colors",
                        habit.completedToday ? "text-gray-800" : "text-gray-900"
                    )}>
                        {habit.title}
                    </h3>
                    <div className="flex items-center mt-1 space-x-2">
                        <div className={cn(
                            "flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
                            habit.streak > 0
                                ? "bg-orange-50 text-orange-600 border-orange-100"
                                : "bg-gray-50 text-gray-500 border-gray-100"
                        )}>
                            <Flame className={cn("w-3 h-3 mr-1", habit.streak > 0 && "fill-orange-500 text-orange-500")} />
                            {habit.streak} Day Streak
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => onDelete(habit._id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50 opacity-0 group-hover:opacity-100"
                    title="Delete Habit"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-gray-400 font-medium">
                    Since {new Date(habit.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onComplete(habit._id)}
                    disabled={habit.completedToday}
                    className={cn(
                        "flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm",
                        habit.completedToday
                            ? "bg-green-500 text-white cursor-default shadow-green-200"
                            : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200 hover:shadow-indigo-300"
                    )}
                >
                    {habit.completedToday ? (
                        <>
                            <Check className="w-4 h-4 mr-1.5" strokeWidth={3} />
                            Completed
                        </>
                    ) : (
                        "Mark Done"
                    )}
                </motion.button>
            </div>

            {/* Progress bar visual for streak/engagement - optional polish */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-50 rounded-b-xl overflow-hidden">
                <motion.div
                    className={cn("h-full", habit.completedToday ? "bg-green-500" : "bg-indigo-500")}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(habit.streak * 5 + 5, 100)}%` }} // Arbitrary visual progress based on streak
                    transition={{ duration: 1 }}
                />
            </div>
        </motion.div>
    );
}
