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
            className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50"
        >
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                <Target className="w-8 h-8 text-indigo-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No habits tracked yet</h3>
            <p className="text-gray-500 max-w-sm mb-8">
                Consistency is key. Start small by adding your first daily habit and build your streak.
            </p>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onAddHabit} // In this simple version, maybe focus the input
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
                <PlusCircle className="w-5 h-5 mr-2" />
                Add Your First Habit
            </motion.button>
        </motion.div>
    );
}
