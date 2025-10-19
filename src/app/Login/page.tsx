"use client";

import Link from "next/link";
import { useState } from "react";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { getBrowserSupabase } from "@/lib/supabase/client";

const Login = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        
        const form = e.target as HTMLFormElement;
        const email = (form.querySelector('#email') as HTMLInputElement).value;
        const password = (form.querySelector('#password') as HTMLInputElement).value;
        
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }
        
        setLoading(true);
        
        try {
            const supabase = getBrowserSupabase();
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) throw error;
            window.location.href = '/dashboard';
        } catch (err: unknown) {
            let msg = 'Login failed';
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
                    <h1 className="text-center text-3xl font-bold text-black">Login</h1>
                </div>
                
                {error && (
                    <div className="rounded-md bg-red-50 p-4">
                        <div className="text-sm text-red-700">{error}</div>
                    </div>
                )}
                
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-5 rounded-md">
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
                                placeholder="Enter your password"
                            />
                        </div>
                    </div>
                    
                    <div className="mt-6">
                        <button 
                            type="submit" 
                            disabled={loading} 
                            className="group relative flex w-full justify-center rounded-md border border-transparent bg-black px-4 py-3 text-base font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                        >
                            {loading ? 'Loading...' : 'Log in'}
                        </button>
                    </div>
                </form>
                
                <div className="mt-8">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-white px-4 text-gray-600 font-medium">Or continue with</span>
                        </div>
                    </div>
                    
                    <div className="mt-6 flex justify-center">
                        <GoogleButton />
                    </div>
                </div>
                
                                <div className="mt-6 text-center text-sm">
                    <span>Don&apos;t have an account? </span>
                    <Link href="/Signup" className="font-medium text-black hover:text-gray-700">
                        Sign up
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
