"use client";
import { useEffect, useState } from 'react';
import { getBrowserSupabase } from '@/lib/supabase/client';
import Link from 'next/link';

interface UserInfo {
  id: string;
  email?: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const supabase = getBrowserSupabase();
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        if (mounted) setUser(data.user ? { id: data.user.id, email: data.user.email || undefined } : null);
      } catch (e: unknown) {
        if (mounted) setError('Failed to load user');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleSignOut = async () => {
    try {
      const supabase = getBrowserSupabase();
      await supabase.auth.signOut();
      window.location.href = '/Login';
    } catch {
      // ignore
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading dashboard…</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-sm">You are not logged in.</p>
        <div className="flex gap-3">
          <Link href="/Login" className="underline">Login</Link>
          <Link href="/Signup" className="underline">Signup</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-10 bg-gradient-to-br from-white via-gray-100 to-gray-200">
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center justify-between mb-10">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <button onClick={handleSignOut} className="text-sm underline">Sign out</button>
        </header>
        <div className="rounded-2xl border border-black/20 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Welcome</h2>
          <p className="text-sm text-gray-600 mb-4">Signed in as <span className="font-medium">{user.email || user.id}</span></p>
          <p className="text-sm text-gray-700">This is a placeholder dashboard. Add your app content here.</p>
        </div>
        {error && <p className="mt-6 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
