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
                "bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow",
                className
            )}
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1 tracking-tight">{value}</h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-indigo-600" />
                </div>
            </div>
            {(trend || description) && (
                <div className="mt-4 flex items-center text-sm">
                    {trend && (
                        <span className="text-green-600 font-medium mr-2">
                            {trend}
                        </span>
                    )}
                    {description && (
                        <span className="text-gray-500">{description}</span>
                    )}
                </div>
            )}
        </motion.div>
    );
}
