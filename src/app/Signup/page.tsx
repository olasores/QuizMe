"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { getBrowserSupabase } from "@/lib/supabase/client";

const Signup = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [info, setInfo] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setInfo(null);
        const form = e.target as HTMLFormElement;
        const name = (form.querySelector('#name') as HTMLInputElement).value.trim();
        const email = (form.querySelector('#email') as HTMLInputElement).value.trim();
        const password = (form.querySelector('#password') as HTMLInputElement).value;
        const confirm = (form.querySelector('#confirmPassword') as HTMLInputElement).value;
        
        if (password !== confirm) {
            setError('Passwords do not match');
            return;
        }
        
        setLoading(true);
        try {
            const supabase = getBrowserSupabase();
            
            // Attempt signup - Supabase Auth will handle duplicate email check
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { full_name: name },
                    emailRedirectTo: `${window.location.origin}/dashboard`
                }
            });
            
            // Check for duplicate user error from Auth
            if (error && error.message && error.message.includes('already registered')) {
                setError('This email is already registered. Please log in instead.');
                setLoading(false);
                return;
            }
            
            if (error) throw error;
            
            // Create user profile in the users table
            if (data.user) {
              try {
                await fetch('/api/create-user-profile', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    user_id: data.user.id,
                    email: data.user.email,
                    full_name: name
                  })
                });
              } catch (profileError) {
                console.error('Failed to create user profile:', profileError);
              }
            }
            
            // If email confirmation is ON in Supabase, user must verify; otherwise session exists.
            if (data.user && !data.session) {
                setInfo('Check your email to confirm your account. After verification, you can log in with your credentials.');
            } else {
                window.location.href = '/dashboard';
            }
        } catch (err: unknown) {
            let msg = 'Signup failed';
            if (err && typeof err === 'object' && 'message' in err) {
                const m = (err as { message?: unknown }).message;
                if (typeof m === 'string') msg = m;
            }
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-white via-gray-100 to-gray-300 px-4 py-10">
            <div className="w-full max-w-md bg-white border border-black rounded-3xl shadow-xl p-8 sm:p-10 relative overflow-hidden">
                <button
                    onClick={() => router.back()}
                    className="absolute top-6 left-6 z-10 flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-black transition-colors"
                    aria-label="Go back"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                    Back
                </button>
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
                            className="border border-black/70 rounded-xl px-4 py-3 bg-white text-black focus:outline-none focus:ring-2 focus:ring-black shadow-sm placeholder:text-gray-400"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="email" className="text-sm font-medium text-black">Email</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            required
                            className="border border-black/70 rounded-xl px-4 py-3 bg-white text-black focus:outline-none focus:ring-2 focus:ring-black shadow-sm placeholder:text-gray-400"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="password" className="text-sm font-medium text-black">Password</label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                required
                                className="w-full border border-black/70 rounded-xl px-4 py-3 bg-white text-black focus:outline-none focus:ring-2 focus:ring-black shadow-sm placeholder:text-gray-400"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black transition"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="confirmPassword" className="text-sm font-medium text-black">Confirm Password</label>
                        <div className="relative">
                            <input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="••••••••"
                                required
                                className="w-full border border-black/70 rounded-xl px-4 py-3 bg-white text-black focus:outline-none focus:ring-2 focus:ring-black shadow-sm placeholder:text-gray-400"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black transition"
                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                            >
                                {showConfirmPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                    {error && <p className="text-xs text-red-600 -mt-1">{error}</p>}
                    {info && !error && (
                        <div className="text-xs text-blue-600 -mt-1">
                            <p className="mb-2">{info}</p>
                            <Link href="/Login" className="font-semibold underline underline-offset-2 hover:no-underline">
                                Go to Login →
                            </Link>
                        </div>
                    )}
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
                        <div className="relative my-6 flex items-center gap-4">
                            <div className="h-px flex-1 bg-black/20" />
                            <span className="text-xs tracking-wide text-gray-500">OR</span>
                            <div className="h-px flex-1 bg-black/20" />
                            <div className="h-px flex-1 bg-black/20" />
                        </div>
                        <GoogleButton label="Sign up with Google" redirectPath="/dashboard" />
                <div className="relative mt-8 text-center text-sm text-gray-600">
                    <span>Already have an account? </span>
                    <Link href="/Login" className="font-semibold text-black underline underline-offset-4 decoration-black/40 hover:decoration-black">Log In</Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;