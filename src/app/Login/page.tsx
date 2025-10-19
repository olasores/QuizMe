"use client";"use client";



import Link from "next/link";import Link from "next/link";

import { useState } from "react";import { useState } from "react";

import { GoogleButton } from "@/components/auth/GoogleButton";import { GoogleButton } from "@/components/auth/GoogleButton";

import { getBrowserSupabase } from "@/lib/supabase/client";import { getBrowserSupabase } from "@/lib/supabase/client";



const Login = () => {const Login = () => {

    const [loading, setLoading] = useState(false);    const [loading, setLoading] = useState(false);

    const [error, setError] = useState<string | null>(null);    const [error, setError] = useState<string | null>(null);



    const handleSubmit = async (e: React.FormEvent) => {    const handleSubmit = async (e: React.FormEvent) => {

        e.preventDefault();        e.preventDefault();

        setError(null);        setError(null);

        const form = e.target as HTMLFormElement;        const form = e.target as HTMLFormElement;

        const email = form.email.value;        const email = (form.querySelector('#email') as HTMLInputElement).value;

        const password = form.password.value;        const password = (form.querySelector('#password') as HTMLInputElement).value;

        setLoading(true);

        if (!email || !password) {        try {

            setError('Please fill in all fields');            const supabase = getBrowserSupabase();

            return;            const { error } = await supabase.auth.signInWithPassword({ email, password });

        }            if (error) throw error;

            window.location.href = '/dashboard';

        try {        } catch (err: unknown) {

            setLoading(true);            let msg = 'Login failed';

            const supabase = getBrowserSupabase();            if (err && typeof err === 'object' && 'message' in err) {

            const { error } = await supabase.auth.signInWithPassword({                const m = (err as { message?: unknown }).message;

                email,                if (typeof m === 'string') msg = m;

                password            }

            });            setError(msg);

        } finally {

            if (error) {            setLoading(false);

                let msg = 'Login failed';        }

                if (error.message.includes('Invalid login')) {    };

                    msg = 'Invalid email or password';

                }    return (

                setError(msg);        <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-white via-gray-100 to-gray-300 px-4 py-10">

            } else {            <div className="w-full max-w-md bg-white border border-black rounded-3xl shadow-xl p-8 sm:p-10 relative overflow-hidden">

                window.location.href = '/dashboard';                <div className="absolute inset-0 pointer-events-none opacity-[0.04] bg-[radial-gradient(circle_at_1px_1px,#000_1px,transparent_0)] [background-size:12px_12px]"></div>

            }                <h1 className="relative text-3xl font-extrabold text-black mb-2 tracking-tight text-center">Log In</h1>

        } catch (err) {                <p className="relative text-center text-gray-600 mb-8 text-sm">Welcome back. Enter your details below.</p>

            console.error(err);

            setError('An unexpected error occurred');                <form onSubmit={handleSubmit} className="relative flex flex-col gap-5">

        } finally {                    <div className="flex flex-col gap-1">

            setLoading(false);                        <label className="text-sm font-medium text-black" htmlFor="email">Email</label>

        }                        <input

    };                            id="email"

                            type="email"

    return (                            required

        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">                            placeholder="you@example.com"

            <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-xl shadow-lg">                            className="border border-black/70 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-black shadow-sm placeholder:text-gray-400"

                <div>                        />

                    <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">                    </div>

                        Log in to your account                    <div className="flex flex-col gap-1">

                    </h2>                        <label className="text-sm font-medium text-black" htmlFor="password">Password</label>

                    <p className="mt-2 text-center text-sm text-gray-600">                        <input

                        Access your quizzes and study materials                            id="password"

                    </p>                            type="password"

                </div>                            required

                            placeholder="••••••••"

                {error && (                            className="border border-black/70 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-black shadow-sm placeholder:text-gray-400"

                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">                        />

                        <span className="block sm:inline">{error}</span>                    </div>

                    </div>                    <div className="flex items-center justify-between text-xs sm:text-sm">

                )}                        <label className="inline-flex items-center gap-2 select-none cursor-pointer">

                            <input type="checkbox" className="accent-black w-4 h-4" />

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>                            <span className="text-gray-600">Remember me</span>

                    <div className="space-y-4 rounded-md shadow-sm">                        </label>

                        <div>                        <button type="button" className="text-black underline underline-offset-4 decoration-black/40 hover:decoration-black transition text-xs sm:text-sm">Forgot password?</button>

                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>                    </div>

                            <input                    {error && <p className="text-xs text-red-600 -mt-1">{error}</p>}

                                id="email"                    <button

                                name="email"                        type="submit"

                                type="email"                        disabled={loading}

                                autoComplete="email"                        className="group relative bg-black text-white font-semibold py-3 rounded-xl shadow hover:bg-gray-900 transition disabled:opacity-60 disabled:cursor-not-allowed"

                                required                    >

                                className="relative block w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm"                        <span className="inline-flex items-center justify-center gap-2">

                            />                            {loading && <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}

                        </div>                            {loading ? 'Signing in...' : 'Log In'}

                        <div>                        </span>

                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>                    </button>

                            <input                                </form>

                                id="password"                                <div className="relative my-6 flex items-center gap-4">

                                name="password"                                    <div className="h-px flex-1 bg-black/20" />

                                type="password"                                    <span className="text-xs tracking-wide text-gray-500">OR</span>

                                autoComplete="current-password"                                    <div className="h-px flex-1 bg-black/20" />

                                required                                </div>

                                className="relative block w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm"                                <GoogleButton label="Continue with Google" redirectPath="/dashboard" />

                            />                <div className="relative mt-8 text-center text-sm text-gray-600">

                        </div>                      <span>Don&apos;t have an account? </span>

                    </div>                    <Link href="/signup" className="font-semibold text-black underline underline-offset-4 decoration-black/40 hover:decoration-black">Sign Up</Link>

                </div>

                    <div className="flex items-center justify-between">            </div>

                        <div className="text-sm">        </div>

                            <a href="#" className="font-medium text-black hover:text-gray-800">    );

                                Forgot your password?};

                            </a>

                        </div>export default Login;
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                        >
                            {loading ? 'Processing...' : 'Sign in'}
                        </button>
                    </div>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Or continue with</span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <div className="mt-4">
                                <GoogleButton label="Continue with Google" redirectPath="/dashboard" />
                            </div>
                        </div>
                    </div>

                    <p className="mt-2 text-center text-sm text-gray-600">
                        Don't have an account?{" "}
                        <Link href="/signup" className="font-semibold text-black underline underline-offset-4 decoration-black/40 hover:decoration-black">Sign Up</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;