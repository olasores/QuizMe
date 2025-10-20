"use client";
import { useEffect, useState } from 'react';
import { getBrowserSupabase } from '@/lib/supabase/client';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopBar } from '@/components/dashboard/TopBar';
import { StatCard } from '@/components/dashboard/StatCard';
import { TrendingTopics } from '@/components/dashboard/TrendingTopics';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { QuizLauncher } from '@/components/dashboard/QuizLauncher';
import { DataFetcher } from '@/components/dashboard/DataFetcher';
import { RecentQuizzes } from '@/components/dashboard/RecentQuizzes';

interface UserInfo {
  id: string;
  email?: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only handle authentication state
    const checkAuth = async () => {
      try {
        const supabase = getBrowserSupabase();
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        
        setUser(data.user ? { 
          id: data.user.id, 
          email: data.user.email || undefined 
        } : null);
      } catch {
        setError('Failed to load user');
      } finally {
        setAuthLoading(false);
      }
    };
    
    checkAuth();
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
        
        {/* Use DataFetcher to handle all data fetching and state management */}
        <DataFetcher userId={user?.id}>
          {({ stats, quizzes, activities, loading }) => (
            <main className="flex-1 overflow-y-auto p-5 md:p-8 space-y-8">
              {/* Stats Row */}
              <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard 
                  label="Quizzes" 
                  value={loading ? '-' : stats.total_quizzes.toString()} 
                  foot="Total generated" 
                />
                <StatCard 
                  label="Avg Score" 
                  value={loading ? '-' : `${stats.average_score}%`} 
                  foot="All attempts" 
                />
                <StatCard 
                  label="Streak" 
                  value={loading ? '-' : stats.streak_days.toString()} 
                  foot="Days active" 
                />
                <StatCard 
                  label="Topics" 
                  value={loading ? '-' : stats.topics_count.toString()} 
                  foot="Covered" 
                />
              </section>

              {/* Quiz Launcher + Trending & Activity */}
              <section className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                  {/* Quiz launcher (for generation) */}
                  <QuizLauncher />
                  
                  {/* Recent quizzes in a separate card */}
                  <RecentQuizzes quizzes={quizzes} userId={user?.id} />
                  
                  {/* Trending topics */}
                  <TrendingTopics />
                </div>
                <div className="lg:col-span-1 space-y-6">
                  <RecentActivity 
                    initialActivities={activities}
                    userId={user?.id}
                  />
                  {!user && (
                    <div className="rounded-lg border border-amber-300 bg-amber-50 text-amber-900 px-4 py-3 text-xs">
                      Log in to sync your progress.
                    </div>
                  )}
                </div>
              </section>
              
              {error && <p className="text-sm text-red-600">{error}</p>}
              
              {!authLoading && !user && (
                <p className="text-[11px] text-neutral-500">Public preview mode – authentication not required.</p>
              )}
            </main>
          )}
        </DataFetcher>
      </div>
    </div>
  );
}
