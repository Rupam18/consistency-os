'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchChallenges();
    }, []);

    const fetchChallenges = async () => {
        try {
            const res = await fetch('/api/challenges');
            if (res.ok) {
                const data = await res.json();
                setChallenges(data);
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
            // We need to send the token in headers if our API expects it.
            // Assuming the API uses cookies or we need to implement token sending.
            // For now, let's assume the auth middleware checks cookies or headers.
            // However, the previous code used localStorage 'token'. 
            // We might need to adjust fetch to include Authorization header.

            const res = await fetch('/api/challenges/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Assuming Bearer token
                },
                body: JSON.stringify({ challengeId }),
            });

            if (res.ok) {
                alert('Joined challenge successfully!');
                router.push(`/challenges/${challengeId}`);
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to join challenge');
            }
        } catch (error) {
            console.error('Error joining challenge', error);
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading challenges...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Consistency Challenges</h1>
                    {/* Create Challenge Button - for now just a placeholder or functional if we add the page */}
                    <button
                        onClick={() => alert("Create Challenge feature coming soon!")}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
                    >
                        Create Challenge
                    </button>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8 max-w-md mx-auto text-center">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Have an invite code?</h2>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Enter 6-digit code"
                            className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                            id="inviteCodeInput"
                        />
                        <button
                            onClick={async () => {
                                const input = document.getElementById('inviteCodeInput') as HTMLInputElement;
                                const code = input.value.trim().toUpperCase();
                                if (!code) return alert('Please enter a code');

                                const token = localStorage.getItem('token');
                                if (!token) return router.push('/login');

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
                                        alert('Joined private challenge successfully!');
                                        router.push(`/challenges/${data.challengeId}`); // API returns participant, which contains challengeId
                                    } else {
                                        const data = await res.json();
                                        alert(data.message || 'Failed to join');
                                    }
                                } catch (e) {
                                    console.error(e);
                                    alert('Error joining challenge');
                                }
                            }}
                            className="bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition"
                        >
                            Join
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {challenges.map((challenge) => (
                        <div key={challenge._id} className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition relative">
                            <span className={`absolute top-4 right-4 px-2 py-1 text-xs font-bold rounded-full ${challenge.type === 'private' ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'}`}>
                                {challenge.type === 'private' ? '🔒 Private' : '🌍 Public'}
                            </span>
                            <h2 className="text-xl font-semibold text-indigo-600 mb-2 pr-12">{challenge.title}</h2>
                            <p className="text-gray-600 mb-4 h-12 overflow-hidden text-ellipsis">{challenge.description}</p>
                            <div className="text-sm text-gray-500 mb-4 space-y-1">
                                <p>Start: {new Date(challenge.startDate).toLocaleDateString()}</p>
                                <p>End: {new Date(challenge.endDate).toLocaleDateString()}</p>
                                <p className="font-medium text-gray-700">👥 {challenge.participantsCount || 0} Participants</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleJoin(challenge._id)}
                                    className="flex-1 bg-indigo-100 text-indigo-700 py-2 rounded-md font-medium hover:bg-indigo-200 transition"
                                >
                                    Join
                                </button>
                                <Link href={`/challenges/${challenge._id}`} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-md font-medium hover:bg-gray-50 transition text-center">
                                    View
                                </Link>
                            </div>
                        </div>
                    ))}

                    {challenges.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            No active challenges found. Check back later!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
