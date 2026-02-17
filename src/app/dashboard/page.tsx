'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);
    const [habits, setHabits] = useState<any[]>([]);
    const [newHabitTitle, setNewHabitTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [toastMessage, setToastMessage] = useState('');

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 3000);
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
        } else {
            setAuthorized(true);
            fetchHabits(token);
        }
    }, [router]);

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

    const handleAddHabit = async (e: React.FormEvent) => {
        e.preventDefault();
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
            }
        } catch (error) {
            console.error('Failed to add habit', error);
        }
    };

    const handleDeleteHabit = async (id: string) => {
        console.log('Attempting to delete habit:', id);
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found');
            return;
        }

        if (!confirm('Are you sure you want to delete this habit?')) return;

        try {
            console.log('Sending DELETE request...');
            const res = await fetch(`/api/habits/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('Delete response status:', res.status);

            if (res.ok) {
                setHabits(habits.filter(h => h._id !== id));
            } else {
                console.error('Failed to delete:', await res.text());
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
                setHabits(habits.map(h => {
                    if (h._id === id) {
                        return { ...h, completedToday: true, streak: (h.streak || 0) + 1 };
                    }
                    return h;
                }));
                showToast('Streak increased! 🔥');
            }
        } catch (error) {
            console.error('Failed to mark done', error);
        }
    };

    if (!authorized) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-indigo-600">ConsistencyOS</h1>
                        </div>
                        <div className="flex items-center">
                            <span className="mr-4 text-gray-500 text-sm">Welcome</span>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-600 rounded hover:bg-red-50 focus:outline-none transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="py-10">
                <header>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h1 className="text-3xl font-bold leading-tight text-gray-900">
                            Your Habits
                        </h1>
                    </div>
                </header>
                <main>
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 mt-8">
                        {/* Add Habit Form */}
                        <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6 mb-8">
                            <form onSubmit={handleAddHabit} className="flex gap-4">
                                <input
                                    type="text"
                                    value={newHabitTitle}
                                    onChange={(e) => setNewHabitTitle(e.target.value)}
                                    placeholder="Enter a new habit..."
                                    className="flex-grow shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                />
                                <button
                                    type="submit"
                                    disabled={!newHabitTitle.trim()}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Add Habit
                                </button>
                            </form>
                        </div>

                        {/* Habits List */}
                        {loading ? (
                            <div className="text-center py-10">Loading habits...</div>
                        ) : habits.length === 0 ? (
                            <div className="text-center py-10 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                                No habits found. Start by adding one!
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {habits.map((habit) => (
                                    <div key={habit._id} className="bg-white overflow-hidden shadow rounded-lg flex flex-col justify-between">
                                        <div className="px-4 py-5 sm:p-6">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900 truncate">
                                                {habit.title}
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                Created: {new Date(habit.createdAt).toLocaleDateString()}
                                            </p>
                                            <div className="mt-4 flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-500">
                                                    🔥 Streak: {habit.streak || 0} days
                                                </span>
                                                <button
                                                    onClick={() => handleMarkDone(habit._id)}
                                                    disabled={habit.completedToday}
                                                    className={`px-3 py-1 rounded-md text-sm font-medium text-white transition-colors ${habit.completedToday
                                                            ? 'bg-green-500 cursor-default'
                                                            : 'bg-indigo-600 hover:bg-indigo-700'
                                                        }`}
                                                >
                                                    {habit.completedToday ? 'Completed ✓' : 'Mark Done'}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 px-4 py-4 sm:px-6 flex justify-end">
                                            <button
                                                onClick={() => handleDeleteHabit(habit._id)}
                                                className="text-sm font-medium text-red-600 hover:text-red-900 hover:underline"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Toast Notification */}
            {toastMessage && (
                <div className="fixed bottom-5 right-5 bg-green-500 text-white px-4 py-2 rounded shadow-lg animate-bounce">
                    {toastMessage}
                </div>
            )}
        </div>
    );
}
