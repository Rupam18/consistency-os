"use client";

import React, { useEffect, useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";

interface HeatmapData {
    date: string;
    count: number;
}

export function WeeklyProgressChart() {
    const [weeklyData, setWeeklyData] = useState<{ day: string; completed: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
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

                    // Generate last 7 days data
                    const last7Days = [];
                    const today = new Date();
                    for (let i = 6; i >= 0; i--) {
                        const d = new Date();
                        d.setDate(today.getDate() - i);
                        const dateStr = d.toISOString().split('T')[0];
                        const dayName = d.toLocaleDateString("en-US", { weekday: "short" });

                        const match = data.find(item => item.date === dateStr);
                        last7Days.push({
                            day: dayName,
                            completed: match ? match.count : 0
                        });
                    }
                    setWeeklyData(last7Days);
                }
            } catch (error) {
                console.error('Failed to fetch weekly stats', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="flex w-full flex-col gap-4 rounded-xl border border-white/10 bg-neutral-900/50 p-6 shadow-sm backdrop-blur-sm">
            <div className="flex flex-col space-y-1.5">
                <h3 className="text-xl font-semibold leading-none tracking-tight text-white">
                    Weekly Progress
                </h3>
                <p className="text-sm text-neutral-400">
                    Your habit consistency this week
                </p>
            </div>

            <div className="h-[300px] w-full mt-4">
                {loading ? (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={weeklyData}
                            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                stroke="rgba(255,255,255,0.1)"
                            />
                            <XAxis
                                dataKey="day"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#9ca3af", fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#9ca3af", fontSize: 12 }}
                                allowDecimals={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "rgba(23, 23, 23, 0.9)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    borderRadius: "8px",
                                    color: "#fff",
                                }}
                                itemStyle={{ color: "#8B5CF6" }}
                                cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="completed"
                                stroke="#8B5CF6"
                                strokeWidth={3}
                                dot={{ r: 4, fill: "#8B5CF6", strokeWidth: 0 }}
                                activeDot={{ r: 6, fill: "#8B5CF6", stroke: "#A78BFA", strokeWidth: 2 }}
                                animationDuration={1500}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
