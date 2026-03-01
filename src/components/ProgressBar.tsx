'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
    value: number; // 0 to 100
    className?: string;
    label?: string;
}

export default function ProgressBar({ value, className, label }: ProgressBarProps) {
    return (
        <div className={cn("w-full", className)}>
            {label && (
                <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{label}</span>
                    <span className="text-sm font-bold text-zinc-900 dark:text-white">{Math.round(value)}%</span>
                </div>
            )}
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-3 overflow-hidden shadow-inner">
                <motion.div
                    className="bg-violet-600 h-3 rounded-full shadow-sm shadow-violet-500/20"
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                />
            </div>
        </div>
    );
}
