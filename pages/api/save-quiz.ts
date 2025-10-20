import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerClient } from '@/lib/supabase/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { quiz, questions } = req.body;
    
    // Validate required fields
    if (!quiz || !quiz.title || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'Invalid quiz data' });
    }

    // Get Supabase client
    const supabase = createServerClient();
    
    // Insert quiz directly into database
    const { data: savedQuiz, error: quizError } = await supabase
      .from('quizzes')
      .insert({
        title: quiz.title,
        description: quiz.description,
        user_id: quiz.user_id,
        questions_count: questions.length,
        topic: quiz.topic,
        source_type: quiz.source_type || 'text',
        source_name: quiz.source_name
      })
      .select('*')
      .single();
    
    if (quizError || !savedQuiz) {
      console.error('Error saving quiz:', quizError);
      return res.status(500).json({ error: 'Failed to save quiz' });
    }
    
    // Save questions directly
    const questionsWithQuizId = questions.map((q: {
      question: string;
      options: string[];
      correctAnswer: number;
    }, index: number) => ({
      quiz_id: savedQuiz.id,
      text: q.question,
      options: q.options,
      correct_option_id: q.correctAnswer,
      order: index
    }));
    
    const { error: questionsError } = await supabase
      .from('questions')
      .insert(questionsWithQuizId)
      .select('*');
    
    if (questionsError) {
      console.error('Error saving questions:', questionsError);
      return res.status(500).json({ error: 'Failed to save questions' });
    }
    
    // Create activity record
    await supabase.from('activities').insert({
      user_id: quiz.user_id,
      activity_type: 'quiz_created',
      quiz_id: savedQuiz.id,
      quiz_title: savedQuiz.title
    });
    
    return res.status(200).json({ 
      success: true, 
      quiz: savedQuiz,
      id: savedQuiz.id
    });
  } catch (error) {
    console.error('Error saving quiz:', error);
    return res.status(500).json({ error: 'Failed to save quiz' });
  }
}