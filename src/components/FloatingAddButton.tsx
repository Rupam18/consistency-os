'use client';

import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface FloatingAddButtonProps {
    onClick: () => void;
}

export default function FloatingAddButton({ onClick }: FloatingAddButtonProps) {
    return (
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            onClick={onClick}
            className="fixed bottom-8 right-8 w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-300 z-40 md:hidden"
        // Primarily for mobile, but requested as 'Floating Add Button'. 
        // On desktop we typically use the inline form, but this adds a nice touch.
        >
            <Plus className="w-8 h-8" />
        </motion.button>
    );
}
