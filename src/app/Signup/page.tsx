"use client";

import Link from "next/link";
import { useState } from "react";

const Signup = () => {
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => setLoading(false), 1400);
    };

    return (
        <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-white via-gray-100 to-gray-300 px-4 py-10">
            <div className="w-full max-w-md bg-white border border-black rounded-3xl shadow-xl p-8 sm:p-10 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none opacity-[0.04] bg-[radial-gradient(circle_at_1px_1px,#000_1px,transparent_0)] [background-size:12px_12px]"></div>
                <h1 className="relative text-3xl font-extrabold text-black mb-2 tracking-tight text-center">Create Account</h1>
                <p className="relative text-center text-gray-600 mb-8 text-sm">Start your learning journey today.</p>

                <form onSubmit={handleSubmit} className="relative flex flex-col gap-5">
                    <div className="flex flex-col gap-1">
                        <label htmlFor="name" className="text-sm font-medium text-black">Full Name</label>
                        <input
                            id="name"
                            type="text"
                            placeholder="Jane Doe"
                            required
                            className="border border-black/70 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-black shadow-sm placeholder:text-gray-400"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="email" className="text-sm font-medium text-black">Email</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            required
                            className="border border-black/70 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-black shadow-sm placeholder:text-gray-400"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="password" className="text-sm font-medium text-black">Password</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            required
                            className="border border-black/70 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-black shadow-sm placeholder:text-gray-400"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="confirmPassword" className="text-sm font-medium text-black">Confirm Password</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            required
                            className="border border-black/70 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-black shadow-sm placeholder:text-gray-400"
                        />
                    </div>
                    <div className="flex items-start gap-2 text-xs sm:text-sm">
                        <input type="checkbox" id="terms" className="accent-black mt-1" required />
                        <label htmlFor="terms" className="text-gray-600 leading-snug">I agree to the <span className="underline decoration-black/40">Terms</span> & <span className="underline decoration-black/40">Privacy Policy</span>.</label>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative bg-black text-white font-semibold py-3 rounded-xl shadow hover:bg-gray-900 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        <span className="inline-flex items-center justify-center gap-2">
                            {loading && <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                            {loading ? 'Creating account...' : 'Sign Up'}
                        </span>
                    </button>
                </form>
                <div className="relative mt-8 text-center text-sm text-gray-600">
                    <span>Already have an account? </span>
                    <Link href="/Login" className="font-semibold text-black underline underline-offset-4 decoration-black/40 hover:decoration-black">Log In</Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;