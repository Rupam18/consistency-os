'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { User, Lock, Bell, Eye, Database, HelpCircle, Save, AlertTriangle, Monitor, Moon, Sun, MonitorSmartphone, Plus, X, CreditCard, ChevronRight, CheckCircle2, Loader2, Camera, Trash2, XCircle } from 'lucide-react';

type TabId = 'account' | 'security' | 'notifications' | 'privacy' | 'preferences' | 'danger';

export default function SettingsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabId>('account');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // User Data State
    const [user, setUser] = useState<any>(null);

    // Account Tab State
    const [name, setName] = useState('');
    const [profilePicture, setProfilePicture] = useState('');

    // Security Tab State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Preferences & Privacy State
    const [themeState, setThemeState] = useState('system'); // Renamed to avoid conflict with useTheme's setTheme
    const [notifications, setNotifications] = useState({ email: true, push: true, weeklyReport: true });
    const [privacy, setPrivacy] = useState({ profileVisibility: 'public', showStreak: true, allowInvites: true });

    // Danger Zone State
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
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
                const { user: userData } = await res.json();
                setUser(userData);
                setName(userData.name || '');
                setProfilePicture(userData.profilePicture || '');

                if (userData.preferences) {
                    setThemeState(userData.preferences.theme || 'system'); // Use themeState
                    if (userData.preferences.notifications) setNotifications(userData.preferences.notifications);
                    if (userData.preferences.privacy) setPrivacy(userData.preferences.privacy);
                }
            } else {
                router.push('/login');
            }
        } catch (error) {
            console.error('Failed to fetch user', error);
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            showToast("Image size should be less than 2MB", 'error');
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        setUploadingAvatar(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("/api/settings/upload-avatar", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await res.json();
            if (res.ok && data.profilePicture) {
                setProfilePicture(data.profilePicture);
                setUser((prev: any) => ({ ...prev, profilePicture: data.profilePicture }));
                showToast("Avatar updated successfully!", "success");
            } else {
                showToast(data.error || "Failed to upload avatar", "error");
            }
        } catch (error) {
            console.error("Upload error", error);
            showToast("An error occurred during upload", "error");
        } finally {
            setUploadingAvatar(false);
        }
    };

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    const saveAccount = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/settings/account', {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ name, profilePicture })
            });

            if (res.ok) showToast('Account updated successfully', 'success');
            else showToast((await res.json()).message, 'error');
        } catch (e) { showToast('An error occurred', 'error'); }
        setSaving(false);
    };

    const savePassword = async () => {
        if (newPassword !== confirmPassword) {
            showToast('New passwords do not match', 'error');
            return;
        }
        if (newPassword.length < 6) {
            showToast('Password must be at least 6 characters', 'error');
            return;
        }

        setSaving(true);
        try {
            const res = await fetch('/api/settings/password', {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ currentPassword, newPassword })
            });

            if (res.ok) {
                showToast('Password changed successfully', 'success');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                showToast((await res.json()).message, 'error');
            }
        } catch (e) { showToast('An error occurred', 'error'); }
        setSaving(false);
    };

    const handleThemeChange = async (newTheme: string) => {
        setTheme(newTheme); // Update next-themes context
        setThemeState(newTheme); // Update local state

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/settings/preferences', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ theme: newTheme }),
            });

            if (!res.ok) {
                console.error("Failed to save theme setting to database");
                showToast("Failed to save theme to profile.", "error");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const savePreferences = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/settings/preferences', {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ theme: themeState, notifications, privacy }) // Use themeState
            });

            if (res.ok) showToast('Preferences saved successfully', 'success');
            else showToast((await res.json()).message, 'error');
        } catch (e) { showToast('An error occurred', 'error'); }
        setSaving(false);
    };

    const handleDeleteAccount = async () => {
        setDeleting(true);
        try {
            const res = await fetch('/api/settings/delete', {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            if (res.ok) {
                localStorage.removeItem('token');
                router.push('/login');
            } else {
                showToast((await res.json()).message, 'error');
                setShowDeleteConfirm(false);
                setDeleting(false);
            }
        } catch (e) {
            showToast('An error occurred', 'error');
            setShowDeleteConfirm(false);
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
            </div>
        );
    }

    const tabs = [
        { id: 'account', label: 'Account', icon: User },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'privacy', label: 'Privacy', icon: Eye },
        { id: 'preferences', label: 'Preferences', icon: Monitor },
        { id: 'danger', label: 'Danger Zone', icon: AlertTriangle, danger: true },
    ];

    return (
        <div className="relative overflow-hidden w-full px-4 sm:px-6 lg:px-8 py-10">
            {/* Background Details */}
            <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-2">Settings</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">Manage your account, preferences, and privacy.</p>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar Sidebar */}
                    <div className="w-full md:w-64 shrink-0">
                        <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-4 md:pb-0 scrollbar-hide">
                            {tabs.map(tab => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as TabId)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all shrink-0 ${isActive
                                            ? tab.danger
                                                ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                                                : 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                            : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 min-w-0">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm"
                            >
                                {/* ---- ACCOUNT TAB ---- */}
                                {activeTab === 'account' && (
                                    <div className="space-y-8">
                                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Profile Information</h2>

                                        <div className="flex items-center gap-6">
                                            <div className="relative group w-24 h-24 rounded-full border-2 border-indigo-100 dark:border-indigo-500/20 overflow-hidden shrink-0">
                                                {profilePicture ? (
                                                    <img src={profilePicture} alt="Avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full bg-zinc-100 dark:bg-zinc-800 text-3xl font-bold text-indigo-500">
                                                        {user?.name?.charAt(0) || 'U'}
                                                    </div>
                                                )}

                                                {/* Upload Overlay */}
                                                <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-sm transition cursor-pointer">
                                                    {uploadingAvatar ? (
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                    ) : (
                                                        <span className="font-semibold text-xs drop-shadow-md">Change</span>
                                                    )}
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        disabled={uploadingAvatar}
                                                        className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                                        onChange={handleImageUpload}
                                                    />
                                                </label>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-zinc-900 dark:text-white">Profile Avatar</h3>
                                                <p className="text-sm text-zinc-500">JPG, GIF or PNG. Max size 2MB.</p>
                                                {uploadingAvatar && <p className="text-xs font-medium text-indigo-500 mt-1">Uploading to Cloudinary...</p>}
                                            </div>
                                        </div>

                                        <div className="grid gap-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Display Name</label>
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="w-full max-w-md px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Email Address</label>
                                                <input
                                                    type="email"
                                                    disabled
                                                    value={user?.email || ''}
                                                    className="w-full max-w-md px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800/50 text-zinc-500 cursor-not-allowed"
                                                />
                                                <p className="text-xs text-zinc-500 mt-2">Your email address cannot be changed.</p>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                            <button
                                                onClick={saveAccount} disabled={saving}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-sm transition-all flex items-center gap-2 disabled:opacity-70"
                                            >
                                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* ---- SECURITY TAB ---- */}
                                {activeTab === 'security' && (
                                    <div className="space-y-8">
                                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Security Settings</h2>

                                        <div className="max-w-md space-y-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Current Password</label>
                                                <input
                                                    type="password"
                                                    value={currentPassword}
                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">New Password</label>
                                                <input
                                                    type="password"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Confirm New Password</label>
                                                <input
                                                    type="password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                            <button
                                                onClick={savePassword} disabled={saving}
                                                className="bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 dark:text-zinc-900 text-white px-6 py-3 rounded-xl font-bold shadow-sm transition-all flex items-center gap-2 disabled:opacity-70"
                                            >
                                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />} Update Password
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* ---- OTHER PREFERENCES TABS ---- */}
                                {(activeTab === 'notifications' || activeTab === 'privacy' || activeTab === 'preferences') && (
                                    <div className="space-y-8">
                                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white capitalize">{activeTab}</h2>

                                        <div className="space-y-6">
                                            {activeTab === 'notifications' && (
                                                <>
                                                    <ToggleOption label="Email Notifications" desc="Receive updates regarding your streaks and challenges via email." checked={notifications.email} onChange={(c) => setNotifications({ ...notifications, email: c })} />
                                                    <ToggleOption label="Push Notifications" desc="Get browser push notifications for daily reminders." checked={notifications.push} onChange={(c) => setNotifications({ ...notifications, push: c })} />
                                                    <ToggleOption label="Weekly Report" desc="Receive a weekly summary of your progress and XP." checked={notifications.weeklyReport} onChange={(c) => setNotifications({ ...notifications, weeklyReport: c })} />
                                                </>
                                            )}
                                            {activeTab === 'privacy' && (
                                                <>
                                                    <div className="mb-6 max-w-md">
                                                        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Profile Visibility</label>
                                                        <select
                                                            value={privacy.profileVisibility}
                                                            onChange={(e) => setPrivacy({ ...privacy, profileVisibility: e.target.value })}
                                                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                                        >
                                                            <option value="public">Public</option>
                                                            <option value="friends">Friends Only</option>
                                                            <option value="private">Private</option>
                                                        </select>
                                                    </div>
                                                    <ToggleOption label="Display Streaks" desc="Show your current and longest streak on your public profile." checked={privacy.showStreak} onChange={(c) => setPrivacy({ ...privacy, showStreak: c })} />
                                                    <ToggleOption label="Allow Invites" desc="Let other users send you challenge invites." checked={privacy.allowInvites} onChange={(c) => setPrivacy({ ...privacy, allowInvites: c })} />
                                                </>
                                            )}
                                            {activeTab === 'preferences' && (
                                                <>
                                                    <div className="mb-6 max-w-md">
                                                        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Display Theme</label>
                                                        <select
                                                            value={theme}
                                                            onChange={(e) => setTheme(e.target.value)}
                                                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                                        >
                                                            <option value="system">System Default</option>
                                                            <option value="light">Light Mode</option>
                                                            <option value="dark">Dark Mode</option>
                                                        </select>
                                                        <p className="text-xs text-zinc-500 mt-2">Updates layout theme purely for this account storage.</p>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                            <button
                                                onClick={savePreferences} disabled={saving}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-sm transition-all flex items-center gap-2 disabled:opacity-70"
                                            >
                                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Preferences
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* ---- DANGER ZONE ---- */}
                                {activeTab === 'danger' && (
                                    <div className="space-y-6">
                                        <h2 className="text-2xl font-bold text-red-600 dark:text-red-500">Danger Zone</h2>
                                        <div className="p-6 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl">
                                            <h3 className="font-bold text-red-800 dark:text-red-400 mb-2">Delete Account</h3>
                                            <p className="text-sm text-red-600/80 dark:text-red-300/80 mb-6">
                                                Once you delete your account, there is no going back. All your habits, streaks, and challenge data will be permanently wiped. Please be certain.
                                            </p>

                                            {showDeleteConfirm ? (
                                                <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-red-100 dark:border-red-500/10">
                                                    <p className="font-bold text-zinc-900 dark:text-white mb-4">Are you absolutely sure?</p>
                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={handleDeleteAccount} disabled={deleting}
                                                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm transition-all flex items-center gap-2"
                                                        >
                                                            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yes, Delete My Account'}
                                                        </button>
                                                        <button
                                                            onClick={() => setShowDeleteConfirm(false)} disabled={deleting}
                                                            className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 px-4 py-2 rounded-lg font-bold text-sm transition-all"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setShowDeleteConfirm(true)}
                                                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold shadow-sm shadow-red-600/20 transition-all flex items-center gap-2"
                                                >
                                                    <Trash2 className="w-4 h-4" /> Delete Account
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Toast Notifications */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className={`fixed bottom-6 right-6 p-4 rounded-xl shadow-lg border flex items-center gap-3 z-50 ${toast.type === 'success'
                            ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-500/10 dark:border-green-500/20 dark:text-green-400'
                            : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400'
                            }`}
                    >
                        {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <XCircle className="w-5 h-5 flex-shrink-0" />}
                        <p className="font-semibold text-sm mr-4">{toast.message}</p>
                        <button onClick={() => setToast(null)} className="opacity-50 hover:opacity-100">
                            <span className="sr-only">Close</span>
                            &times;
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Helper Component for Toggles
function ToggleOption({ label, desc, checked, onChange }: { label: string, desc: string, checked: boolean, onChange: (c: boolean) => void }) {
    return (
        <div className="flex items-center justify-between py-2 cursor-pointer" onClick={() => onChange(!checked)}>
            <div>
                <h3 className="font-semibold text-zinc-900 dark:text-white leading-tight">{label}</h3>
                <p className="text-sm text-zinc-500 mt-0.5">{desc}</p>
            </div>
            <div className={`w-12 h-6 rounded-full p-1 transition-colors ${checked ? 'bg-indigo-500' : 'bg-zinc-200 dark:bg-zinc-700'}`}>
                <motion.div
                    layout
                    className={`bg-white w-4 h-4 rounded-full shadow-sm`}
                    initial={false}
                    animate={{ x: checked ? 24 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
            </div>
        </div>
    );
}
