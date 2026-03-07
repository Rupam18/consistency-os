"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

export function DarkModeShortcut() {
    const { theme, setTheme, resolvedTheme } = useTheme();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if user is typing in an input, textarea, or contenteditable
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement ||
                (e.target as HTMLElement).isContentEditable
            ) {
                return;
            }

            if (e.key.toLowerCase() === "d") {
                setTheme(resolvedTheme === "dark" ? "light" : "dark");
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [resolvedTheme, setTheme]);

    return null;
}
