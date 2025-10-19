"use client";"use client";



import Link from "next/link";import Link from "next/link";

import { useState } from "react";import { useState } from "react";

import { GoogleButton } from "@/components/auth/GoogleButton";import { GoogleButton } from "@/components/auth/GoogleButton";

import { getBrowserSupabase } from "@/lib/supabase/client";import { getBrowserSupabase } from "@/lib/supabase/client";



const Signup = () => {const Signup = () => {

    const [loading, setLoading] = useState(false);    const [loading, setLoading] = useState(false);

    const [error, setError] = useState<string | null>(null);    const [error, setError] = useState<string | null>(null);

    const [info, setInfo] = useState<string | null>(null);    const [info, setInfo] = useState<string | null>(null);



    const handleSubmit = async (e: React.FormEvent) => {    const handleSubmit = async (e: React.FormEvent) => {

        e.preventDefault();        e.preventDefault();

        setError(null);        setError(null);

        setInfo(null);        setInfo(null);

                const form = e.target as HTMLFormElement;

        const form = e.target as HTMLFormElement;        const name = (form.querySelector('#name') as HTMLInputElement).value.trim();

        const email = form.email.value;        const email = (form.querySelector('#email') as HTMLInputElement).value.trim();

        const password = form.password.value;        const password = (form.querySelector('#password') as HTMLInputElement).value;

        const confirm = form.confirmPassword.value;        const confirm = (form.querySelector('#confirmPassword') as HTMLInputElement).value;

        if (password !== confirm) {

        if (!email || !password || !confirm) {            setError('Passwords do not match');

            setError('Please fill in all fields');            return;

            return;        }

        }        setLoading(true);

                try {

        if (password !== confirm) {            const supabase = getBrowserSupabase();

            setError('Passwords do not match');            const { data, error } = await supabase.auth.signUp({

            return;                email,

        }                password,

                options: {

        if (password.length < 6) {                    data: { full_name: name },

            setError('Password must be at least 6 characters');                    emailRedirectTo: `${window.location.origin}/dashboard`

            return;                }

        }            });

            if (error) throw error;

        try {            // If email confirmation is ON in Supabase, user must verify; otherwise session exists.

            setLoading(true);            if (data.user && !data.session) {

            const supabase = getBrowserSupabase();                setInfo('Check your email to confirm your account, then return – you will be redirected after confirmation.');

                        } else {

            const { error } = await supabase.auth.signUp({                window.location.href = '/dashboard';

                email,            }

                password,        } catch (err: unknown) {

                options: {            let msg = 'Signup failed';

                    emailRedirectTo: `${window.location.origin}/dashboard`            if (err && typeof err === 'object' && 'message' in err) {

                }                const m = (err as { message?: unknown }).message;

            });                if (typeof m === 'string') msg = m;

            }

            if (error) throw error;            setError(msg);

                    } finally {

            setInfo('Check your email to confirm your account, then return – you will be redirected after confirmation.');            setLoading(false);

                    }

        } catch (err) {    };

            console.error(err);

            const errMsg = err instanceof Error ? err.message : 'An unexpected error occurred';    return (

            setError(errMsg);        <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-white via-gray-100 to-gray-300 px-4 py-10">

        } finally {            <div className="w-full max-w-md bg-white border border-black rounded-3xl shadow-xl p-8 sm:p-10 relative overflow-hidden">

            setLoading(false);                <div className="absolute inset-0 pointer-events-none opacity-[0.04] bg-[radial-gradient(circle_at_1px_1px,#000_1px,transparent_0)] [background-size:12px_12px]"></div>

        }                <h1 className="relative text-3xl font-extrabold text-black mb-2 tracking-tight text-center">Create Account</h1>

    };                <p className="relative text-center text-gray-600 mb-8 text-sm">Start your learning journey today.</p>



    return (            <form onSubmit={handleSubmit} className="relative flex flex-col gap-5">

        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">                    <div className="flex flex-col gap-1">

            <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-xl shadow-lg">                        <label htmlFor="name" className="text-sm font-medium text-black">Full Name</label>

                <div>                        <input

                    <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">                            id="name"

                        Create your account                            type="text"

                    </h2>                            placeholder="Jane Doe"

                    <p className="mt-2 text-center text-sm text-gray-600">                            required

                        Start creating and taking quizzes today                            className="border border-black/70 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-black shadow-sm placeholder:text-gray-400"

                    </p>                        />

                </div>                    </div>

                    <div className="flex flex-col gap-1">

                {error && (                        <label htmlFor="email" className="text-sm font-medium text-black">Email</label>

                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">                        <input

                        <span className="block sm:inline">{error}</span>                            id="email"

                    </div>                            type="email"

                )}                            placeholder="you@example.com"

                            required

                {info && (                            className="border border-black/70 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-black shadow-sm placeholder:text-gray-400"

                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative" role="alert">                        />

                        <span className="block sm:inline">{info}</span>                    </div>

                    </div>                    <div className="flex flex-col gap-1">

                )}                        <label htmlFor="password" className="text-sm font-medium text-black">Password</label>

                        <input

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>                            id="password"

                    <div className="space-y-4 rounded-md shadow-sm">                            type="password"

                        <div>                            placeholder="••••••••"

                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>                            required

                            <input                            className="border border-black/70 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-black shadow-sm placeholder:text-gray-400"

                                id="email"                        />

                                name="email"                    </div>

                                type="email"                    <div className="flex flex-col gap-1">

                                autoComplete="email"                        <label htmlFor="confirmPassword" className="text-sm font-medium text-black">Confirm Password</label>

                                required                        <input

                                className="relative block w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm"                            id="confirmPassword"

                            />                            type="password"

                        </div>                            placeholder="••••••••"

                        <div>                            required

                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>                            className="border border-black/70 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-black shadow-sm placeholder:text-gray-400"

                            <input                        />

                                id="password"                    </div>

                                name="password"                    <div className="flex items-start gap-2 text-xs sm:text-sm">

                                type="password"                        <input type="checkbox" id="terms" className="accent-black mt-1" required />

                                autoComplete="new-password"                        <label htmlFor="terms" className="text-gray-600 leading-snug">I agree to the <span className="underline decoration-black/40">Terms</span> & <span className="underline decoration-black/40">Privacy Policy</span>.</label>

                                required                    </div>

                                className="relative block w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm"                    {error && <p className="text-xs text-red-600 -mt-1">{error}</p>}

                            />                    {info && !error && <p className="text-xs text-blue-600 -mt-1">{info}</p>}

                        </div>                    <button

                        <div>                        type="submit"

                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm password</label>                        disabled={loading}

                            <input                        className="group relative bg-black text-white font-semibold py-3 rounded-xl shadow hover:bg-gray-900 transition disabled:opacity-60 disabled:cursor-not-allowed"

                                id="confirmPassword"                    >

                                name="confirmPassword"                        <span className="inline-flex items-center justify-center gap-2">

                                type="password"                            {loading && <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}

                                autoComplete="new-password"                            {loading ? 'Creating account...' : 'Sign Up'}

                                required                        </span>

                                className="relative block w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm"                    </button>

                            />                        </form>

                        </div>                        <div className="relative my-6 flex items-center gap-4">

                    </div>                            <div className="h-px flex-1 bg-black/20" />

                            <span className="text-xs tracking-wide text-gray-500">OR</span>

                    <div>                            <div className="h-px flex-1 bg-black/20" />

                        <button                            <div className="h-px flex-1 bg-black/20" />

                            type="submit"                        </div>

                            disabled={loading}                        <GoogleButton label="Sign up with Google" redirectPath="/dashboard" />

                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"                <div className="relative mt-8 text-center text-sm text-gray-600">

                        >                    <span>Already have an account? </span>

                            {loading ? 'Processing...' : 'Create account'}                    <Link href="/login" className="font-semibold text-black underline underline-offset-4 decoration-black/40 hover:decoration-black">Log In</Link>

                        </button>                </div>

                    </div>            </div>

        </div>

                    <div className="mt-6">    );

                        <div className="relative">};

                            <div className="absolute inset-0 flex items-center">

                                <div className="w-full border-t border-gray-300"></div>export default Signup;
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Or continue with</span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <div className="mt-4">
                                <GoogleButton label="Sign up with Google" redirectPath="/dashboard" />
                            </div>
                        </div>
                    </div>

                    <p className="mt-2 text-center text-sm text-gray-600">
                        Already have an account?{" "}
                        <Link href="/login" className="font-semibold text-black underline underline-offset-4 decoration-black/40 hover:decoration-black">Log In</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Signup;