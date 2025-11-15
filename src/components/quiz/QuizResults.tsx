"use client";
import { useState, useEffect } from 'react';
import { getBrowserSupabase } from '@/lib/supabase/client';
import { QuizAnswer } from '@/types/database';

interface QuizResultsProps {
  score: number;
  total: number;
  onRetry?: () => void;
  onExit?: () => void;
  quizId?: string;
  answers?: Record<number, string>;
  questions?: Array<{
    id: string;
    correctAnswer: string;
  }>;
}

export function QuizResults({ 
  score, 
  total, 
  onRetry, 
  onExit,
  quizId,
  answers = {},
  questions = []
}: QuizResultsProps) {
  const [, setIsSaving] = useState(false); // Setter used in functions below
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const percentage = Math.round((score / total) * 100);
  
  const getGrade = () => {
    if (percentage >= 90) return { text: 'Excellent!', color: 'text-green-600' };
    if (percentage >= 80) return { text: 'Great job!', color: 'text-blue-600' };
    if (percentage >= 70) return { text: 'Good work!', color: 'text-yellow-600' };
    if (percentage >= 60) return { text: 'Keep practicing!', color: 'text-orange-600' };
    return { text: 'Try again!', color: 'text-red-600' };
  };

  const grade = getGrade();
  
  // Save quiz result to database
  useEffect(() => {
    const saveResult = async () => {
      if (!quizId || saveStatus !== 'idle') return;
      
      try {
        setIsSaving(true);
        setSaveStatus('saving');
        
        const supabase = getBrowserSupabase();
        
        // Get user if logged in
        const { data: { user } } = await supabase.auth.getUser();
        
        // Format answers for database
        const formattedAnswers = Object.entries(answers).map(([index, selectedAnswer]) => {
          const questionIndex = parseInt(index);
          const question = questions[questionIndex];
          
          if (!question) return null;
          
          return {
            question_id: question.id,
            selected_option_id: selectedAnswer,
            is_correct: selectedAnswer === question.correctAnswer
          };
        }).filter(Boolean) as QuizAnswer[];
        
        // Save attempt to database
        const response = await fetch('/api/save-quiz-attempt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quiz_id: quizId,
            user_id: user?.id,
            completed_at: new Date().toISOString(),
            score,
            max_score: total,
            answers: formattedAnswers
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to save quiz attempt');
        }
        
        const data = await response.json();
        
        // Consider it a success even if the quiz wasn't saved to database
        // (e.g., for temporary quizzes from trending topics)
        if (data.success) {
          setSaveStatus('success');
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (error) {
        console.error('Error saving quiz result:', error);
        setSaveStatus('error');
      } finally {
        setIsSaving(false);
      }
    };
    
    if (quizId) {
      saveResult();
    }
  }, [quizId, answers, questions, score, total, saveStatus]);

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm text-center">
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto rounded-full bg-neutral-100 flex items-center justify-center mb-4">
            <span className="text-4xl font-bold text-neutral-900">{percentage}%</span>
          </div>
          <h2 className={`text-2xl font-bold mb-2 ${grade.color}`}>{grade.text}</h2>
          <p className="text-neutral-600">
            You scored {score} out of {total} questions correctly
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8 p-4 bg-neutral-50 rounded-lg">
          <div>
            <p className="text-xs text-neutral-500 mb-1">Correct</p>
            <p className="text-xl font-semibold text-green-600">{score}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 mb-1">Incorrect</p>
            <p className="text-xl font-semibold text-red-600">{total - score}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 mb-1">Total</p>
            <p className="text-xl font-semibold text-neutral-900">{total}</p>
          </div>
        </div>

        {saveStatus === 'saving' && (
          <div className="mb-4 text-sm text-blue-600 flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            Saving your results...
          </div>
        )}
        
        {saveStatus === 'success' && (
          <div className="mb-4 text-sm text-green-600">
            Results saved successfully!
          </div>
        )}
        
        {saveStatus === 'error' && (
          <div className="mb-4 text-sm text-red-600">
            Failed to save results. Your progress wasn&apos;t recorded.
          </div>
        )}
        
        <div className="flex gap-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex-1 px-4 py-3 rounded-lg bg-black text-white text-sm font-medium hover:bg-neutral-800 transition"
            >
              Try Again
            </button>
          )}
          {onExit && (
            <button
              onClick={onExit}
              className="flex-1 px-4 py-3 rounded-lg border border-neutral-300 text-neutral-900 text-sm font-medium hover:bg-neutral-50 transition"
            >
              Back to Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
