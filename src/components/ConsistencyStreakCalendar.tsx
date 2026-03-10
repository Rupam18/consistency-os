"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip } from "react-tooltip";
import { cn } from "@/lib/utils";

interface HeatmapData {
    date: string;
    count: number;
}

interface DayData {
    date: Date;
    dateStr: string;
    count: number;
}

export function ConsistencyStreakCalendar() {
    const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHeatmapData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const res = await fetch('/api/habits/heatmap', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data: HeatmapData[] = await res.json();
                    setHeatmapData(data);
                }
            } catch (error) {
                console.error("Failed to fetch heatmap data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHeatmapData();
    }, []);

    // Generate grid data for the last 60 days grouped by week
    const { weeks, monthLabels } = useMemo(() => {
        const days: DayData[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Start from 59 days ago to include today for a total of 60 days
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 59);

        for (let i = 0; i < 60; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];

            const dataEntry = heatmapData.find(d => d.date === dateStr);
            days.push({
                date,
                dateStr,
                count: dataEntry ? dataEntry.count : 0,
            });
        }

        const weeksList: (DayData | null)[][] = [];
        let currentWeek: (DayData | null)[] = [];
        const months: { label: string; weekIndex: number }[] = [];
        let lastMonth = -1;

        days.forEach((day, index) => {
            // If it's the first day of the entire period and not a Sunday, pad the beginning
            if (index === 0 && day.date.getDay() !== 0) {
                const paddingCount = day.date.getDay(); // 0 for Sunday, 1 for Monday, etc.
                for (let i = 0; i < paddingCount; i++) {
                    currentWeek.push(null);
                }
            }

            currentWeek.push(day);

            // Group by week (Sunday to Saturday)
            if (day.date.getDay() === 6 || index === days.length - 1) {
                // Track month labels at the start of a week
                // Find the first actual day in the currentWeek to determine its month
                const weekFirstDay = currentWeek.find(d => d !== null)?.date;
                if (weekFirstDay && weekFirstDay.getMonth() !== lastMonth) {
                    lastMonth = weekFirstDay.getMonth();
                    months.push({
                        label: weekFirstDay.toLocaleString('default', { month: 'short' }),
                        weekIndex: weeksList.length
                    });
                }

                weeksList.push(currentWeek);
                currentWeek = [];
            }
        });

        return { weeks: weeksList, monthLabels: months };
    }, [heatmapData]);

    const getLevelClass = (count: number) => {
        if (count === 0) return "bg-zinc-800 dark:bg-zinc-800/50";
        if (count === 1) return "bg-violet-700 shadow-[0_0_10px_rgba(109,40,217,0.3)]";
        if (count === 2) return "bg-violet-600 shadow-[0_0_12px_rgba(124,58,237,0.4)]";
        return "bg-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.5)]";
    };

    const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-2xl relative overflow-hidden w-full">
            {/* Background Accent */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-600/10 blur-[80px] rounded-full pointer-events-none" />

            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-white tracking-tight">Consistency Streak</h3>
                        <p className="text-xs text-zinc-500">Your activity over the last 60 days</p>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                        <span>Less</span>
                        <div className="flex gap-1">
                            <div className="w-2.5 h-2.5 rounded-sm bg-zinc-800" />
                            <div className="w-2.5 h-2.5 rounded-sm bg-violet-700" />
                            <div className="w-2.5 h-2.5 rounded-sm bg-violet-500" />
                        </div>
                        <span>More</span>
                    </div>
                </div>

                <div className="relative mt-2 overflow-x-auto pb-2 scrollbar-hide">
                    <div className="min-w-fit">
                        {/* Month Labels */}
                        <div className="flex ml-8 mb-2 h-4 relative">
                            {monthLabels.map((m, i) => (
                                <span
                                    key={i}
                                    className="text-[10px] text-zinc-500 absolute font-medium whitespace-nowrap"
                                    style={{ left: `${m.weekIndex * 20}px` }}
                                >
                                    {m.label}
                                </span>
                            ))}
                        </div>

                        <div className="flex gap-1">
                            {/* Weekday Labels */}
                            <div className="flex flex-col gap-1 justify-between py-0.5 pr-2">
                                {weekdayLabels.map((day, i) => (
                                    <span key={i} className={cn(
                                        "text-[9px] font-bold uppercase tracking-tighter w-6 text-right transition-opacity",
                                        [1, 3, 5].includes(i) ? "opacity-40 text-zinc-400" : "opacity-0"
                                    )}>
                                        {day}
                                    </span>
                                ))}
                            </div>

                            {/* Grid - Columns of Weeks */}
                            <div className="flex gap-1">
                                {loading ? (
                                    Array.from({ length: 9 }).map((_, i) => ( // Approx 9 weeks for 60 days
                                        <div key={i} className="flex flex-col gap-1">
                                            {Array.from({ length: 7 }).map((_, j) => (
                                                <div key={j} className="w-4 h-4 bg-zinc-800/50 rounded-md animate-pulse" />
                                            ))}
                                        </div>
                                    ))
                                ) : (
                                    weeks.map((week, wIndex) => (
                                        <div key={wIndex} className="flex flex-col gap-1">
                                            {week.map((day, dIndex) => (
                                                day ? (
                                                    <motion.div
                                                        key={day.dateStr}
                                                        initial={{ opacity: 0, scale: 0.6 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{
                                                            duration: 0.3,
                                                            delay: (wIndex * 7 + dIndex) * 0.01,
                                                            ease: "easeOut"
                                                        }}
                                                        whileHover={{ scale: 1.25, zIndex: 10 }}
                                                        className={cn(
                                                            "w-4 h-4 rounded-md cursor-pointer transition-all duration-300",
                                                            getLevelClass(day.count)
                                                        )}
                                                        data-tooltip-id="calendar-tooltip"
                                                        data-tooltip-content={`${day.date.toLocaleDateString('default', { month: 'long', day: 'numeric' })} • ${day.count} ${day.count === 1 ? 'habit' : 'habits'} completed`}
                                                    />
                                                ) : (
                                                    <div key={`padding-${wIndex}-${dIndex}`} className="w-4 h-4" />
                                                )
                                            ))}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Tooltip
                id="calendar-tooltip"
                className="z-50 !bg-zinc-950 !text-white !border !border-zinc-800 !rounded-lg !px-3 !py-1.5 !text-xs !shadow-2xl"
                noArrow={false}
            />
        </div>
    );
}
