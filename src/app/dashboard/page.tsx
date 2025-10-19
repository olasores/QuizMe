"use client";
import { useEffect, useState } from 'react';
import { getBrowserSupabase } from '@/lib/supabase/client';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopBar } from '@/components/dashboard/TopBar';
import { StatCard } from '@/components/dashboard/StatCard';
import { TrendingTopics } from '@/components/dashboard/TrendingTopics';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { QuizLauncher } from '@/components/dashboard/QuizLauncher';

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
      } catch {
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
      window.location.href = '/login';
    } catch {
      // ignore
    }
  };

  return (
    <div className="h-screen w-full flex bg-neutral-100 text-neutral-900">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar userEmail={user?.email} onSignOut={handleSignOut} />
        <main className="flex-1 overflow-y-auto p-5 md:p-8 space-y-8">
          {/* Stats Row */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Quizzes" value={8} foot="Total generated" />
            <StatCard label="Avg Score" value="82%" foot="Last 10" />
            <StatCard label="Streak" value={3} foot="Days active" />
            <StatCard label="Topics" value={12} foot="Followed" />
          </section>

          {/* Quiz Launcher + Trending & Activity */}
          <section className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <QuizLauncher />
              <TrendingTopics />
            </div>
            <div className="lg:col-span-1 space-y-6">
              <RecentActivity />
              {!user && (
                <div className="rounded-lg border border-amber-300 bg-amber-50 text-amber-900 px-4 py-3 text-xs">Log in to sync your progress.</div>
              )}
            </div>
          </section>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {!loading && !user && (
            <p className="text-[11px] text-neutral-500">Public preview mode – authentication not required.</p>
          )}
        </main>
      </div>
    </div>
  );
}
