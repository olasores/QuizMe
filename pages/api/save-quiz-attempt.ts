import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerClient } from '@/lib/supabase/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const attemptData = req.body;
    
    // Validate required fields
    if (!attemptData.quiz_id) {
      return res.status(400).json({ error: 'Quiz ID is required' });
    }
    
    if (attemptData.score === undefined || attemptData.max_score === undefined) {
      return res.status(400).json({ error: 'Score and max_score are required' });
    }

    // Get Supabase client
    const supabase = createServerClient();
    
    // Save the quiz attempt directly to database
    const { data: savedAttempt, error } = await supabase
      .from('quiz_attempts')
      .insert({
        quiz_id: attemptData.quiz_id,
        user_id: attemptData.user_id,
        completed_at: attemptData.completed_at || new Date().toISOString(),
        score: attemptData.score,
        max_score: attemptData.max_score,
        answers: attemptData.answers || []
      })
      .select('*')
      .single();
    
    if (error) {
      console.error('Database error saving quiz attempt:', error);
      return res.status(500).json({ error: 'Failed to save quiz attempt' });
    }
    
    // Create activity record for completed quiz
    if (savedAttempt) {
      // Get quiz title first
      const { data: quiz } = await supabase
        .from('quizzes')
        .select('title')
        .eq('id', attemptData.quiz_id)
        .single();
      
      // Calculate percentage score correctly
      const percentageScore = attemptData.max_score > 0 
        ? Math.round((attemptData.score / attemptData.max_score) * 100) 
        : 0;
        
      // Insert activity
      await supabase.from('activities').insert({
        user_id: attemptData.user_id,
        activity_type: 'quiz_completed',
        quiz_id: attemptData.quiz_id,
        quiz_title: quiz?.title,
        score: percentageScore
      });
    }
    
    return res.status(200).json({ success: true, attempt: savedAttempt });
  } catch (error) {
    console.error('Error saving quiz attempt:', error);
    return res.status(500).json({ error: 'Failed to save quiz attempt' });
  }
}