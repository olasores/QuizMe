"use client";

import Link from "next/link";
import { useState } from "react";

const Login = () => {
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate auth delay
        setTimeout(() => setLoading(false), 1200);
    };

    return (
        <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-white via-gray-100 to-gray-300 px-4 py-10">
            <div className="w-full max-w-md bg-white border border-black rounded-3xl shadow-xl p-8 sm:p-10 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none opacity-[0.04] bg-[radial-gradient(circle_at_1px_1px,#000_1px,transparent_0)] [background-size:12px_12px]"></div>
                <h1 className="relative text-3xl font-extrabold text-black mb-2 tracking-tight text-center">Log In</h1>
                <p className="relative text-center text-gray-600 mb-8 text-sm">Welcome back. Enter your details below.</p>

                <form onSubmit={handleSubmit} className="relative flex flex-col gap-5">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-black" htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            required
                            placeholder="you@example.com"
                            className="border border-black/70 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-black shadow-sm placeholder:text-gray-400"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-black" htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            required
                            placeholder="••••••••"
                            className="border border-black/70 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-black shadow-sm placeholder:text-gray-400"
                        />
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                        <label className="inline-flex items-center gap-2 select-none cursor-pointer">
                            <input type="checkbox" className="accent-black w-4 h-4" />
                            <span className="text-gray-600">Remember me</span>
                        </label>
                        <button type="button" className="text-black underline underline-offset-4 decoration-black/40 hover:decoration-black transition text-xs sm:text-sm">Forgot password?</button>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative bg-black text-white font-semibold py-3 rounded-xl shadow hover:bg-gray-900 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        <span className="inline-flex items-center justify-center gap-2">
                            {loading && <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                            {loading ? 'Signing in...' : 'Log In'}
                        </span>
                    </button>
                </form>
                <div className="relative mt-8 text-center text-sm text-gray-600">
                      <span>Don&apos;t have an account? </span>
                    <Link href="/Signup" className="font-semibold text-black underline underline-offset-4 decoration-black/40 hover:decoration-black">Sign Up</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;