"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase/client";

const ResetPassword = () => {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        // Check if user is coming from reset link
        const hash = window.location.hash;
        if (!hash.includes("type=recovery")) {
            setError("Invalid or expired reset link. Please request a new one.");
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        try {
            const supabase = getBrowserSupabase();

            // Update password
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            setSuccess(true);
            setPassword("");
            setConfirmPassword("");

            // Redirect to login after 2 seconds
            setTimeout(() => {
                router.push("/Login");
            }, 2000);
        } catch (err: unknown) {
            let msg = "Failed to reset password";
            if (err && typeof err === "object" && "message" in err) {
                const m = (err as { message?: unknown }).message;
                if (typeof m === "string") msg = m;
            }
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-white via-gray-100 to-gray-300 px-4 py-10">
            <div className="w-full max-w-md bg-white border border-black rounded-3xl shadow-xl p-8 sm:p-10 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none opacity-[0.04] bg-[radial-gradient(circle_at_1px_1px,#000_1px,transparent_0)] [background-size:12px_12px]"></div>
                <h1 className="relative text-3xl font-extrabold text-black mb-2 tracking-tight text-center">Reset Password</h1>
                <p className="relative text-center text-gray-600 mb-8 text-sm">Enter your new password below</p>

                {success ? (
                    <div className="relative text-center">
                        <div className="mb-4 text-green-600">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-green-600 font-semibold mb-2">Password reset successfully!</p>
                        <p className="text-gray-600 text-sm">Redirecting to login...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="relative flex flex-col gap-5">
                        <div className="flex flex-col gap-1">
                            <label htmlFor="password" className="text-sm font-medium text-black">New Password</label>
                            <input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="border border-black/70 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-black shadow-sm placeholder:text-gray-400"
                            />
                        </div>
                        {error && <p className="text-xs text-red-600 -mt-1">{error}</p>}
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative bg-black text-white font-semibold py-3 rounded-xl shadow hover:bg-gray-900 transition disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <span className="inline-flex items-center justify-center gap-2">
                                {loading && <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                                {loading ? "Resetting..." : "Reset Password"}
                            </span>
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
