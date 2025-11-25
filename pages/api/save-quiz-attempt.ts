import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerClient } from '@/lib/supabase/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const attemptData = req.body;
    
    // Validate required fields
    if (attemptData.score === undefined || attemptData.max_score === undefined) {
      return res.status(400).json({ error: 'Score and max_score are required' });
    }

    // Get Supabase client
    const supabase = createServerClient();
    
    let quizId = attemptData.quiz_id;
    
    // If quiz_id is a temp ID (starts with 'temp-'), we need to create the quiz in database first
    if (quizId && quizId.startsWith('temp-')) {
      console.log('Creating quiz from temporary quiz data...');
      
      // Extract quiz data from the request (questions array)
      const { questions } = attemptData;
      
      if (!questions || questions.length === 0) {
        return res.status(400).json({ error: 'Quiz data is required for temporary quizzes' });
      }
      
      // Create a quiz in the database
      const { data: newQuiz, error: quizError } = await supabase
        .from('quizzes')
        .insert({
          title: attemptData.quiz_title || 'Untitled Quiz',
          description: attemptData.quiz_description || 'Quiz generated from trending topic',
          topic: attemptData.topic || 'General',
          source_type: attemptData.source_type || 'ai_generated',
          source_name: attemptData.source_name || 'Trending Topic Quiz',
          questions_count: questions.length,
          user_id: attemptData.user_id || null
        })
        .select()
        .single();
      
      if (quizError || !newQuiz) {
        console.error('Error creating quiz:', quizError);
        return res.status(500).json({ error: 'Failed to create quiz' });
      }
      
      quizId = newQuiz.id;
      
      // Save the questions to the database
      const questionsData = questions.map((q: { question?: string; text?: string; options?: string[]; correctAnswer?: string }, index: number) => ({
        quiz_id: newQuiz.id,
        text: q.question || q.text,
        options: q.options || [],
        correct_option_id: q.correctAnswer || 'A',
        order: index
      }));
      
      const { error: questionsError } = await supabase
        .from('questions')
        .insert(questionsData);
      
      if (questionsError) {
        console.error('Error saving questions:', questionsError);
        return res.status(500).json({ error: 'Failed to save quiz questions' });
      }
      
      console.log('Quiz created successfully with ID:', quizId);
    }
    
    if (!quizId) {
      return res.status(400).json({ error: 'Quiz ID is required' });
    }
    
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