'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Target, Calendar, Lock, Globe, ArrowLeft, Loader2 } from 'lucide-react';

export default function CreateChallengePage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [type, setType] = useState<'public' | 'private'>('public');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        try {
            const res = await fetch('/api/challenges/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title, description, startDate, endDate, type })
            });

            if (res.ok) {
                const data = await res.json();

                // Automatically join the challenge if you created it
                await fetch('/api/challenges/join', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ challengeId: data._id })
                });

                router.push(`/challenges/${data._id}`);
            } else {
                const data = await res.json();
                setError(data.message || 'Failed to create challenge');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 md:p-12">
            <div className="max-w-2xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-8 font-medium"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Challenges
                </button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm"
                >
                    <div className="mb-8 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-4">
                            <Target className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Create Challenge</h1>
                        <p className="text-zinc-500 mt-2">Set up a new consistency challenge for yourself or the world.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-500/20 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Challenge Title</label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                placeholder="e.g., 30 Days of LeetCode"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Description</label>
                            <textarea
                                required
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                                placeholder="What is the goal of this challenge?"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-zinc-400" /> Start Date
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-zinc-400" /> End Date
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">Visibility</label>
                            <div className="grid grid-cols-2 gap-4">
                                <div
                                    onClick={() => setType('public')}
                                    className={`cursor-pointer border py-4 px-4 rounded-xl flex items-center gap-3 transition-all ${type === 'public'
                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 ring-2 ring-indigo-500/20'
                                            : 'border-zinc-200 dark:border-zinc-700 hover:border-indigo-300'
                                        }`}
                                >
                                    <div className={`p-2 rounded-full ${type === 'public' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800'}`}>
                                        <Globe className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className={`font-semibold ${type === 'public' ? 'text-indigo-900 dark:text-indigo-300' : 'text-zinc-700 dark:text-zinc-300'}`}>Public</div>
                                        <div className="text-xs text-zinc-500">Anyone can join</div>
                                    </div>
                                </div>
                                <div
                                    onClick={() => setType('private')}
                                    className={`cursor-pointer border py-4 px-4 rounded-xl flex items-center gap-3 transition-all ${type === 'private'
                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 ring-2 ring-indigo-500/20'
                                            : 'border-zinc-200 dark:border-zinc-700 hover:border-indigo-300'
                                        }`}
                                >
                                    <div className={`p-2 rounded-full ${type === 'private' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800'}`}>
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className={`font-semibold ${type === 'private' ? 'text-indigo-900 dark:text-indigo-300' : 'text-zinc-700 dark:text-zinc-300'}`}>Private</div>
                                        <div className="text-xs text-zinc-500">Invite code only</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                                        Creating Challenge...
                                    </>
                                ) : (
                                    'Create & Join Challenge'
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
