'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trophy, CheckCircle, Flame, Calendar, Share2, Target, ArrowLeft, Loader2, Clock, Users, Shield, Copy, Globe } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LeaderboardEntry {
    userId: string;
    name: string;
    email: string;
    completedToday: boolean;
    totalCompletions: number;
    currentStreak: number;
    longestStreak: number;
}

interface ChallengeDetails {
    challenge: {
        _id: string;
        title: string;
        description: string;
        startDate: string;
        endDate: string;
        type: 'public' | 'private';
        inviteCode?: string;
        createdBy: {
            name: string;
        };
    };
    participantsCount: number;
    leaderboard: LeaderboardEntry[];
}

export default function ChallengeDetailsPage() {
    const params = useParams();
    const id = params?.id as string;
    const [data, setData] = useState<ChallengeDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [marking, setMarking] = useState(false);
    const [currentUserInfo, setCurrentUserInfo] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        if (id) {
            fetchChallengeDetails();
            fetchCurrentUser();
        }
    }, [id]);

    const fetchCurrentUser = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const res = await fetch('/api/user/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const { user } = await res.json();
                setCurrentUserInfo(user);
            }
        } catch (e) { console.error(e); }
    };

    const fetchChallengeDetails = async () => {
        try {
            const res = await fetch(`/api/challenges/${id}`);
            if (res.ok) {
                const jsonData = await res.json();
                setData(jsonData);
            }
        } catch (error) {
            console.error('Error fetching details', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkDone = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        setMarking(true);
        try {
            const res = await fetch('/api/challenges/complete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ challengeId: id }),
            });

            if (res.ok) {
                const resData = await res.json();
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#4f46e5', '#a855f7', '#10b981']
                });
                fetchChallengeDetails(); // Refresh
                if (resData.gamification && (resData.gamification.leveledUp || resData.gamification.newBadges?.length > 0)) {
                    window.dispatchEvent(new CustomEvent('gamification-event', { detail: resData.gamification }));
                }
            } else {
                const errData = await res.json();
                alert(errData.message || 'Failed to mark as done');
            }
        } catch (error) {
            console.error('Error marking done', error);
        } finally {
            setMarking(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                <p className="text-zinc-500 font-medium">Loading challenge dashboard...</p>
            </div>
        );
    }

    if (!data) {
        return <div className="min-h-screen bg-zinc-50 p-8 text-center flex items-center justify-center text-red-500 text-xl font-medium">Challenge not found.</div>;
    }

    const { challenge, participantsCount, leaderboard } = data;
    const isPublic = challenge.type === 'public';

    // Find current user's entry in leaderboard
    const myEntry = currentUserInfo ? leaderboard.find(l => l.email === currentUserInfo.email) : null;
    const isParticipant = !!myEntry;

    // Calculate Days Left
    const endDate = new Date(challenge.endDate);
    const today = new Date();
    const isEnded = today > endDate;
    const daysLeft = isEnded ? 0 : Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 md:p-12 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-5xl mx-auto relative z-10">
                <button
                    onClick={() => router.push('/challenges')}
                    className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-6 font-medium"
                >
                    <ArrowLeft className="w-4 h-4" /> All Challenges
                </button>

                {/* Hero Dashboard */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-8 rounded-[2rem] border border-zinc-200/50 dark:border-zinc-800/50 shadow-xl shadow-zinc-200/50 dark:shadow-none mb-8"
                >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1.5 ${isPublic ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'}`}>
                                    {isPublic ? <Globe className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                                    {isPublic ? 'Public' : 'Private'}
                                </div>
                                <span className="bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1.5">
                                    <Users className="w-3 h-3" /> {participantsCount} Players
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-zinc-900 dark:text-white mb-2">{challenge.title}</h1>
                            <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl">{challenge.description}</p>

                            {!isPublic && challenge.inviteCode && isParticipant && (
                                <div className="mt-4 flex items-center gap-3">
                                    <span className="text-sm text-zinc-500 font-medium">Invite Code:</span>
                                    <code className="bg-orange-50 dark:bg-orange-500/10 text-orange-600 font-mono font-bold px-3 py-1.5 rounded-lg text-sm border border-orange-200/50 dark:border-orange-500/20">
                                        {challenge.inviteCode}
                                    </code>
                                    <button
                                        onClick={() => { navigator.clipboard.writeText(challenge.inviteCode!); alert('Copied!'); }}
                                        className="text-zinc-400 hover:text-indigo-500 transition-colors"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Action Area */}
                        <div className="w-full md:w-auto flex flex-col items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 shrink-0 min-w-[200px]">
                            {isParticipant ? (
                                myEntry?.completedToday ? (
                                    <div className="text-center w-full">
                                        <div className="w-16 h-16 bg-green-100 dark:bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <CheckCircle className="w-8 h-8" />
                                        </div>
                                        <p className="font-bold text-green-600 dark:text-green-400">Done for today!</p>
                                        <p className="text-xs text-zinc-500 mt-1">Come back tomorrow.</p>
                                    </div>
                                ) : (
                                    <div className="text-center w-full">
                                        <div className="text-sm font-bold text-zinc-500 uppercase tracking-wide mb-3 flex items-center justify-center gap-1.5">
                                            <Target className="w-4 h-4" /> Today's Goal
                                        </div>
                                        <button
                                            onClick={handleMarkDone}
                                            disabled={marking || isEnded}
                                            className="w-full py-4 px-6 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center"
                                        >
                                            {marking ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Mark Completed'}
                                        </button>
                                    </div>
                                )
                            ) : (
                                <div className="text-center font-medium text-zinc-500">
                                    Join the challenge to participate!
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column (Leaderboard) */}
                    <div className="lg:col-span-2 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-[2rem] border border-zinc-200/50 dark:border-zinc-800/50 shadow-md overflow-hidden"
                        >
                            <div className="p-6 md:p-8 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
                                    <Trophy className="w-6 h-6 text-yellow-500" /> Leaderboard
                                </h2>
                                <span className="text-sm font-medium text-zinc-500 px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full">
                                    Ranked by Streak
                                </span>
                            </div>

                            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {leaderboard.map((entry, index) => (
                                    <motion.div
                                        key={entry.userId}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 + (index * 0.05) }}
                                        className={`flex items-center p-4 md:p-6 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors ${entry.userId === myEntry?.userId ? 'bg-indigo-50/50 dark:bg-indigo-500/5' : ''}`}
                                    >
                                        <div className="w-12 text-center flex-shrink-0">
                                            {index === 0 ? <span className="text-3xl">🥇</span> :
                                                index === 1 ? <span className="text-3xl">🥈</span> :
                                                    index === 2 ? <span className="text-3xl">🥉</span> :
                                                        <span className="text-lg font-bold text-zinc-400">#{index + 1}</span>}
                                        </div>

                                        <div className="flex-1 ml-4 flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${entry.userId === myEntry?.userId ? 'bg-indigo-600 text-white shadow-md' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'}`}>
                                                {entry.name?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                            <div>
                                                <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                                    {entry.name || 'Anonymous'}
                                                    {entry.userId === myEntry?.userId && <span className="text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">You</span>}
                                                </div>
                                                <div className="text-xs text-zinc-500 flex items-center gap-2 mt-0.5">
                                                    {entry.completedToday ? (
                                                        <span className="text-green-500 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Done Today</span>
                                                    ) : (
                                                        <span className="text-zinc-400">Not yet done</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right flex flex-col items-end gap-1">
                                            <div className="flex items-center gap-1.5 text-orange-500 font-bold text-xl drop-shadow-sm">
                                                <Flame className="w-5 h-5 fill-current" /> {entry.currentStreak}
                                            </div>
                                            <div className="text-[10px] text-zinc-400 uppercase font-semibold tracking-wider">
                                                Record: {entry.longestStreak}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}

                                {leaderboard.length === 0 && (
                                    <div className="p-12 text-center text-zinc-500 font-medium font-medium">
                                        No players on the board yet.<br /><span className="text-sm mt-1 block font-normal">Be the first to secure the #1 spot!</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column (Info Widget) */}
                    <div className="lg:col-span-1 border-l-0 lg:border-l border-zinc-200 dark:border-zinc-800 lg:pl-8 space-y-8">
                        {myEntry && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-[2rem] text-white shadow-xl shadow-indigo-500/20"
                            >
                                <h3 className="font-semibold text-indigo-100 flex items-center gap-2 mb-4 text-sm uppercase tracking-wider">
                                    <Target className="w-4 h-4" /> Personal Progress
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-4xl font-extrabold mb-1">{myEntry.currentStreak}</div>
                                        <div className="text-xs font-medium text-indigo-200 uppercase tracking-wide">Current Streak</div>
                                    </div>
                                    <div>
                                        <div className="text-4xl font-extrabold mb-1 opacity-80">{myEntry.totalCompletions}</div>
                                        <div className="text-xs font-medium text-indigo-200 uppercase tracking-wide">Total Days</div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-3xl border border-zinc-200/50 dark:border-zinc-800"
                        >
                            <h3 className="font-bold text-zinc-900 dark:text-white mb-4">Timeline</h3>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-500">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Starts</div>
                                        <div className="text-xs text-zinc-500">{new Date(challenge.startDate).toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' })}</div>
                                    </div>
                                </div>
                                <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 ml-5"></div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-500">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Ends</div>
                                        <div className="text-xs text-zinc-500">{new Date(challenge.endDate).toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' })}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                                <div className="text-center">
                                    {isEnded ? (
                                        <div className="inline-flex items-center gap-1.5 bg-red-100 text-red-600 dark:bg-red-500/20 px-3 py-1 rounded-full text-xs font-bold">
                                            Challenge Ended
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="text-3xl font-black text-zinc-900 dark:text-white mb-1">{daysLeft}</div>
                                            <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">Days Left</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
