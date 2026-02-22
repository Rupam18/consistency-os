'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Flame, Crown, Medal } from 'lucide-react';

export default function LeaderboardPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await fetch('/api/leaderboard');
                if (res.ok) {
                    const data = await res.json();
                    setUsers(data);
                }
            } catch (error) {
                console.error("Failed to fetch leaderboard", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center dark:bg-zinc-950 dark:text-white">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 dark:text-gray-100 p-6 md:p-12 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-16 h-16 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/30"
                    >
                        <Trophy className="w-8 h-8 text-white" />
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400"
                    >
                        Global Leaderboard
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-zinc-500 dark:text-zinc-400 mt-2"
                    >
                        Top 100 most consistent users. Rise to the top!
                    </motion.p>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                    <th className="px-6 py-4 font-semibold">Rank</th>
                                    <th className="px-6 py-4 font-semibold">User</th>
                                    <th className="px-6 py-4 font-semibold">Level</th>
                                    <th className="px-6 py-4 font-semibold text-right">XP</th>
                                    <th className="px-6 py-4 font-semibold text-right">Streak</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                                {users.map((user, index) => {
                                    const isTop3 = index < 3;
                                    return (
                                        <motion.tr
                                            key={user._id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm
                                                    ${index === 0 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400' :
                                                        index === 1 ? 'bg-zinc-200 text-zinc-700 dark:bg-zinc-500/20 dark:text-zinc-300' :
                                                            index === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400' :
                                                                'text-zinc-500 dark:text-zinc-400'}`}
                                                >
                                                    {index === 0 ? <Crown className="w-4 h-4" /> : index + 1}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-md ${isTop3 ? 'bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-purple-500/30' : 'bg-zinc-300 dark:bg-zinc-700'}`}>
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <span className="font-bold block text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{user.name}</span>
                                                        {user.badges.length > 0 && <span className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5"><Medal className="w-3 h-3" /> {user.badges.length} Badges</span>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                                                    <Star className="w-3.5 h-3.5" /> Lvl {user.level}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono font-bold text-zinc-700 dark:text-zinc-300">
                                                {user.xp.toLocaleString()} XP
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5 font-bold text-orange-600 dark:text-orange-400">
                                                    {user.currentStreak} <Flame className="w-4 h-4 fill-orange-500/50" />
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">No users found on the leaderboard.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
