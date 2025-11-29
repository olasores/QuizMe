"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getBrowserSupabase } from '@/lib/supabase/client';

interface Quiz {
  id: string;
  title: string;
  description: string;
  topic: string;
  questions_count: number;
  created_at: string;
  source_type: string;
}

interface QuizAnswerRecord {
  question_id?: string;
  questionId?: string;
  selected_option_id?: string;
  selectedOptionId?: string;
  is_correct?: boolean;
  isCorrect?: boolean;
}

interface QuizAttempt {
  id: string;
  score: number;
  max_score: number;
  completed_at: string;
  user_id?: string | null;
  answers: QuizAnswerRecord[] | Record<string, QuizAnswerRecord> | string | null;
}

interface QuizAttemptResult extends Omit<QuizAttempt, 'answers'> {
  answers: QuizAnswerRecord[];
}

interface Question {
  id: string;
  text: string;
  options: Array<{ id: string; text: string }>;
  correct_option_id: string;
}

export default function QuizzesPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'ai_generated' | 'text' | 'document'>('all');
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [quizResults, setQuizResults] = useState<{ attempt: QuizAttemptResult; questions: Question[] } | null>(null);
  const [resultsLoading, setResultsLoading] = useState(false);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const supabase = getBrowserSupabase();
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        if (!user) {
          setQuizzes([]);
          return;
        }

        let query = supabase
          .from('quizzes')
          .select('id, title, description, topic, questions_count, created_at, source_type')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        // Apply source type filter
        if (filter !== 'all') {
          query = query.eq('source_type', filter);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching quizzes:', error);
        } else {
          setQuizzes(data || []);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [filter]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getSourceBadgeColor = (sourceType: string) => {
    switch (sourceType) {
      case 'ai_generated':
        return 'bg-purple-100 text-purple-700';
      case 'text':
        return 'bg-blue-100 text-blue-700';
      case 'document':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const normalizeAnswers = (rawAnswers: QuizAttempt['answers']): QuizAnswerRecord[] => {
    if (!rawAnswers) return [];
    if (Array.isArray(rawAnswers)) return rawAnswers;
    if (typeof rawAnswers === 'string') {
      try {
        const parsed = JSON.parse(rawAnswers);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    if (typeof rawAnswers === 'object') {
      const entries = Object.entries(rawAnswers as Record<string, QuizAnswerRecord>);
      return entries.map(([key, value]) => ({
        question_id: key,
        questionId: key,
        ...value
      }));
    }
    return [];
  };

  const handleViewResults = async (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setResultsLoading(true);
    setShowResultsModal(true);

    try {
      const supabase = getBrowserSupabase();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      if (!user) {
        setQuizResults(null);
        return;
      }

      // Fetch the most recent quiz attempt (include legacy attempts without user_id)
      const { data: attempts, error: attemptsError } = await supabase
        .from('quiz_attempts')
        .select('id, score, max_score, completed_at, answers, user_id')
        .eq('quiz_id', quiz.id)
        .or(`user_id.eq.${user.id},user_id.is.null`)
        .order('completed_at', { ascending: false })
        .limit(1);

      if (attemptsError) throw attemptsError;

      if (!attempts || attempts.length === 0) {
        setQuizResults(null);
        setResultsLoading(false);
        return;
      }

      console.log('Fetched attempt:', attempts[0]);
      console.log('Answers structure:', attempts[0].answers);

      console.log('Fetched attempt:', attempts[0]);
      console.log('Answers structure:', attempts[0].answers);

      // Fetch the questions
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('id, text, options, correct_option_id')
        .eq('quiz_id', quiz.id)
        .order('order', { ascending: true });

      if (questionsError) throw questionsError;

      const normalizedAttempt: QuizAttemptResult = {
        ...attempts[0],
        answers: normalizeAnswers(attempts[0].answers)
      };

      console.log('Normalized answers for quiz attempt:', normalizedAttempt.answers);

      setQuizResults({
        attempt: normalizedAttempt,
        questions: questions || [],
      });
    } catch (error) {
      console.error('Error fetching quiz results:', error);
    } finally {
      setResultsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="border-b border-neutral-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-3 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition font-medium"
            title="Go back"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-neutral-900">My Quizzes</h1>
        </div>
        <p className="text-sm text-neutral-500 mt-1">Review and retake your previous quizzes</p>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Filter Buttons */}
          <div className="mb-6 flex gap-2 flex-wrap">
            {(['all', 'ai_generated', 'text', 'document'] as const).map(filterType => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === filterType
                    ? 'bg-black text-white'
                    : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                }`}
              >
                {filterType === 'all' ? 'All' : filterType === 'ai_generated' ? 'AI Generated' : filterType === 'text' ? 'Text' : 'Document'}
              </button>
            ))}
          </div>

          {/* Quizzes Grid */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-neutral-600">Loading quizzes...</p>
              </div>
            </div>
          ) : quizzes.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <p className="text-neutral-600 mb-4">No quizzes found</p>
                <Link href="/generate-quiz" className="text-blue-600 hover:underline">
                  Create your first quiz
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quizzes.map(quiz => (
                <div
                  key={quiz.id}
                  className="bg-white rounded-lg border border-neutral-200 p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-neutral-900 flex-1 line-clamp-2">{quiz.title}</h3>
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getSourceBadgeColor(quiz.source_type)}`}>
                      {quiz.source_type === 'ai_generated' ? 'AI' : quiz.source_type === 'text' ? 'Text' : 'Doc'}
                    </span>
                  </div>

                  {quiz.description && (
                    <p className="text-sm text-neutral-600 mb-3 line-clamp-2">{quiz.description}</p>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    {quiz.topic && (
                      <span className="text-xs bg-neutral-100 text-neutral-700 px-2 py-1 rounded">
                        {quiz.topic}
                      </span>
                    )}
                    <span className="text-xs text-neutral-500">
                      {quiz.questions_count} questions
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-neutral-500 mb-4">
                    <span>{formatDate(quiz.created_at)}</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewResults(quiz)}
                      className="flex-1 px-4 py-2 rounded-lg bg-neutral-200 text-neutral-900 text-sm font-medium hover:bg-neutral-300 transition"
                    >
                      View Results
                    </button>
                    <Link
                      href={`/quiz?id=${quiz.id}`}
                      className="flex-1 text-center px-4 py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-neutral-800 transition"
                    >
                      Retake
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results Modal */}
      {showResultsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl max-h-[90vh] overflow-y-auto w-full">
            <div className="sticky top-0 bg-white border-b border-neutral-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-neutral-900">{selectedQuiz?.title}</h2>
              <button
                onClick={() => {
                  setShowResultsModal(false);
                  setSelectedQuiz(null);
                  setQuizResults(null);
                }}
                className="text-neutral-500 hover:text-neutral-900 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {resultsLoading ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-neutral-600">Loading results...</p>
                </div>
              ) : quizResults ? (
                <>
                  {/* Score Summary */}
                  <div className="bg-neutral-50 rounded-lg p-6 mb-6">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-neutral-900 mb-2">
                        {Math.round((quizResults.attempt.score / quizResults.attempt.max_score) * 100)}%
                      </div>
                      <p className="text-neutral-600">
                        You scored <strong>{quizResults.attempt.score} out of {quizResults.attempt.max_score}</strong>
                      </p>
                      <p className="text-sm text-neutral-500 mt-2">
                        Completed on {new Date(quizResults.attempt.completed_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Questions Review */}
                  <div className="space-y-6">
                    <h3 className="font-bold text-lg text-neutral-900">Questions Review</h3>
                    {quizResults.questions.map((question, index) => {
                      let userAnswer = quizResults.attempt.answers.find(
                        (a) => (a.question_id || a.questionId) === question.id
                      );
                      
                      if (!userAnswer && quizResults.attempt.answers[index]) {
                        const fallback = quizResults.attempt.answers[index];
                        userAnswer = {
                          ...fallback,
                          question_id: fallback.question_id || fallback.questionId || question.id,
                          questionId: fallback.questionId || fallback.question_id || question.id
                        };
                      }
                      
                      const selectedOptionId = userAnswer?.selected_option_id || userAnswer?.selectedOptionId;
                      const recordedCorrectness = typeof userAnswer?.is_correct === 'boolean'
                        ? userAnswer.is_correct
                        : typeof userAnswer?.isCorrect === 'boolean'
                          ? userAnswer.isCorrect
                          : undefined;
                      const isCorrect = recordedCorrectness ?? (selectedOptionId === question.correct_option_id);
                      const selectedOption = (question.options as Array<{id: string; text: string}>).find(
                        opt => opt.id === selectedOptionId
                      );
                      const correctOption = (question.options as Array<{id: string; text: string}>).find(
                        opt => opt.id === question.correct_option_id
                      );
                      const selectedText = selectedOption?.text || (selectedOptionId ? `Option ${selectedOptionId}` : 'No answer selected');
                      const correctText = correctOption?.text || 'Not available';

                      return (
                        <div
                          key={question.id}
                          className={`border-l-4 pl-4 py-4 ${isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <span className={`text-lg font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                              {isCorrect ? '✓' : '✗'}
                            </span>
                            <div className="flex-1">
                              <p className="font-medium text-neutral-900">
                                Question {index + 1}: {question.text}
                              </p>
                            </div>
                          </div>

                          <div className="ml-8 space-y-2 text-sm">
                            <p className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                              Your answer: <strong>{selectedText}</strong>
                            </p>
                            <p className="text-green-700">
                              Correct answer: <strong>{correctText}</strong>
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-8 flex gap-3">
                    <button
                      onClick={() => {
                        setShowResultsModal(false);
                        setSelectedQuiz(null);
                        setQuizResults(null);
                      }}
                      className="flex-1 px-4 py-3 rounded-lg bg-neutral-200 text-neutral-900 font-medium hover:bg-neutral-300 transition"
                    >
                      Close
                    </button>
                    <Link
                      href={`/quiz?id=${selectedQuiz?.id}`}
                      className="flex-1 text-center px-4 py-3 rounded-lg bg-black text-white font-medium hover:bg-neutral-800 transition"
                    >
                      Retake Quiz
                    </Link>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-neutral-600 mb-4">No results found for this quiz yet</p>
                  <Link
                    href={`/quiz?id=${selectedQuiz?.id}`}
                    className="inline-block px-6 py-2 rounded-lg bg-black text-white font-medium hover:bg-neutral-800 transition"
                  >
                    Take the Quiz
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
