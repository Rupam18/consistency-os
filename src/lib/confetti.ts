'use client';

import confetti from 'canvas-confetti';

export function triggerConfetti() {
    const end = Date.now() + 1000;

    const colors = ['#6366f1', '#10b981', '#f59e0b']; // Indigo, Green, Orange

    (function frame() {
        if (typeof window === 'undefined') return;

        confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: colors
        });

        confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: colors
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
}
