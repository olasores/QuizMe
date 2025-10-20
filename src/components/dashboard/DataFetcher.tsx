"use client";
import { useEffect, useState } from 'react';
import { UserStats, Quiz, RecentActivity as RecentActivityType } from '@/types/database';

interface DataFetcherProps {
  children: (props: {
    stats: UserStats;
    quizzes: Quiz[];
    activities: RecentActivityType[];
    loading: boolean;
  }) => React.ReactNode;
  userId?: string;
}

export function DataFetcher({ children, userId }: DataFetcherProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats>({
    total_quizzes: 0,
    average_score: 0,
    streak_days: 0,
    topics_count: 0
  });
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activities, setActivities] = useState<RecentActivityType[]>([]);
  // No manual refresh functionality needed

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Add timestamp to prevent caching
        const timestamp = new Date().getTime();
        const response = await fetch(
          `/api/user/dashboard?userId=${userId || ''}&_t=${timestamp}`,
          { cache: 'no-store', headers: { 'pragma': 'no-cache', 'cache-control': 'no-cache' } }
        );

        if (response.ok) {
          const data = await response.json();
          
          // Process stats with explicit number conversions
          if (data.stats) {
            setStats({
              total_quizzes: Number(data.stats.total_quizzes || 0),
              average_score: Number(data.stats.average_score || 0),
              streak_days: Number(data.stats.streak_days || 0),
              topics_count: Number(data.stats.topics_count || 0)
            });
          }
          
          // Set quizzes and activities
          if (data.quizzes) setQuizzes(data.quizzes);
          if (data.activities) setActivities(data.activities);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userId]); // Re-fetch when userId changes

  // Pass data to children
  return <>{children({ stats, quizzes, activities, loading })}</>;
}