"use client";

import { useState, useEffect } from "react";
import { Menu, X, Home, Trophy, User, Settings as SettingsIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();
    const { setTheme } = useTheme();

    useEffect(() => {
        // Sync theme on initial layout load
        const syncTheme = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const res = await fetch('/api/user/profile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.user?.preferences?.theme) {
                        setTheme(data.user.preferences.theme);
                    }
                }
            } catch (err) {
                console.error("Theme sync failed", err);
            }
        };
        syncTheme();
    }, [setTheme]);

    const navItems = [
        { name: "Dashboard", href: "/dashboard", icon: Home },
        { name: "Challenges", href: "/challenges", icon: Trophy },
        { name: "Profile", href: "/profile", icon: User },
        { name: "Settings", href: "/settings", icon: SettingsIcon },
    ];

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-gradient-to-b dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col md:flex-row">

            {/* 🔹 MOBILE HEADER */}
            <div className="md:hidden flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md sticky top-0 z-40">
                <h1 className="font-bold text-xl bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">NoZeroDay</h1>
                <button onClick={() => setOpen(true)} className="p-2 -mr-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            {/* 🔹 MOBILE DRAWER */}
            <AnimatePresence>
                {open && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden"
                            onClick={() => setOpen(false)}
                        />
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                            className="fixed inset-y-0 left-0 z-50 w-[280px] bg-white dark:bg-zinc-900 shadow-2xl overflow-y-auto"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-8">
                                    <h2 className="font-bold text-xl bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">Menu</h2>
                                    <button onClick={() => setOpen(false)} className="p-2 -mr-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <nav className="space-y-2">
                                    {navItems.map((item) => {
                                        const isActive = pathname.startsWith(item.href);
                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                onClick={() => setOpen(false)}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive
                                                    ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                                                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200"
                                                    }`}
                                            >
                                                <item.icon className="w-5 h-5" />
                                                {item.name}
                                            </Link>
                                        );
                                    })}
                                </nav>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* 🔹 DESKTOP SIDEBAR */}
            <aside className="hidden md:flex flex-col w-72 border-r border-zinc-200 dark:border-zinc-800/50 bg-white dark:bg-zinc-900/50 min-h-screen sticky top-0 shrink-0">
                <div className="p-8">
                    <Link href="/dashboard" className="flex items-center gap-2 mb-10 group">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-105 transition-transform">
                            N
                        </div>
                        <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">NoZeroDay</span>
                    </Link>

                    <nav className="space-y-2">
                        {navItems.map((item) => {
                            const isActive = pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive
                                        ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm"
                                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200"
                                        }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </aside>

            {/* 🔹 MAIN CONTENT */}
            <main className="flex-1 min-w-0 pb-20 md:pb-0">
                {children}
            </main>

            {/* 🔹 MOBILE BOTTOM NAV */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-800 flex justify-around py-3 px-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-40 pb-safe">
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex flex-col items-center justify-center gap-1 transition-colors ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300"
                                }`}
                        >
                            <div className={`p-1.5 rounded-full transition-colors ${isActive ? "bg-indigo-50 dark:bg-indigo-500/10" : ""}`}>
                                <item.icon className={`w-5 h-5 ${isActive ? "fill-indigo-100 dark:fill-indigo-500/20" : ""}`} />
                            </div>
                            <span className="text-[10px] font-semibold">{item.name}</span>
                        </Link>
                    );
                })}
            </div>

        </div>
    );
}
