/**
 * Database schema types for the Quizzy application
 */

// Quiz related types
export interface Quiz {
  id: string;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
  user_id?: string;
  questions_count: number;
  topic?: string;
  source_type: 'text' | 'document' | 'url';
  source_name?: string;
}

export interface Question {
  id: string;
  quiz_id: string;
  text: string;
  options: QuestionOption[];
  correct_option_id: string;
  order: number;
}

export interface QuestionOption {
  id: string;
  text: string;
}

// User quiz attempt related types
export interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id?: string;
  started_at: string;
  completed_at?: string;
  score?: number;
  max_score: number;
  answers: QuizAnswer[];
}

export interface QuizAnswer {
  question_id: string;
  selected_option_id: string;
  is_correct: boolean;
}

// User dashboard related types
export interface UserStats {
  total_quizzes: number;
  average_score: number;
  streak_days: number;
  topics_count: number;
}

export interface RecentActivity {
  id: string;
  user_id?: string;
  activity_type: 'quiz_created' | 'quiz_completed' | 'quiz_started';
  quiz_id?: string;
  quiz_title?: string;
  score?: number;
  created_at: string;
}
