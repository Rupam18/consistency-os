
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [passwordError, setPasswordError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Real-time password matching validation
        if (name === 'password' || name === 'confirmPassword') {
            const password = name === 'password' ? value : formData.password;
            const confirmPassword = name === 'confirmPassword' ? value : formData.confirmPassword;

            if (confirmPassword && password !== confirmPassword) {
                setPasswordError('Passwords do not match');
            } else {
                setPasswordError('');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            router.push('/login');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-zinc-950 px-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[120px]" />
                <div className="absolute top-[60%] right-[10%] w-[30%] h-[30%] rounded-full bg-purple-500/5 blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.2 }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white mb-4 shadow-lg"
                    >
                        <Zap className="w-8 h-8 fill-white" />
                    </motion.div>
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white leading-tight">
                        NoZeroDay
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-medium">
                        Every day is a chance for a non-zero day.
                    </p>
                </div>

                <div className="p-8 space-y-6 bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-sm relative z-10">
                    <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white">
                        Create an Account
                    </h2>
                    {error && <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-500/10 py-2 rounded-lg">{error}</div>}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                            >
                                Name
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                className="w-full px-3 py-2 mt-1 text-gray-900 dark:text-gray-100 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring focus:ring-indigo-200 dark:focus:ring-indigo-800"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="w-full px-3 py-2 mt-1 text-gray-900 dark:text-gray-100 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring focus:ring-indigo-200 dark:focus:ring-indigo-800"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                            >
                                Password
                            </label>
                            <div className="relative mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="w-full px-3 py-2 pr-10 text-gray-900 dark:text-gray-100 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring focus:ring-indigo-200 dark:focus:ring-indigo-800"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                            >
                                Confirm Password
                            </label>
                            <div className="relative mt-1">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    className="w-full px-3 py-2 pr-10 text-gray-900 dark:text-gray-100 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring focus:ring-indigo-200 dark:focus:ring-indigo-800"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {passwordError && (
                                <p className="mt-1 text-xs text-red-500">{passwordError}</p>
                            )}
                            {formData.confirmPassword && !passwordError && (
                                <p className="mt-1 text-xs text-green-500">Passwords match ✓</p>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !!passwordError || !formData.confirmPassword}
                            className="w-full px-4 py-2 font-bold text-white bg-indigo-600 rounded hover:bg-indigo-700 focus:outline-none focus:ring disabled:opacity-50"
                        >
                            {loading ? 'Registering...' : 'Register'}
                        </button>
                    </form>
                    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 text-center text-sm text-gray-600 dark:text-gray-400">
                        Already have an account?{' '}
                        <Link href="/login" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors">
                            Login
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
