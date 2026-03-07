'use client';

import { PlusCircle, Target } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
    onAddHabit: () => void; // Focus input or open modal
}

export default function EmptyState({ onAddHabit }: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-zinc-50/50 dark:bg-zinc-900/50"
        >
            <div className="w-16 h-16 bg-white dark:bg-zinc-800 rounded-2xl flex items-center justify-center shadow-sm mb-5 border border-zinc-100 dark:border-zinc-700">
                <Target className="w-8 h-8 text-violet-500 dark:text-violet-400" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2 tracking-tight">No habits tracked yet</h3>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mb-8 leading-relaxed">
                Consistency is key. Start small by adding your first daily habit and build your streak.
            </p>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onAddHabit} // In this simple version, maybe focus the input
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-semibold rounded-xl shadow-sm text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 focus:ring-offset-zinc-900 transition-colors"
            >
                <PlusCircle className="w-5 h-5 mr-2" />
                Add Your First Habit
            </motion.button>
        </motion.div>
    );
}
