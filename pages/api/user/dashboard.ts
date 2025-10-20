import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerClient } from '@/lib/supabase/server';
import { UserStats } from '@/types/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Set cache control headers to prevent caching
  res.setHeader('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  try {
    const { userId, debug } = req.query;
    const supabase = createServerClient();
    
    const enableDebug = debug === 'true';
    
    // Default stats
    const stats: UserStats = {
      total_quizzes: 0,
      average_score: 0,
      streak_days: 0,
      topics_count: 0
    };
    
    if (enableDebug) {
      console.log('Dashboard API called with:', { userId, debug });
    }
    
    // Determine if we're getting data for a specific user or public data
    const isUserSpecific = userId && userId !== '';
    const userIdFilter = isUserSpecific ? userId : null;
    
    // Get total quizzes - DON'T filter by user_id for anonymous mode to show all quizzes
    try {
      // In anonymous mode, we'll show all quizzes in the system
      let query = supabase.from('quizzes').select('*', { count: 'exact', head: true });
      
      // Only filter by user if we're in user-specific mode
      if (isUserSpecific) {
        query = query.eq('user_id', userIdFilter);
      }
      
      const { count, error } = await query;
      console.log('Quiz count result:', { count, error, userIdFilter, isUserSpecific });
      
      if (!error && count !== null) {
        // Make sure we're setting a number, not a string or null
        stats.total_quizzes = typeof count === 'number' ? count : 0;
        
        // Force log the value to verify
        console.log('Setting total_quizzes to:', stats.total_quizzes, 'from count:', count);
      }
    } catch (error) {
      console.error('Error fetching quiz count:', error);
    }
    
    // Get average score from completed attempts
    try {
      // For quiz attempts, use the activity records instead since they have the percentage scores
      let query = supabase
        .from('activities')
        .select('score')
        .eq('activity_type', 'quiz_completed')
        .not('score', 'is', null);
      
      // Only filter by user if we're in user-specific mode
      if (isUserSpecific) {
        query = query.eq('user_id', userIdFilter);
      }
      
      const { data: activities, error } = await query;
        
      if (!error && activities && activities.length > 0) {
        // Calculate average of percentage scores directly
        const totalScore = activities.reduce((sum, activity) => {
          return sum + (activity.score || 0);
        }, 0);
        stats.average_score = Math.round(totalScore / activities.length);
      }
    } catch (error) {
      console.error('Error fetching quiz attempts:', error);
    }
    
    // Get unique topics count
    try {
      let query = supabase
        .from('quizzes')
        .select('topic')
        .not('topic', 'is', null);
        
      // Only filter by user if we're in user-specific mode
      if (isUserSpecific) {
        query = query.eq('user_id', userIdFilter);
      }
      
      const { data: topics, error } = await query;
        
      if (!error && topics) {
        const uniqueTopics = new Set(topics.map(t => t.topic).filter(Boolean));
        stats.topics_count = uniqueTopics.size;
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
    
    // Calculate streak (simple version)
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      
      const { data: recentActivities, error } = await supabase
        .from('activities')
        .select('created_at')
        .eq('user_id', userIdFilter)
        .order('created_at', { ascending: false })
        .limit(30);
        
      if (!error && recentActivities && recentActivities.length > 0) {
        // Check if there's activity today
        const hasActivityToday = recentActivities.some(activity => {
          const activityDate = new Date(activity.created_at);
          return new Date(
            activityDate.getFullYear(), 
            activityDate.getMonth(), 
            activityDate.getDate()
          ).getTime() === today;
        });
        
        stats.streak_days = hasActivityToday ? 1 : 0;
      }
    } catch (error) {
      console.error('Error calculating streak:', error);
    }
    
    // Fetch user quizzes
    let quizzes: { id: string; title: string; user_id: string; created_at: string }[] = [];
    try {
      let query = supabase
        .from('quizzes')
        .select('*')
        .order('created_at', { ascending: false });
        
      // Only filter by user if we're in user-specific mode
      if (isUserSpecific) {
        query = query.eq('user_id', userIdFilter);
      }
      
      const { data, error } = await query;
        
      if (!error && data) {
        quizzes = data;
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    }
    
    // Fetch user activities
    let activities: { id: string; quiz_id: string; score: number; user_id: string; created_at: string }[] = [];
    try {
      let query = supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
        
      // Only filter by user if we're in user-specific mode
      if (isUserSpecific) {
        query = query.eq('user_id', userIdFilter);
      }
      
      const { data, error } = await query;
        
      if (!error && data) {
        activities = data;
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
    
    return res.status(200).json({
      stats,
      quizzes,
      activities
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch dashboard data',
      stats: { total_quizzes: 0, average_score: 0, streak_days: 0, topics_count: 0 },
      quizzes: [],
      activities: []
    });
  }
}