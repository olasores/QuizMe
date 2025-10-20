"use client";
import { useState, useEffect } from 'react';
import { RecentActivity as RecentActivityType } from '@/types/database';

interface RecentActivityProps {
  initialActivities?: RecentActivityType[];
  userId?: string;
}

export function RecentActivity({ initialActivities = [], userId }: RecentActivityProps) {
  const [activities, setActivities] = useState<RecentActivityType[]>(initialActivities);
  // Loading state handled by parent component
  const setIsLoading = useState(!initialActivities.length)[1];

  useEffect(() => {
    // If we have initial activities, use them
    if (initialActivities.length) {
      setActivities(initialActivities);
      return;
    }
    
    // Otherwise, fetch activities from API
    const fetchActivities = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/user/activities?userId=${userId || ''}`);
        const data = await response.json();
        
        if (response.ok) {
          setActivities(data.activities || []);
        }
      } catch (error) {
        console.error('Failed to fetch activities:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchActivities();
  }, [initialActivities, userId, setIsLoading]);
  
  // Format activities for display
  const formatActivity = (activity: RecentActivityType) => {
    switch (activity.activity_type) {
      case 'quiz_created':
        return `Created "${activity.quiz_title || 'Untitled Quiz'}"`;
      case 'quiz_completed':
        // Make sure score is displayed as a whole number
        const scorePercentage = typeof activity.score === 'number' ? Math.round(activity.score) : 0;
        return `Scored ${scorePercentage}% on "${activity.quiz_title || 'Untitled Quiz'}"`;
      case 'quiz_started':
        return `Started "${activity.quiz_title || 'Untitled Quiz'}"`;
      default:
        return `Activity with "${activity.quiz_title || 'Untitled Quiz'}"`;
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
  };
  
  // Generate items from activities
  const items = activities.map(activity => ({
    text: formatActivity(activity),
    date: formatDate(activity.created_at)
  }));
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm flex flex-col">
      <h3 className="text-sm font-semibold tracking-wide uppercase text-neutral-600 mb-4">Recent Activity</h3>
      <ul className="flex-1 space-y-3 text-xs sm:text-sm">
        {items.map((item,i)=> (
          <li key={i} className="flex gap-2 items-start">
            <span className="mt-1 h-2 w-2 rounded-full bg-neutral-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-neutral-700">{item.text}</p>
              <p className="text-[10px] text-neutral-400 mt-0.5">{item.date}</p>
            </div>
          </li>
        ))}
      </ul>
      <button className="mt-4 text-xs underline text-neutral-500 hover:text-black self-start">View all</button>
    </div>
  );
}
