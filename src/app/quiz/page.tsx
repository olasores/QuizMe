"use client";
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { QuizProgress } from '@/components/quiz/QuizProgress';
import { QuizQuestion, Question } from '@/components/quiz/QuizQuestion';
import { QuizResults } from '@/components/quiz/QuizResults';

function QuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const quizData = searchParams.get('data');
    if (quizData) {
      try {
        const parsed = JSON.parse(decodeURIComponent(quizData));
        setQuestions(parsed.questions || []);
        setLoading(false);
      } catch (error) {
        console.error('Failed to parse quiz data:', error);
        router.push('/generate-quiz');
      }
    } else {
      router.push('/generate-quiz');
    }
  }, [searchParams, router]);

  const currentQuestion = questions[currentIndex];

  const handleSelectAnswer = (answerId: string) => {
    if (!showResult) {
      setSelectedAnswer(answerId);
    }
  };

  const handleCheck = () => {
    if (selectedAnswer) {
      setShowResult(true);
      setAnswers({ ...answers, [currentIndex]: selectedAnswer });
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setIsComplete(true);
    }
  };

  const calculateScore = () => {
    return questions.reduce((score, question, index) => {
      return answers[index] === question.correctAnswer ? score + 1 : score;
    }, 0);
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setAnswers({});
    setIsComplete(false);
  };

  const handleExit = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-neutral-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-600 mb-4">No questions found</p>
          <button
            onClick={handleExit}
            className="px-4 py-2 rounded-lg bg-black text-white text-sm"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (isComplete) {
    // Extract quiz ID if available in the URL or generate temporary one
    const quizId = searchParams.get('id') || `temp-${Date.now()}`;
    
    return (
      <QuizResults
        score={calculateScore()}
        total={questions.length}
        onRetry={handleRetry}
        onExit={handleExit}
        quizId={quizId}
        answers={answers}
        questions={questions.map((q, index) => ({
          id: q.id || `q-${index}`,
          correctAnswer: q.correctAnswer
        }))}
      />
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <QuizProgress
          current={currentIndex + 1}
          total={questions.length}
          onExit={handleExit}
        />

        <QuizQuestion
          question={currentQuestion}
          selectedAnswer={selectedAnswer}
          showResult={showResult}
          onSelectAnswer={handleSelectAnswer}
        />

        <div className="mt-6 flex justify-center">
          {!showResult ? (
            <button
              onClick={handleCheck}
              disabled={!selectedAnswer}
              className="px-8 py-3 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Check
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-8 py-3 rounded-lg bg-black text-white text-sm font-medium hover:bg-neutral-800 transition"
            >
              {currentIndex < questions.length - 1 ? 'Next' : 'Finish'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-neutral-600">Loading quiz...</p>
        </div>
      </div>
    }>
      <QuizContent />
    </Suspense>
  );
}
