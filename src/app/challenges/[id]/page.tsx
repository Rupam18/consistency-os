'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface LeaderboardEntry {
    userId: string;
    name: string;
    email: string;
    completedToday: boolean;
    totalCompletions: number;
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
    const params = useParams(); // Use useParams hook
    const id = params?.id as string;
    const [data, setData] = useState<ChallengeDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [marking, setMarking] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (id) {
            fetchChallengeDetails();
        }
    }, [id]);

    const fetchChallengeDetails = async () => {
        try {
            const res = await fetch(`/api/challenges/${id}`);
            if (res.ok) {
                const jsonData = await res.json();
                setData(jsonData);
            } else {
                // Handle error (e.g., challenge not found)
                console.error('Failed to fetch challenge details');
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
                    // Add Authorization header if needed by your API middleware
                    // 'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ challengeId: id }),
            });

            if (res.ok) {
                const data = await res.json();
                alert('Marked as done for today!');
                fetchChallengeDetails(); // Refresh leaderboard
                if (data.gamification && (data.gamification.leveledUp || data.gamification.newBadges?.length > 0)) {
                    window.dispatchEvent(new CustomEvent('gamification-event', { detail: data.gamification }));
                }
            } else {
                const errData = await res.json();
                alert(errData.message || 'Failed to mark as done');
            }
        } catch (error) {
            console.error('Error marking done', error);
            alert('An error occurred');
        } finally {
            setMarking(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading challenge details...</div>;
    }

    if (!data) {
        return <div className="p-8 text-center text-red-500">Challenge not found.</div>;
    }

    const { challenge, participantsCount, leaderboard } = data;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <button onClick={() => router.back()} className="text-indigo-600 hover:underline mb-4">&larr; Back to Challenges</button>

                <div className="bg-white p-8 rounded-lg shadow-md mb-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold text-gray-900">{challenge.title}</h1>
                                <span className={`px-2 py-1 text-xs font-bold rounded-full ${challenge.type === 'private' ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'}`}>
                                    {challenge.type === 'private' ? '🔒 Private' : '🌍 Public'}
                                </span>
                            </div>
                            <p className="text-gray-600 mb-4">{challenge.description}</p>

                            {challenge.type === 'private' && challenge.inviteCode && (
                                <div className="mb-4 bg-yellow-50 p-3 rounded-md border border-yellow-200 inline-block">
                                    <p className="text-sm text-yellow-800 font-medium mb-1">Invite Code</p>
                                    <div className="flex items-center gap-2">
                                        <code className="text-lg font-mono font-bold text-yellow-900">{challenge.inviteCode}</code>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(challenge.inviteCode || '');
                                                alert('Code copied!');
                                            }}
                                            className="text-xs bg-white border border-yellow-300 px-2 py-1 rounded hover:bg-yellow-100 text-yellow-800"
                                        >
                                            Copy
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="text-sm text-gray-500 space-y-1">
                                <p>Created by: <span className="font-medium">{challenge.createdBy?.name || 'Unknown'}</span></p>
                                <p>Participants: {participantsCount}</p>
                                <p>Start: {new Date(challenge.startDate).toLocaleDateString()} &mdash; End: {new Date(challenge.endDate).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleMarkDone}
                            disabled={marking}
                            className={`px-6 py-3 rounded-md font-bold text-white shadow-sm transition ${marking ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                        >
                            {marking ? 'Marking...' : 'Mark Done Today'}
                        </button>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Leaderboard</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="pb-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">Rank</th>
                                    <th className="pb-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="pb-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">Status Today</th>
                                    <th className="pb-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Completions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {leaderboard.map((entry, index) => (
                                    <tr key={entry.userId} className="hover:bg-gray-50 transition">
                                        <td className="py-4 text-gray-900 font-medium">#{index + 1}</td>
                                        <td className="py-4 text-gray-900">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                                                    {entry.name?.charAt(0) || 'U'}
                                                </div>
                                                {entry.name || 'Anonymous'}
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            {entry.completedToday ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Completed
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    Missed
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 text-gray-900 font-medium text-center pr-12">{entry.totalCompletions}</td>
                                    </tr>
                                ))}
                                {leaderboard.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="py-6 text-center text-gray-500">No participants yet. Be the first to join!</td>
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
