"use client";

import Link from "next/link";
import { useState } from "react";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { getBrowserSupabase } from "@/lib/supabase/client";

const Signup = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [info, setInfo] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setInfo(null);
        
        const form = e.target as HTMLFormElement;
        const name = (form.querySelector('#name') as HTMLInputElement).value;
        const email = (form.querySelector('#email') as HTMLInputElement).value;
        const password = (form.querySelector('#password') as HTMLInputElement).value;
        const confirm = (form.querySelector('#confirm-password') as HTMLInputElement).value;

        if (!name || !email || !password || !confirm) {
            setError('Please fill in all fields');
            return;
        }

        if (password !== confirm) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const supabase = getBrowserSupabase();
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name
                    }
                }
            });

            if (error) throw error;
            setInfo('Check your email for the confirmation link.');
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
        <div className="flex min-h-screen flex-col items-center justify-center py-2 bg-white">
            <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-xl border border-gray-200">
                <div>
                    <h1 className="text-center text-3xl font-bold text-black">Sign Up</h1>
                </div>
                
                {error && (
                    <div className="rounded-md bg-red-50 p-4">
                        <div className="text-sm text-red-700">{error}</div>
                    </div>
                )}
                
                {info && (
                    <div className="rounded-md bg-blue-50 p-4">
                        <div className="text-sm text-blue-700">{info}</div>
                    </div>
                )}
                
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-5 rounded-md">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input 
                                id="name" 
                                name="name" 
                                type="text" 
                                required 
                                className="block w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 shadow-sm focus:border-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-800 transition-all" 
                                placeholder="Enter your full name"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                            <input 
                                id="email" 
                                name="email" 
                                type="email" 
                                required 
                                className="block w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 shadow-sm focus:border-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-800 transition-all" 
                                placeholder="Enter your email"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input 
                                id="password" 
                                name="password" 
                                type="password" 
                                required 
                                className="block w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 shadow-sm focus:border-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-800 transition-all" 
                                placeholder="Create a password"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                            <input 
                                id="confirm-password" 
                                name="confirm" 
                                type="password" 
                                required 
                                className="block w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 shadow-sm focus:border-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-800 transition-all" 
                                placeholder="Confirm your password"
                            />
                        </div>
                    </div>
                    
                    <div className="mt-6">
                        <button 
                            type="submit" 
                            disabled={loading} 
                            className="group relative flex w-full justify-center rounded-md border border-transparent bg-black px-4 py-3 text-base font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                        >
                            {loading ? 'Loading...' : 'Sign up'}
                        </button>
                    </div>
                </form>
                
                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-white px-4 text-gray-600 font-medium">Or continue with</span>
                        </div>
                    </div>
                    
                    <div className="mt-6">
                        <GoogleButton />
                    </div>
                </div>
                
                <div className="mt-6 text-center text-sm">
                    <span>Already have an account? </span>
                    <Link href="/Login" className="font-medium text-black hover:text-gray-700">
                        Log in
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;
