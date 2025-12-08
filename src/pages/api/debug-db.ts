import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerClient } from '@/lib/supabase/server';

// Debug endpoint to see exactly what's in the database tables
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = createServerClient();
    const results: Record<string, unknown> = {};
    
    // Get all quizzes
    const { data: quizzes, error: quizzesError } = await supabase
      .from('quizzes')
      .select('*');
      
    results.quizzes = quizzesError ? { error: quizzesError.message } : quizzes;
    
    // Get all activities
    const { data: activities, error: activitiesError } = await supabase
      .from('activities')
      .select('*');
      
    results.activities = activitiesError ? { error: activitiesError.message } : activities;
    
    // Get all quiz attempts
    const { data: attempts, error: attemptsError } = await supabase
      .from('quiz_attempts')
      .select('*');
      
    results.attempts = attemptsError ? { error: attemptsError.message } : attempts;
    
    // Return all the data for inspection
    return res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching debug data:', error);
    return res.status(500).json({ error: 'Failed to fetch debug data' });
  }
}