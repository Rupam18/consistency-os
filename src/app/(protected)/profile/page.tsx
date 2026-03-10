'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Zap, Flame, Award, Medal, Shield, Edit2, Camera, X, CheckCircle, Activity, Target } from 'lucide-react';

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Edit Modal State
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editProfilePic, setEditProfilePic] = useState('');
    const [saveLoading, setSaveLoading] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchProfile();
    }, [router]);

    const fetchProfile = async () => {
        setError(null);
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
                setEditName(data.user.name);
                setEditProfilePic(data.user.profilePicture || '');
            } else if (res.status === 401) {
                router.push('/login');
            } else {
                const data = await res.json();
                setError(data.message || `Error ${res.status}: Failed to load profile`);
            }
        } catch (error: any) {
            console.error("Failed to load profile", error);
            setError("Connection error. Please check your internet or database status.");
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        setUploadingAvatar(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("/api/settings/upload-avatar", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                setEditProfilePic(data.profilePicture);
            } else {
                console.error("Upload failed");
            }
        } catch (error) {
            console.error("Upload error:", error);
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleSaveProfile = async () => {
        setSaveLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/user/profile/update', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: editName, profilePicture: editProfilePic })
            });

            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
                setIsEditing(false);
            } else {
                console.error("Failed to update profile");
            }
        } catch (error) {
            console.error("Error saving profile:", error);
        } finally {
            setSaveLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center dark:bg-zinc-950 dark:text-white gap-4">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-zinc-500 animate-pulse font-medium">Loading your profile...</p>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center dark:bg-zinc-950 dark:text-white gap-6 px-4 text-center">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
                    <X className="w-10 h-10" />
                </div>
                <div className="max-w-md mx-auto">
                    <h2 className="text-2xl font-bold mb-2 text-white">{error || "Profile not found"}</h2>
                    <p className="text-zinc-400">
                        We couldn't retrieve your profile. This is usually due to a database connection issue or an expired session.
                    </p>
                    {error && (
                        <div className="mt-4 p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-500 font-mono break-all">
                            DEBUG: {error}
                        </div>
                    )}
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={() => fetchProfile()}
                        className="px-8 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all font-bold shadow-lg shadow-indigo-500/20 active:scale-95"
                    >
                        Try Again
                    </button>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="px-8 py-3 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-2xl hover:bg-zinc-800 transition-all font-bold active:scale-95"
                    >
                        Dashboard
                    </button>
                </div>
            </div>
        );
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

    // All available badges for the locked/unlocked grid
    const allBadgeKeys = Object.keys(badgesLib);

    return (
        <div className="relative overflow-hidden w-full px-4 sm:px-6 lg:px-8 py-10">
            {/* Background Decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 dark:bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 dark:bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-5xl mx-auto space-y-8 relative z-10">
                {/* Header / Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row items-center gap-8 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-8 rounded-[2rem] border border-zinc-200/50 dark:border-zinc-800/50 shadow-xl shadow-zinc-200/50 dark:shadow-none"
                >
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-5xl font-bold text-white shadow-2xl shadow-indigo-500/30 ring-4 ring-white dark:ring-zinc-900 border-4 border-indigo-100 dark:border-zinc-800">
                            {user.profilePicture ? (
                                <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                user.name.charAt(0).toUpperCase()
                            )}
                        </div>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="absolute bottom-2 right-2 p-2 bg-indigo-600 text-white rounded-full shadow-lg hover:scale-110 transition-transform hover:bg-indigo-700"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2 justify-center md:justify-start">
                            <h1 className="text-4xl font-bold text-zinc-900 dark:text-white tracking-tight">{user.name}</h1>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium text-sm shadow-md mx-auto md:mx-0">
                                <Medal className="w-4 h-4" /> Lvl {user.level} Player
                            </div>
                        </div>
                        <p className="text-zinc-500 dark:text-zinc-400 font-medium">{user.email}</p>
                        <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>

                    {/* Quick Stats on Hero */}
                    <div className="flex gap-4 md:border-l border-zinc-200 dark:border-zinc-800 md:pl-8 py-2">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1.5 text-orange-500 mb-1">
                                <Flame className="w-5 h-5 fill-current" />
                            </div>
                            <div className="text-2xl font-bold text-zinc-900 dark:text-white">{user.currentStreak}</div>
                            <div className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">Day Streak</div>
                        </div>
                        <div className="w-px bg-zinc-200 dark:bg-zinc-800" />
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1.5 text-indigo-500 mb-1">
                                <Zap className="w-5 h-5 fill-current" />
                            </div>
                            <div className="text-2xl font-bold text-zinc-900 dark:text-white">{user.xp}</div>
                            <div className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">Total XP</div>
                        </div>
                    </div>
                </motion.div>

                {/* Level & XP Progress Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-8 rounded-[2rem] border border-zinc-200/50 dark:border-zinc-800/50 shadow-md"
                >
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500/20" /> Next Level Progress
                            </h2>
                        </div>
                        <div className="text-right flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{Math.floor(xpProgress)}</span>
                            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">/ {xpRequired} XP</span>
                        </div>
                    </div>

                    <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden relative shadow-inner">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 1.5, ease: 'easeOut' }}
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-full"
                        />
                        {/* Glow effect */}
                        <div className="absolute top-0 left-0 h-full w-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)] animate-[shimmer_2s_infinite]" />
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column (Stats & Activity) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Stats Grid */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="grid grid-cols-2 sm:grid-cols-4 gap-4"
                        >
                            <StatCard icon={<Trophy className="w-6 h-6 text-yellow-500" />} label="Longest Streak" value={`${user.longestStreak || 0}d`} />
                            <StatCard icon={<CheckCircle className="w-6 h-6 text-green-500" />} label="Habits Done" value={user.totalHabitsCompleted || 0} />
                            <StatCard icon={<Target className="w-6 h-6 text-blue-500" />} label="Challenges" value={user.challengesJoined || 0} />
                            <StatCard icon={<Shield className="w-6 h-6 text-purple-500" />} label="Badges Earned" value={user.badges?.length || 0} />
                        </motion.div>

                        {/* Activity Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-8 rounded-[2rem] border border-zinc-200/50 dark:border-zinc-800/50 shadow-md"
                        >
                            <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-zinc-900 dark:text-white">
                                <Activity className="w-5 h-5 text-indigo-500" /> Recent Activity
                            </h2>

                            {user.recentActivity && user.recentActivity.length > 0 ? (
                                <div className="space-y-4">
                                    {user.recentActivity.map((log: any, idx: number) => (
                                        <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
                                                    <CheckCircle className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-zinc-900 dark:text-white">{log.habitId?.title || 'Unknown Habit'}</p>
                                                    <p className="text-xs text-zinc-500">{new Date(log.createdAt).toLocaleDateString()} at {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>
                                            </div>
                                            <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                                                +10 XP
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-zinc-500">
                                    No recent activity found. Start completing habits!
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Right Column (Badges) */}
                    <div className="lg:col-span-1 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-8 rounded-[2rem] border border-zinc-200/50 dark:border-zinc-800/50 shadow-md h-full"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-white">
                                    <Shield className="w-5 h-5 text-indigo-500" /> Badges
                                </h2>
                                <span className="text-sm font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full">
                                    {user.badges?.length || 0} / {allBadgeKeys.length}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {allBadgeKeys.map((badgeName: string, idx: number) => {
                                    const b = badgesLib[badgeName];
                                    const Icon = b.icon;
                                    const isEarned = user.badges?.includes(badgeName);

                                    return (
                                        <motion.div
                                            key={idx}
                                            whileHover={isEarned ? { y: -5, scale: 1.05 } : {}}
                                            className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${isEarned
                                                ? `border-zinc-200 dark:border-zinc-700 ${b.bg} shadow-sm cursor-pointer`
                                                : 'border-dashed border-zinc-200 dark:border-zinc-800 opacity-40 grayscale'
                                                }`}
                                        >
                                            <Icon className={`w-8 h-8 mb-2 ${isEarned ? b.color : 'text-zinc-400'}`} />
                                            <span className={`font-medium text-xs text-center ${isEarned ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500'}`}>
                                                {badgeName}
                                            </span>
                                            {!isEarned && <span className="text-[10px] mt-1 text-zinc-400">Locked</span>}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            <AnimatePresence>
                {isEditing && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-zinc-900 rounded-3xl p-8 w-full max-w-md shadow-2xl border border-zinc-200 dark:border-zinc-800"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">Edit Profile</h3>
                                <button onClick={() => setIsEditing(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Image Upload */}
                                <div className="flex flex-col items-center gap-4">
                                    <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-indigo-100 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800">
                                        {editProfilePic ? (
                                            <img src={editProfilePic} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                                <Camera className="w-8 h-8" />
                                            </div>
                                        )}
                                        <div
                                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                                            onClick={() => !uploadingAvatar && fileInputRef.current?.click()}
                                        >
                                            <Camera className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploadingAvatar}
                                        className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline disabled:opacity-50"
                                    >
                                        {uploadingAvatar ? 'Uploading...' : 'Change Picture'}
                                    </button>
                                </div>

                                {/* Name Input */}
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Display Name</label>
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                        placeholder="Your Name"
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1 py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={saveLoading || !editName.trim()}
                                        className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
                                    >
                                        {saveLoading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}

// Helper Component for Stats Map
function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
    return (
        <div className="bg-white/80 dark:bg-zinc-900/80 p-5 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm flex flex-col items-center justify-center text-center group hover:border-indigo-500/30 transition-colors">
            <div className="mb-2 p-2 rounded-full bg-zinc-50 dark:bg-zinc-800 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">{value}</div>
            <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">{label}</div>
        </div>
    );
}
