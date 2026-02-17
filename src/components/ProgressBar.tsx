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
                <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                    <span className="text-sm font-medium text-gray-700">{Math.round(value)}%</span>
                </div>
            )}
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <motion.div
                    className="bg-indigo-600 h-2.5 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                />
            </div>
        </div>
    );
}
