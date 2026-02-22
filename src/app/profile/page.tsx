'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trophy, Star, Zap, Flame, Award, Medal, Shield } from 'lucide-react';

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    router.push('/login');
                    return;
                }

                const res = await fetch('/api/user/profile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                } else if (res.status === 401) {
                    router.push('/login');
                }
            } catch (error) {
                console.error("Failed to load profile", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [router]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center dark:bg-zinc-950 dark:text-white">Loading...</div>;
    }

    if (!user) {
        return <div className="min-h-screen flex items-center justify-center dark:bg-zinc-950 dark:text-white">Profile not found.</div>;
    }

    // Calculate XP Progress
    const xpNeededForCurrentLevel = Math.pow(user.level - 1, 2) * 100;
    const xpNeededForNextLevel = Math.pow(user.level, 2) * 100;
    const xpProgress = user.xp - xpNeededForCurrentLevel;
    const xpRequired = xpNeededForNextLevel - xpNeededForCurrentLevel;
    const progressPercent = Math.min(100, Math.max(0, (xpProgress / xpRequired) * 100));

    const badgesLib: Record<string, any> = {
        '7 Day Streak': { icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        '30 Day Streak': { icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
        '100 Day Streak': { icon: Star, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        '500 XP': { icon: Award, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        '1000 XP': { icon: Trophy, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 dark:text-gray-100 p-6 md:p-12">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row items-center gap-6 bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm"
                >
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-4xl font-bold text-white shadow-lg shadow-purple-500/30">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-3xl font-bold">{user.name}</h1>
                        <p className="text-zinc-500 dark:text-zinc-400">{user.email}</p>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4">
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium text-sm">
                                <Medal className="w-4 h-4" /> Level {user.level}
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 font-medium text-sm">
                                <Flame className="w-4 h-4" /> {user.currentStreak} Day Streak
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Level & XP Progress Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm"
                >
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Zap className="w-5 h-5 text-yellow-500" /> XP Progress
                            </h2>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                                {user.xp} Total XP Earned
                            </p>
                        </div>
                        <div className="text-right">
                            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{Math.floor(xpProgress)}</span>
                            <span className="text-sm text-zinc-500 dark:text-zinc-400"> / {xpRequired} XP to Level {user.level + 1}</span>
                        </div>
                    </div>

                    <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden relative">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                        />
                    </div>
                </motion.div>

                {/* Badges System Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm"
                >
                    <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                        <Trophy className="w-5 h-5 text-indigo-500" /> Badges & Achievements
                    </h2>

                    {user.badges.length === 0 ? (
                        <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                            <Shield className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
                            <p className="text-zinc-500 dark:text-zinc-400">No badges earned yet. Complete challenges to start collecting!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {user.badges.map((badgeName: string, idx: number) => {
                                const b = badgesLib[badgeName] || { icon: Shield, color: 'text-zinc-500', bg: 'bg-zinc-500/10' };
                                const Icon = b.icon;
                                return (
                                    <motion.div
                                        key={idx}
                                        whileHover={{ y: -5, scale: 1.02 }}
                                        className={`flex flex-col items-center justify-center p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:border-indigo-500/30 transition-colors ${b.bg}`}
                                    >
                                        <Icon className={`w-10 h-10 mb-3 ${b.color}`} />
                                        <span className="font-semibold text-sm text-center dark:text-zinc-200">{badgeName}</span>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
