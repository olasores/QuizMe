import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerClient } from '@/lib/supabase/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const supabase = createServerClient();
    
    // Get total quizzes count
    const { count: quizCount, error: quizError } = await supabase
      .from('quizzes')
      .select('*', { count: 'exact', head: true });
    
    // Get completed activities for average score
    const { data: activities, error: activityError } = await supabase
      .from('activities')
      .select('score')
      .eq('activity_type', 'quiz_completed')
      .not('score', 'is', null);
    
    // Get unique topics
    const { data: topics, error: topicError } = await supabase
      .from('quizzes')
      .select('topic')
      .not('topic', 'is', null);
    
    const uniqueTopics = new Set(topics?.map(t => t.topic).filter(Boolean));
    
    // Calculate average score
    let avgScore = 0;
    if (activities && activities.length > 0) {
      const totalScore = activities.reduce((sum, activity) => {
        return sum + (activity.score || 0);
      }, 0);
      avgScore = Math.round(totalScore / activities.length);
    }
    
    // Return simple stats
    return res.status(200).json({
      quiz_count: quizCount,
      quiz_count_type: typeof quizCount,
      average_score: avgScore,
      topics_count: uniqueTopics.size,
      raw_data: {
        quizzes: { count: quizCount, error: quizError },
        activities: { count: activities?.length, error: activityError },
        topics: { count: uniqueTopics.size, error: topicError }
      }
    });
  } catch (error) {
    console.error('Error in debug stats:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}