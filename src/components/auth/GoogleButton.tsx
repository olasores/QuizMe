"use client";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { useState } from "react";

interface GoogleButtonProps {
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  redirectPath?: string;
}

const sizeClasses = {
  sm: "py-2 px-4 text-sm",
  md: "py-3 px-6 text-base",
  lg: "py-3.5 px-8 text-lg",
};

export function GoogleButton({
  label = "Continue with Google",
  size = "md",
  className = "",
  redirectPath = "/",
}: GoogleButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
  const supabase = getBrowserSupabase();
  const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}${redirectPath}`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
      if (error) throw error;
      // Supabase will redirect; no further action here
      return data;
    } catch (e: unknown) {
      const message = (() => {
        if (typeof e === 'string') return e;
        if (e && typeof e === 'object' && 'message' in e) {
          const m = (e as { message?: unknown }).message;
          if (typeof m === 'string') return m;
        }
        return undefined;
      })();
      setError(message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <button
        type="button"
        disabled={loading}
        onClick={handleGoogle}
        className={`w-full border border-black rounded-xl bg-white hover:bg-gray-50 text-black font-medium flex items-center justify-center gap-3 shadow-sm transition ${sizeClasses[size]} disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      >
        {loading ? (
          <span className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5"
            aria-hidden="true"
          >
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.78-.07-1.53-.2-2.27H12v4.29h6.46c-.28 1.46-1.12 2.7-2.38 3.53v2.94h3.84c2.25-2.07 3.57-5.12 3.57-8.49z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.07 7.93-2.9l-3.84-2.94c-1.07.72-2.45 1.15-4.09 1.15-3.14 0-5.8-2.12-6.75-4.98H1.28v3.07C3.25 21.3 7.31 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.25 14.33c-.24-.72-.38-1.49-.38-2.33s.14-1.61.38-2.33V6.6H1.28A11.96 11.96 0 0 0 0 12c0 1.9.45 3.69 1.28 5.4l3.97-3.07z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.76 0 3.33.6 4.57 1.78l3.43-3.43C17.95 1.15 15.24 0 12 0 7.31 0 3.25 2.7 1.28 6.6l3.97 3.07C6.2 6.87 8.86 4.75 12 4.75z"
            />
          </svg>
        )}
        <span>{loading ? 'Redirecting…' : label}</span>
      </button>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
