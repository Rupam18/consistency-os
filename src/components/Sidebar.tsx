'use client';

import {
    LayoutDashboard,
    CheckCircle,
    User,
    LogOut,
    Settings,
    Activity,
    Trophy,
    Shield
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface SidebarProps {
    onLogout: () => void;
}

const baseMenuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'Habits', icon: CheckCircle, href: '/dashboard' },
    { name: 'Challenges', icon: Activity, href: '/challenges' },
    { name: 'Leaderboard', icon: Trophy, href: '/leaderboard' },
    { name: 'Profile', icon: User, href: '/profile' },
    { name: 'Settings', icon: Settings, href: '/settings' },
];

export default function Sidebar({ onLogout }: SidebarProps) {
    const pathname = usePathname();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const fetchRole = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                const res = await fetch('/api/user/profile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.user?.isAdmin) {
                        setIsAdmin(true);
                    }
                }
            } catch (err) { }
        };
        fetchRole();
    }, []);

    const menuItems = [...baseMenuItems];
    if (isAdmin) {
        menuItems.push({ name: 'Admin Panel', icon: Shield, href: '/admin' });
    }

    return (
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 z-30">
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-gray-900 tracking-tight">NoZeroDay</span>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                                isActive
                                    ? "bg-indigo-50 text-indigo-700 font-medium"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute left-0 w-1 h-6 bg-indigo-600 rounded-r-full"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                />
                            )}
                            <item.icon className={cn(
                                "w-5 h-5 transition-colors",
                                isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600"
                            )} />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={onLogout}
                    className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
}
