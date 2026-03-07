'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
    LayoutDashboard,
    Zap,
    CheckCircle2,
    Plus
} from 'lucide-react';

import StatsCard from '@/components/StatsCard';
import HabitCard from '@/components/HabitCard';
import EmptyState from '@/components/EmptyState';
import ProgressBar from '@/components/ProgressBar';
import QuoteCard from '@/components/QuoteCard';
import Heatmap from '@/components/Heatmap';
import FloatingAddButton from '@/components/FloatingAddButton';
import { triggerConfetti } from '@/lib/confetti';

export default function DashboardPage() {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);
    interface Habit {
        _id: string;
        title: string;
        streak: number;
        completedToday: boolean;
        createdAt: string;
    }
    const [habits, setHabits] = useState<Habit[]>([]);
    const [newHabitTitle, setNewHabitTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [toastMessage, setToastMessage] = useState('');
    const [user, setUser] = useState<{ name?: string } | null>(null);

    // Stats
    const totalHabits = habits.length;
    const completedTodayCount = habits.filter(h => h.completedToday).length;
    const completionRate = totalHabits > 0 ? (completedTodayCount / totalHabits) * 100 : 0;
    const maxStreak = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 3000);
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        // Decode token to get user name if possible, or fetch profile
        // For now, minimal check
        if (!token) {
            router.push('/login');
        } else {
            setAuthorized(true);
            fetchHabits(token);
            fetchProfile(token);
        }
    }, [router]);

    const fetchProfile = async (token: string) => {
        try {
            const res = await fetch('/api/user/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
            }
        } catch (error) {
            console.error('Failed to fetch profile', error);
        }
    };

    const fetchHabits = async (token: string) => {
        try {
            const res = await fetch('/api/habits', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setHabits(data);
            }
        } catch (error) {
            console.error('Failed to fetch habits', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/login');
    };

    const handleAddHabit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!newHabitTitle.trim()) return;

        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await fetch('/api/habits/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title: newHabitTitle }),
            });

            if (res.ok) {
                setNewHabitTitle('');
                fetchHabits(token);
                showToast("Habit added successfully! 🚀");
            }
        } catch (error) {
            console.error('Failed to add habit', error);
        }
    };

    const handleDeleteHabit = async (id: string) => {
        if (!confirm('Are you sure you want to delete this habit?')) return;

        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await fetch(`/api/habits/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                setHabits(habits.filter(h => h._id !== id));
                showToast("Habit deleted.");
            }
        } catch (error) {
            console.error('Failed to delete habit', error);
        }
    };

    const handleMarkDone = async (id: string) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await fetch('/api/habits/complete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ habitId: id }),
            });

            if (res.ok) {
                const data = await res.json();
                setHabits(habits.map(h => {
                    if (h._id === id) {
                        return { ...h, completedToday: true, streak: (h.streak || 0) + 1 };
                    }
                    return h;
                }));
                showToast('Streak increased! 🔥');
                if (data.gamification && (data.gamification.leveledUp || data.gamification.newBadges?.length > 0)) {
                    window.dispatchEvent(new CustomEvent('gamification-event', { detail: data.gamification }));
                }
            }
        } catch (error) {
            console.error('Failed to mark done', error);
        }
    };

    if (!authorized) return null;

    const hour = new Date().getHours();
    let greeting = 'Good evening';
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 18) greeting = 'Good afternoon';

    const firstName = user?.name ? user.name.split(' ')[0] : 'User';

    return (
        <>
            <main className="flex-1 w-full">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">

                    {/* Header Section */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
                            {greeting}, {firstName} 👋
                        </h1>
                        <div className="flex items-center mt-2 text-zinc-500 dark:text-zinc-400">
                            <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                            <span className="mx-2">•</span>
                            <span className="text-violet-500 dark:text-violet-400 font-semibold flex items-center">
                                <Zap className="w-4 h-4 mr-1.5 fill-violet-500 dark:fill-violet-400" />
                                Keep your streak alive!
                            </span>
                        </div>
                    </motion.div>

                    {/* Stats Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatsCard
                            title="Total Habits"
                            value={totalHabits}
                            icon={LayoutDashboard}
                            delay={0.1}
                        />
                        <StatsCard
                            title="Active Streak"
                            value={`${maxStreak} Days`}
                            icon={Zap}
                            trend="Best Streak"
                            delay={0.2}
                        />
                        <StatsCard
                            title="Completed Today"
                            value={completedTodayCount}
                            icon={CheckCircle2}
                            description="Keep going!"
                            delay={0.3}
                        />
                    </div>

                    {/* Progress Section */}
                    {totalHabits > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm"
                        >
                            <div className="flex justify-between items-end mb-5">
                                <div>
                                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Today's Progress</h3>
                                    <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">You&apos;ve completed {completedTodayCount} out of {totalHabits} habits.</p>
                                </div>
                                <div className="text-3xl font-bold text-violet-600 dark:text-violet-400">{Math.round(completionRate)}%</div>
                            </div>
                            <ProgressBar value={completionRate} />
                        </motion.div>
                    )}

                    {/* Input Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <form onSubmit={handleAddHabit} className="relative group">
                            <input
                                type="text"
                                value={newHabitTitle}
                                onChange={(e) => setNewHabitTitle(e.target.value)}
                                placeholder="Add a new habit..."
                                className="w-full px-6 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none transition-all pr-32 text-lg"
                            />
                            <button
                                type="submit"
                                disabled={!newHabitTitle.trim()}
                                className="absolute right-2 top-2 bottom-2 bg-violet-600 text-white px-6 rounded-xl font-semibold hover:bg-violet-700 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                <Plus className="w-5 h-5 mr-1.5" />
                                Add
                            </button>
                        </form>
                    </motion.div>

                    {/* Habits List */}
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600"></div>
                        </div>
                    ) : habits.length === 0 ? (
                        <EmptyState onAddHabit={() => {
                            const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                            if (input) input.focus();
                        }} />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <AnimatePresence>
                                {habits.map((habit, index) => (
                                    <HabitCard
                                        key={habit._id}
                                        habit={habit}
                                        onComplete={handleMarkDone}
                                        onDelete={handleDeleteHabit}
                                        index={index}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </main>

            {/* Toast Notification */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 20, x: '-50%' }}
                        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 z-50"
                    >
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        <span className="font-medium">{toastMessage}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
