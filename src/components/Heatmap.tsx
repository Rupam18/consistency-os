'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Tooltip } from 'react-tooltip';
import clsx from 'clsx'; // Assuming clsx is installed, or use template literals

interface HeatmapData {
    date: string;
    count: number;
}

export default function Heatmap() {
    const [data, setData] = useState<HeatmapData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const res = await fetch('/api/habits/heatmap', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const result = await res.json();
                    setData(result);
                }
            } catch (error) {
                console.error('Failed to fetch heatmap data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Generate last 90 days grid
    const days = [];
    const today = new Date();
    // Align to weeks (start on Sunday or Monday) - for simplicity 90 days flat list mapped to weeks?
    // GitHub does columns = weeks.
    // Let's generate a list of dates.
    for (let i = 89; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];

        // Find matching data
        const match = data.find(item => item.date === dateStr);
        days.push({
            date: d,
            dateStr: dateStr,
            count: match ? match.count : 0
        });
    }

    const getColor = (count: number) => {
        if (count === 0) return 'bg-gray-100 dark:bg-gray-800';
        if (count === 1) return 'bg-green-200';
        if (count === 2) return 'bg-green-300';
        if (count === 3) return 'bg-green-400';
        return 'bg-green-500';
    };

    if (loading) return (
        <div className="h-32 flex items-center justify-center bg-white rounded-xl border border-gray-100 animate-pulse">
            <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm relative"
        >
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-gray-700">Consistency Journey</h3>
                <span className="text-xs text-gray-400">Last 90 Days</span>
            </div>

            {/* Grid Container */}
            {/* 7 rows (days of week) is standard but complex to map for simple list. 
                Simple grid: just flex-wrap squares. */}
            <div className="flex flex-wrap gap-1 content-start">
                {days.map((day) => (
                    <div
                        key={day.dateStr}
                        data-tooltip-id="heatmap-tooltip"
                        data-tooltip-content={`${day.date.toDateString()}: ${day.count} habits`}
                        className={clsx(
                            "w-3 h-3 rounded-sm cursor-pointer transition-all hover:scale-125 hover:border hover:border-black/10",
                            getColor(day.count)
                        )}
                    />
                ))}
            </div>

            <Tooltip id="heatmap-tooltip" className="z-50 text-xs" />

            {/* Empty State / Legend */}
            {/* If total count is 0, show encouragement */}
            {data.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px] rounded-xl">
                    <p className="text-xs text-gray-500 font-medium bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
                        No activity yet. Start your streak! 🔥
                    </p>
                </div>
            )}

            <div className="mt-4 flex items-center gap-2 text-xs text-gray-400 justify-end">
                <span>Less</span>
                <div className="w-3 h-3 rounded-sm bg-gray-100" />
                <div className="w-3 h-3 rounded-sm bg-green-200" />
                <div className="w-3 h-3 rounded-sm bg-green-400" />
                <div className="w-3 h-3 rounded-sm bg-green-500" />
                <span>More</span>
            </div>
        </motion.div>
    );
}
