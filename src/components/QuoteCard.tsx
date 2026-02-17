'use client';

import { useEffect, useState } from 'react';
import { Quote } from 'lucide-react';
import { motion } from 'framer-motion';

const quotes = [
    { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
    { text: "Consistency is what transforms average into excellence.", author: "Unknown" },
    { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
    { text: "The secret of your future is hidden in your daily routine.", author: "Mike Murdock" },
    { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" }
];

export default function QuoteCard() {
    const [quote, setQuote] = useState(() => {
        return quotes[Math.floor(Math.random() * quotes.length)];
    });

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Quote size={120} />
            </div>
            <div className="relative z-10">
                <div className="mb-4 opacity-80">
                    <Quote size={24} />
                </div>
                <p className="text-lg font-medium italic mb-4 leading-relaxed">
                    "{quote.text}"
                </p>
                <p className="text-sm font-semibold opacity-80">
                    — {quote.author}
                </p>
            </div>
        </motion.div>
    );
}
