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
                "group relative bg-white dark:bg-zinc-900 rounded-2xl border p-4 shadow-sm transition-all duration-200",
                habit.completedToday
                    ? "border-emerald-100 dark:border-emerald-500/20 bg-emerald-50/30 dark:bg-zinc-900"
                    : "border-zinc-200 dark:border-zinc-800 hover:border-violet-200 dark:hover:border-violet-500/30 hover:shadow-md"
            )}
        >
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className={cn(
                        "text-lg font-semibold tracking-tight transition-colors",
                        habit.completedToday ? "text-zinc-700 dark:text-zinc-300" : "text-zinc-900 dark:text-white"
                    )}>
                        {habit.title}
                    </h3>
                    <div className="flex items-center mt-1 space-x-2">
                        <div className={cn(
                            "flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors",
                            habit.streak > 0
                                ? "bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-100 dark:border-violet-500/20"
                                : "bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700"
                        )}>
                            <Flame className={cn("w-3.5 h-3.5 mr-1.5", habit.streak > 0 && "fill-violet-500 text-violet-500 dark:fill-violet-400 dark:text-violet-400")} />
                            {habit.streak} Day Streak
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => onDelete(habit._id)}
                    className="text-zinc-400 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 opacity-0 group-hover:opacity-100"
                    title="Delete Habit"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                    Since {new Date(habit.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onComplete(habit._id)}
                    disabled={habit.completedToday}
                    className={cn(
                        "flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200",
                        habit.completedToday
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 cursor-default"
                            : "bg-violet-600 text-white hover:bg-violet-700 shadow-sm"
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
            <div className="absolute bottom-0 left-0 w-full h-1 bg-zinc-100 dark:bg-zinc-800 rounded-b-2xl overflow-hidden">
                <motion.div
                    className={cn("h-full", habit.completedToday ? "bg-emerald-500" : "bg-violet-500")}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(habit.streak * 5 + 5, 100)}%` }} // Arbitrary visual progress based on streak
                    transition={{ duration: 1 }}
                />
            </div>
        </motion.div>
    );
}
