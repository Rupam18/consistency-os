'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Users, Calendar, Plus, Lock, Globe, ArrowRight, Loader2, KeyRound } from 'lucide-react';

interface Challenge {
    _id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    type: 'public' | 'private';
    participantsCount: number;
}

export default function ChallengesPage() {
    const [myChallenges, setMyChallenges] = useState<Challenge[]>([]);
    const [discoverChallenges, setDiscoverChallenges] = useState<Challenge[]>([]);
    const [activeTab, setActiveTab] = useState<'my' | 'discover'>('my');
    const [loading, setLoading] = useState(true);
    const [joinCode, setJoinCode] = useState('');
    const [joiningCode, setJoiningCode] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchChallenges();
    }, []);

    const fetchChallenges = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers: any = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch('/api/challenges', { headers });
            if (res.ok) {
                const data = await res.json();
                setMyChallenges(data.myChallenges || []);
                setDiscoverChallenges(data.discoverChallenges || []);
                // If user has no challenges, default to discover tab
                if ((data.myChallenges || []).length === 0) {
                    setActiveTab('discover');
                }
            }
        } catch (error) {
            console.error('Failed to fetch challenges', error);
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async (challengeId: string) => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        try {
            const res = await fetch('/api/challenges/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ challengeId }),
            });

            if (res.ok) {
                router.push(`/challenges/${challengeId}`);
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to join challenge');
            }
        } catch (error) {
            console.error('Error joining challenge', error);
        }
    };

    const handleJoinByCode = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = joinCode.trim().toUpperCase();
        if (!code) return;

        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        setJoiningCode(true);
        try {
            const res = await fetch('/api/challenges/join-by-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ inviteCode: code }),
            });

            if (res.ok) {
                const data = await res.json();
                setJoinCode('');
                router.push(`/challenges/${data.challengeId}`);
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to join');
            }
        } catch (e) {
            console.error(e);
            alert('Error joining challenge');
        } finally {
            setJoiningCode(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                <p className="text-zinc-500 dark:text-zinc-400 font-medium">Loading challenges...</p>
            </div>
        );
    }

    const displayedChallenges = activeTab === 'my' ? myChallenges : discoverChallenges;

    return (
        <div className="relative overflow-hidden w-full px-4 sm:px-6 lg:px-8 py-10">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header Area */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white mb-3">Challenges</h1>
                        <p className="text-lg text-zinc-500 dark:text-zinc-400">Join a community, build consistency, and level up together.</p>
                    </div>
                    <div className="flex gap-4">
                        <Link
                            href="/challenges/create"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all hover:scale-105"
                        >
                            <Plus className="w-5 h-5" /> Create
                        </Link>
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left/Top Content: Tabs and Challenge List */}
                    <div className="flex-1">
                        {/* Custom Tabs */}
                        <div className="flex bg-zinc-200/50 dark:bg-zinc-900/50 p-1.5 rounded-2xl mb-8 w-full max-w-sm">
                            <button
                                onClick={() => setActiveTab('my')}
                                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${activeTab === 'my'
                                    ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                    : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                                    }`}
                            >
                                My Challenges
                                {myChallenges.length > 0 && (
                                    <span className="ml-2 bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 px-2 py-0.5 rounded-full text-xs">
                                        {myChallenges.length}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('discover')}
                                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${activeTab === 'discover'
                                    ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                    : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                                    }`}
                            >
                                Discover
                            </button>
                        </div>

                        {/* Challenges List */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                            >
                                {displayedChallenges.map((challenge) => (
                                    <ChallengeCard
                                        key={challenge._id}
                                        challenge={challenge}
                                        isJoined={activeTab === 'my'}
                                        onJoin={() => handleJoin(challenge._id)}
                                    />
                                ))}

                                {displayedChallenges.length === 0 && (
                                    <div className="col-span-1 md:col-span-2 py-16 text-center bg-white/50 dark:bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
                                        <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Target className="w-8 h-8 text-zinc-400" />
                                        </div>
                                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">No Challenges Found</h3>
                                        <p className="text-zinc-500">
                                            {activeTab === 'my'
                                                ? "You haven't joined any challenges yet. Check the discover tab!"
                                                : "There are no public challenges available to join right now."}
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Right/Bottom Content: Join by Code Widget */}
                    <div className="w-full lg:w-80 shrink-0">
                        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-6 rounded-[2rem] border border-zinc-200/50 dark:border-zinc-800/50 shadow-md sticky top-6">
                            <div className="w-12 h-12 bg-orange-50 dark:bg-orange-500/10 text-orange-500 rounded-2xl flex items-center justify-center mb-4">
                                <KeyRound className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Have an invite?</h2>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Enter a 6-digit code to join a private challenge.</p>

                            <form onSubmit={handleJoinByCode} className="flex gap-2">
                                <input
                                    type="text"
                                    maxLength={6}
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                    placeholder="e.g. A1B2C3"
                                    className="flex-1 w-full uppercase tracking-widest text-center border-2 border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-2 py-3 focus:border-indigo-500 focus:ring-0 outline-none font-mono font-bold text-zinc-900 dark:text-white transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={joiningCode || joinCode.length < 6}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                                >
                                    {joiningCode ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ChallengeCard({ challenge, isJoined, onJoin }: { challenge: Challenge, isJoined: boolean, onJoin: () => void }) {
    const isPublic = challenge.type === 'public';

    return (
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-6 rounded-[2rem] border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm hover:shadow-md hover:border-indigo-500/30 transition-all group flex flex-col justify-between h-full">
            <div>
                <div className="flex justify-between items-start mb-4">
                    <div className={`px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1.5 ${isPublic ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'}`}>
                        {isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        {isPublic ? 'Public' : 'Private'}
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-500 bg-zinc-50 dark:bg-zinc-800/50 px-2 py-1 rounded-lg text-xs font-medium">
                        <Users className="w-3.5 h-3.5" /> {challenge.participantsCount || 0}
                    </div>
                </div>

                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {challenge.title}
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6 line-clamp-2">
                    {challenge.description}
                </p>

                <div className="flex flex-col gap-2 mb-6">
                    <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                        <Calendar className="w-4 h-4 text-indigo-500" />
                        {new Date(challenge.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(challenge.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                {isJoined ? (
                    <Link
                        href={`/challenges/${challenge._id}`}
                        className="w-full py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center"
                    >
                        View Dashboard
                    </Link>
                ) : (
                    <button
                        onClick={onJoin}
                        className="w-full py-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                    >
                        Join Challenge <ArrowRight className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
}
