import { createServerClient } from '@/lib/supabase/server';
import { Quiz, Question, QuizAttempt, RecentActivity, UserStats } from '@/types/database';

/**
 * Save a new quiz to the database
 */
export async function saveQuiz(
  quizData: Omit<Quiz, 'id' | 'created_at' | 'updated_at'>,
  questions: Array<Omit<Question, 'id' | 'quiz_id'>>
): Promise<{ quiz: Quiz; questions: Question[] } | null> {
  const supabase = createServerClient();
  
  // Start a transaction to save both quiz and questions
  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .insert({
      title: quizData.title,
      description: quizData.description,
      user_id: quizData.user_id,
      questions_count: questions.length,
      topic: quizData.topic,
      source_type: quizData.source_type,
      source_name: quizData.source_name
    })
    .select('*')
    .single();
  
  if (quizError || !quiz) {
    console.error('Error saving quiz:', quizError);
    return null;
  }
  
  // Save all questions
  const questionsWithQuizId = questions.map((question, index) => ({
    quiz_id: quiz.id,
    text: question.text,
    options: question.options,
    correct_option_id: question.correct_option_id,
    order: index
  }));
  
  const { data: savedQuestions, error: questionsError } = await supabase
    .from('questions')
    .insert(questionsWithQuizId)
    .select('*');
  
  if (questionsError) {
    console.error('Error saving questions:', questionsError);
    // In a real app, we should handle this case better (e.g., delete the quiz)
    return null;
  }
  
  // Create activity record
  await supabase.from('activities').insert({
    user_id: quizData.user_id,
    activity_type: 'quiz_created',
    quiz_id: quiz.id,
    quiz_title: quiz.title
  });
  
  return { quiz, questions: savedQuestions };
}

/**
 * Get quizzes for a specific user
 */
export async function getUserQuizzes(userId?: string): Promise<Quiz[]> {
  const supabase = createServerClient();
  
  const query = supabase
    .from('quizzes')
    .select('*')
    .order('created_at', { ascending: false });
  
  // If userId is provided, filter by user
  if (userId) {
    query.eq('user_id', userId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching quizzes:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Get a single quiz by ID, including its questions
 */
export async function getQuizById(quizId: string): Promise<{ quiz: Quiz, questions: Question[] } | null> {
  const supabase = createServerClient();
  
  // Get the quiz
  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .select('*')
    .eq('id', quizId)
    .single();
  
  if (quizError || !quiz) {
    console.error('Error fetching quiz:', quizError);
    return null;
  }
  
  // Get the questions for this quiz
  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select('*')
    .eq('quiz_id', quizId)
    .order('order', { ascending: true });
  
  if (questionsError) {
    console.error('Error fetching questions:', questionsError);
    return null;
  }
  
  return { quiz, questions: questions || [] };
}

/**
 * Save a quiz attempt
 */
export async function saveQuizAttempt(
  attemptData: Omit<QuizAttempt, 'id' | 'started_at'>
): Promise<QuizAttempt | null> {
  const supabase = createServerClient();
  
  const { data, error } = await supabase
    .from('quiz_attempts')
    .insert({
      quiz_id: attemptData.quiz_id,
      user_id: attemptData.user_id,
      completed_at: attemptData.completed_at,
      score: attemptData.score,
      max_score: attemptData.max_score,
      answers: attemptData.answers
    })
    .select('*')
    .single();
  
  if (error) {
    console.error('Error saving quiz attempt:', error);
    return null;
  }
  
  // Create activity record for completed quiz
  if (attemptData.completed_at && attemptData.score !== undefined) {
    // Get quiz title
    const { data: quiz } = await supabase
      .from('quizzes')
      .select('title')
      .eq('id', attemptData.quiz_id)
      .single();
    
    await supabase.from('activities').insert({
      user_id: attemptData.user_id,
      activity_type: 'quiz_completed',
      quiz_id: attemptData.quiz_id,
      quiz_title: quiz?.title,
      score: attemptData.score
    });
  }
  
  return data;
}

/**
 * Get recent activities for a user
 */
export async function getUserActivities(userId?: string, limit = 5): Promise<RecentActivity[]> {
  const supabase = createServerClient();
  
  const query = supabase
    .from('activities')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (userId) {
    query.eq('user_id', userId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching activities:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Get user statistics
 */
export async function getUserStats(userId?: string): Promise<UserStats> {
  const supabase = createServerClient();
  
  // Default stats
  const defaultStats: UserStats = {
    total_quizzes: 0,
    average_score: 0,
    streak_days: 0,
    topics_count: 0
  };
  
  if (!userId) {
    return defaultStats;
  }
  
  // Get total quizzes created by user
  const { count: totalQuizzes } = await supabase
    .from('quizzes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);
  
  // Get average score from completed attempts
  const { data: attempts } = await supabase
    .from('quiz_attempts')
    .select('score, max_score')
    .eq('user_id', userId)
    .not('score', 'is', null);
  
  let averageScore = 0;
  if (attempts && attempts.length > 0) {
    const totalScore = attempts.reduce((sum, attempt) => {
      if (attempt.score !== null && attempt.max_score > 0) {
        return sum + (attempt.score / attempt.max_score) * 100;
      }
      return sum;
    }, 0);
    averageScore = Math.round(totalScore / attempts.length);
  }
  
  // Get unique topics count
  const { data: topics } = await supabase
    .from('quizzes')
    .select('topic')
    .eq('user_id', userId)
    .not('topic', 'is', null);
  
  const uniqueTopics = new Set(topics?.map(t => t.topic).filter(Boolean));
  
  // Calculate streak (simplified version)
  // In a real app, this would be more complex to handle actual consecutive days
  const { data: recentActivities } = await supabase
    .from('activities')
    .select('created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(30);
  
  // Simple streak calculation (consecutive days with activity)
  let streakDays = 0;
  if (recentActivities && recentActivities.length > 0) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    // Check if there's activity today
    const hasActivityToday = recentActivities.some(activity => {
      const activityDate = new Date(activity.created_at);
      const activityDay = new Date(
        activityDate.getFullYear(), 
        activityDate.getMonth(), 
        activityDate.getDate()
      ).getTime();
      return activityDay === today;
    });
    
    streakDays = hasActivityToday ? 1 : 0;
    
    // Check previous days
    for (let i = 1; i <= 30; i++) {
      const checkDate = new Date(now);
      checkDate.setDate(now.getDate() - i);
      const checkDay = new Date(
        checkDate.getFullYear(), 
        checkDate.getMonth(), 
        checkDate.getDate()
      ).getTime();
      
      const hasActivity = recentActivities.some(activity => {
        const activityDate = new Date(activity.created_at);
        const activityDay = new Date(
          activityDate.getFullYear(), 
          activityDate.getMonth(), 
          activityDate.getDate()
        ).getTime();
        return activityDay === checkDay;
      });
      
      if (hasActivity && (streakDays > 0 || hasActivityToday)) {
        streakDays++;
      } else if (!hasActivityToday && i === 1 && hasActivity) {
        streakDays = 1; // Start streak if yesterday had activity but not today
      } else if (streakDays > 0 || (!hasActivityToday && streakDays === 0)) {
        break; // Break streak
      }
    }
  }
  
  return {
    total_quizzes: totalQuizzes || 0,
    average_score: averageScore,
    streak_days: streakDays,
    topics_count: uniqueTopics.size,
  };
}