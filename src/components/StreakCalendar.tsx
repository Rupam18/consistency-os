"use client";

import React, { useEffect, useState } from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import { Tooltip } from "react-tooltip";
import { motion } from "framer-motion";
import "react-calendar-heatmap/dist/styles.css";

interface HeatmapData {
    date: string;
    count: number;
}

export function StreakCalendar() {
    const today = new Date();
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(today.getDate() - 60);

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

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex w-full flex-col gap-1 rounded-xl border border-white/10 bg-neutral-900/50 py-2 px-4 shadow-md backdrop-blur-sm"
        >
            <div className="flex flex-col space-y-1">
                <h3 className="text-lg font-semibold leading-none tracking-tight text-white">
                    Consistency Streak
                </h3>
                <p className="text-xs text-neutral-400">
                    Your progress over the last 60 days
                </p>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                className="w-full overflow-x-auto"
            >
                {loading ? (
                    <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-600"></div>
                    </div>
                ) : (
                    <div className="min-w-[500px]">
                        <CalendarHeatmap
                            startDate={sixtyDaysAgo}
                            endDate={today}
                            values={heatmapData}
                            gutterSize={2}
                            classForValue={(value: { date?: string; count?: number } | undefined) => {
                                if (!value || !value.count || value.count === 0) {
                                    return "color-empty";
                                }
                                if (value.count === 1) {
                                    return "color-scale-1";
                                }
                                if (value.count === 2) {
                                    return "color-scale-2";
                                }
                                return "color-scale-3";
                            }}
                            tooltipDataAttrs={((value: { date?: string; count?: number } | undefined) => {
                                if (!value || !value.date) {
                                    return { 'data-tooltip-id': 'streak-tooltip', 'data-tooltip-content': 'No habits completed' } as any;
                                }
                                return {
                                    "data-tooltip-id": "streak-tooltip",
                                    "data-tooltip-content": `${value.date}: ${value.count || 0} habits`,
                                } as any;
                            }) as any}
                            showWeekdayLabels={true}
                        />
                    </div>
                )}
            </motion.div>
            <Tooltip
                id="streak-tooltip"
                className="z-50 !bg-neutral-800 !text-white !border !border-white/10 !rounded-md !px-3 !py-1.5 !shadow-xl"
            />
        </motion.div>
    );
}
