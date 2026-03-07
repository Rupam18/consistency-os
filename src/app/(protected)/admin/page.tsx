'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Users, Activity, Loader2, ArrowLeft, BarChart } from 'lucide-react';

interface AdminStats {
    metrics: {
        totalUsers: number;
        totalHabitsGlobal: number;
        totalCompletionsGlobal: number;
    };
    users: {
        _id: string;
        name: string;
        email: string;
        createdAt: string;
        level: number;
        currentStreak: number;
        longestStreak: number;
        totalHabitsCreated: number;
        totalHabitsCompleted: number;
    }[];
}

export default function AdminDashboardPage() {
    const router = useRouter();
    const [data, setData] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAdminData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            try {
                const res = await fetch('/api/admin/users', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                } else if (res.status === 403) {
                    setError('Access Denied. You are not an administrator.');
                } else {
                    setError('Failed to fetch admin data.');
                }
            } catch (err) {
                setError('An unexpected error occurred.');
            } finally {
                setLoading(false);
            }
        };

        fetchAdminData();
    }, [router]);

    if (loading) {
        return (
            <div className="flex-1 w-full min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                <p className="text-zinc-500 font-medium">Verifying admin credentials...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 w-full min-h-screen flex flex-col items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-950">
                <div className="bg-red-50 dark:bg-red-500/10 p-8 rounded-[2rem] border border-red-200 dark:border-red-500/20 max-w-md text-center">
                    <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-2">Unauthorized</h2>
                    <p className="text-zinc-600 dark:text-zinc-400 mb-6">{error}</p>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => router.push('/admin/login')}
                            className="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-semibold hover:opacity-90 transition-opacity"
                        >
                            Sign in as Administrator
                        </button>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="px-6 py-3 bg-transparent text-zinc-600 dark:text-zinc-400 font-medium hover:text-zinc-900 dark:hover:text-white transition-opacity"
                        >
                            Return to Standard Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <main className="flex-1 w-full min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                    <div>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-4 font-medium"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back to App
                        </button>
                        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
                            <Shield className="w-8 h-8 text-indigo-500" /> System Admin
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-1">Platform overview and user management.</p>
                    </div>
                </motion.div>

                {/* Top Metrics Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
                        <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center shrink-0">
                            <Users className="w-7 h-7" />
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-zinc-500 uppercase tracking-widest">Total Users</div>
                            <div className="text-3xl font-black text-zinc-900 dark:text-white mt-1">{data.metrics.totalUsers.toLocaleString()}</div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
                        <div className="w-14 h-14 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center shrink-0">
                            <BarChart className="w-7 h-7" />
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-zinc-500 uppercase tracking-widest">Active Habits</div>
                            <div className="text-3xl font-black text-zinc-900 dark:text-white mt-1">{data.metrics.totalHabitsGlobal.toLocaleString()}</div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
                        <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center shrink-0">
                            <Activity className="w-7 h-7" />
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-zinc-500 uppercase tracking-widest">Global Completions</div>
                            <div className="text-3xl font-black text-zinc-900 dark:text-white mt-1">{data.metrics.totalCompletionsGlobal.toLocaleString()}</div>
                        </div>
                    </div>
                </motion.div>

                {/* Users Data Table */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden"
                >
                    <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Registered Users</h2>
                        <span className="text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-3 py-1.5 rounded-full uppercase tracking-widest">Database</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                                    <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">User</th>
                                    <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Joined</th>
                                    <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-center">Level</th>
                                    <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-center">Streaks & Logs</th>
                                    <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Habits</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {data.users.map((user) => (
                                    <tr key={user._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors">
                                        <td className="p-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-zinc-900 dark:text-white">{user.name}</div>
                                                    <div className="text-xs text-zinc-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                                            {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </td>
                                        <td className="p-4 whitespace-nowrap text-center">
                                            <span className="inline-flex items-center justify-center px-2.5 py-1 text-xs font-bold rounded-full bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-400">
                                                Lvl {user.level}
                                            </span>
                                        </td>
                                        <td className="p-4 whitespace-nowrap">
                                            <div className="flex flex-col gap-1 items-center">
                                                <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-700 px-3 py-1 rounded-lg">
                                                    🔥 {user.currentStreak}
                                                    <span className="text-zinc-300 dark:text-zinc-600 mx-1">|</span>
                                                    🏆 {user.longestStreak}
                                                </div>
                                                <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
                                                    {user.totalHabitsCompleted} Total Logs
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 whitespace-nowrap text-right font-medium text-zinc-900 dark:text-zinc-300">
                                            {user.totalHabitsCreated} Tracking
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {data.users.length === 0 && (
                            <div className="p-10 text-center text-zinc-500">
                                No users found in the database.
                            </div>
                        )}
                    </div>
                </motion.div>

            </div>
        </main>
    );
}
