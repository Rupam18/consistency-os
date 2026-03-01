'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    description?: string;
    className?: string;
    delay?: number;
}

export default function StatsCard({
    title,
    value,
    icon: Icon,
    trend,
    description,
    className,
    delay = 0
}: StatsCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className={cn(
                "bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 hover:shadow-md transition-shadow",
                className
            )}
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</p>
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mt-1 tracking-tight">{value}</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                </div>
            </div>
            {(trend || description) && (
                <div className="mt-4 flex items-center text-sm">
                    {trend && (
                        <span className="text-emerald-500 dark:text-emerald-400 font-medium mr-2">
                            {trend}
                        </span>
                    )}
                    {description && (
                        <span className="text-zinc-500 dark:text-zinc-400">{description}</span>
                    )}
                </div>
            )}
        </motion.div>
    );
}
