'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, ArrowRight, Loader2, LockKeyhole } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                // Successful admin login
                localStorage.setItem('token', data.token);
                // Redirect straight to dashboard
                router.push('/admin');
            } else {
                setError(data.message || 'Login failed. Are you sure you are an admin?');
            }
        } catch (err) {
            setError('System error connecting to authentication server.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen w-full flex bg-zinc-950">
            {/* Left Side: Brand & Visual */}
            <div className="hidden lg:flex w-1/2 bg-zinc-900 border-r border-zinc-800 p-12 flex-col justify-between relative overflow-hidden">
                {/* Abstract Background Design */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-50 pointer-events-none">
                    <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-indigo-900/20 blur-[120px]" />
                    <div className="absolute top-[40%] right-[10%] w-[50%] h-[50%] rounded-full bg-violet-900/20 blur-[100px]" />
                </div>

                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <LockKeyhole className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-2xl font-black text-white tracking-tight">NoZeroDay</span>
                </div>

                <div className="relative z-10">
                    <h1 className="text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
                        System Administration <br />
                        <span className="text-indigo-400">Portal</span>
                    </h1>
                    <p className="text-zinc-400 text-lg max-w-md leading-relaxed">
                        Authorized personnel only. Monitor platform telemetry, manage user accounts, and review global habit completion statistics.
                    </p>
                </div>

                <div className="relative z-10 text-zinc-600 text-sm font-medium">
                    &copy; {new Date().getFullYear()} NoZeroDay Systems. All Rights Reserved.
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
                <div className="w-full max-w-md space-y-8 relative z-10">

                    <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <LockKeyhole className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-2xl font-black text-white tracking-tight">NoZeroDay Admin</span>
                    </div>

                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h2>
                        <p className="text-zinc-400 mt-2">Sign in to your administrator account</p>
                    </div>

                    <form onSubmit={handleLogin} className="mt-8 space-y-6">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3"
                            >
                                <Shield className="w-5 h-5 shrink-0" />
                                <p>{error}</p>
                            </motion.div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-1.5" htmlFor="email">
                                    Admin Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full rounded-xl border-0 bg-zinc-900 py-3.5 px-4 text-white shadow-sm ring-1 ring-inset ring-zinc-800 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm transition-all"
                                    placeholder="admin@nozeroday.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-1.5" htmlFor="password">
                                    Security Key / Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full rounded-xl border-0 bg-zinc-900 py-3.5 px-4 text-white shadow-sm ring-1 ring-inset ring-zinc-800 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm transition-all"
                                    placeholder="••••••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center items-center gap-2 rounded-xl bg-white px-4 py-3.5 text-sm font-bold text-zinc-900 shadow-sm hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
                                    Authenticating...
                                </>
                            ) : (
                                <>
                                    Authorize Access
                                    <ArrowRight className="w-4 h-4 ml-1" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center lg:text-left">
                        <Link href="/login" className="text-sm font-medium text-zinc-500 hover:text-white transition-colors">
                            &larr; Return to Standard User Login
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
