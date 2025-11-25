"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getBrowserSupabase } from '@/lib/supabase/client';

interface Activity {
  id: string;
  activity_type: string;
  quiz_title: string;
  score: number;
  created_at: string;
}

export default function ActivityPage() {
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'quiz_created' | 'quiz_completed'>('all');

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const supabase = getBrowserSupabase();
        const { data: { user } } = await supabase.auth.getUser();

        let query = supabase
          .from('activities')
          .select('id, activity_type, quiz_title, score, created_at')
          .order('created_at', { ascending: false });

        // Filter by user if logged in
        if (user) {
          query = query.or(`user_id.eq.${user.id},user_id.is.null`);
        } else {
          query = query.is('user_id', null);
        }

        // Apply activity type filter
        if (filter !== 'all') {
          query = query.eq('activity_type', filter);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching activities:', error);
        } else {
          setActivities(data || []);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [filter]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'quiz_created':
        return '✏️';
      case 'quiz_completed':
        return '✓';
      default:
        return '•';
    }
  };

  const getActivityDescription = (activity: Activity) => {
    if (activity.activity_type === 'quiz_created') {
      return `Created quiz "${activity.quiz_title}"`;
    } else if (activity.activity_type === 'quiz_completed') {
      return `Scored ${activity.score}% on "${activity.quiz_title}"`;
    }
    return activity.quiz_title;
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="border-b border-neutral-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-3 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition font-medium"
            title="Go back"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-neutral-900">Activity</h1>
        </div>
        <p className="text-sm text-neutral-500 mt-1">Your recent quiz activity</p>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Filter Buttons */}
          <div className="mb-6 flex gap-2">
            {(['all', 'quiz_created', 'quiz_completed'] as const).map(filterType => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === filterType
                    ? 'bg-black text-white'
                    : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                }`}
              >
                {filterType === 'all' ? 'All' : filterType === 'quiz_created' ? 'Created' : 'Completed'}
              </button>
            ))}
          </div>

          {/* Activities List */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-neutral-600">Loading activity...</p>
              </div>
            </div>
          ) : activities.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <p className="text-neutral-600">No activity yet</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 max-w-2xl">
              {activities.map(activity => (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 bg-white p-4 rounded-lg border border-neutral-200 hover:shadow-sm transition"
                >
                  <div className="text-2xl">{getActivityIcon(activity.activity_type)}</div>
                  <div className="flex-1">
                    <p className="font-medium text-neutral-900">
                      {getActivityDescription(activity)}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {formatDate(activity.created_at)}
                    </p>
                  </div>
                  {activity.activity_type === 'quiz_completed' && activity.score && (
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        activity.score >= 70 ? 'text-green-600' :
                        activity.score >= 50 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {activity.score}%
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
