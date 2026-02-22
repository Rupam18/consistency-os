'use client';

import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, X } from 'lucide-react';

interface AchievementEvent extends CustomEvent {
    detail: {
        leveledUp: boolean;
        level: number;
        newBadges: string[];
    };
}

export default function AchievementPopup() {
    const [achievements, setAchievements] = useState<any[]>([]);

    useEffect(() => {
        const handleAchievement = (e: Event) => {
            const { detail } = e as AchievementEvent;
            const newAchievements: any[] = [];

            if (detail.leveledUp) {
                newAchievements.push({
                    id: Date.now() + Math.random(),
                    type: 'level',
                    title: 'Level Up!',
                    message: `You reached Level ${detail.level} \uD83D\uDE80`,
                    icon: Star,
                    color: 'text-yellow-500'
                });
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }

            if (detail.newBadges && detail.newBadges.length > 0) {
                detail.newBadges.forEach((badge) => {
                    newAchievements.push({
                        id: Date.now() + Math.random(),
                        type: 'badge',
                        title: 'New Badge Unlocked!',
                        message: badge,
                        icon: Trophy,
                        color: 'text-indigo-500'
                    });
                    confetti({
                        particleCount: 100,
                        spread: 60,
                        origin: { y: 0.6 },
                        colors: ['#6366f1', '#a855f7', '#ec4899']
                    });
                });
            }

            if (newAchievements.length > 0) {
                setAchievements((prev) => [...prev, ...newAchievements]);
            }
        };

        window.addEventListener('gamification-event', handleAchievement);
        return () => window.removeEventListener('gamification-event', handleAchievement);
    }, []);

    const removeAchievement = (id: number) => {
        setAchievements((prev) => prev.filter(a => a.id !== id));
    };

    // Auto remove achievements after 5 seconds
    useEffect(() => {
        if (achievements.length > 0) {
            const timer = setTimeout(() => {
                setAchievements((prev) => prev.slice(1));
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [achievements]);

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3">
            <AnimatePresence>
                {achievements.map((achievement) => {
                    const Icon = achievement.icon;
                    return (
                        <motion.div
                            key={achievement.id}
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 50, scale: 0.9 }}
                            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl rounded-2xl p-4 flex items-start gap-4 min-w-[300px]"
                        >
                            <div className={`p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 ${achievement.color}`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{achievement.title}</h4>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">{achievement.message}</p>
                            </div>
                            <button
                                onClick={() => removeAchievement(achievement.id)}
                                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
