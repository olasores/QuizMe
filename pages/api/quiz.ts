import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerClient } from '@/lib/supabase/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'Quiz ID is required' });
    }
    
    // Get Supabase client
    const supabase = createServerClient();
    
    // Get the quiz
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (quizError || !quiz) {
      console.error('Error fetching quiz:', quizError);
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    // Get the questions for this quiz
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .eq('quiz_id', id)
      .order('order', { ascending: true });
    
    if (questionsError) {
      console.error('Error fetching questions:', questionsError);
      return res.status(500).json({ error: 'Failed to fetch quiz questions' });
    }
    
    // If user is logged in, record activity
    if (req.query.userId) {
      await supabase.from('activities').insert({
        user_id: req.query.userId,
        activity_type: 'quiz_started',
        quiz_id: quiz.id,
        quiz_title: quiz.title
      });
    }
    
    return res.status(200).json({ quiz, questions: questions || [] });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return res.status(500).json({ error: 'Failed to fetch quiz' });
  }
}