interface QuizResultsProps {
  score: number;
  total: number;
  onRetry?: () => void;
  onExit?: () => void;
}

export function QuizResults({ score, total, onRetry, onExit }: QuizResultsProps) {
  const percentage = Math.round((score / total) * 100);
  
  const getGrade = () => {
    if (percentage >= 90) return { text: 'Excellent!', color: 'text-green-600' };
    if (percentage >= 80) return { text: 'Great job!', color: 'text-blue-600' };
    if (percentage >= 70) return { text: 'Good work!', color: 'text-yellow-600' };
    if (percentage >= 60) return { text: 'Keep practicing!', color: 'text-orange-600' };
    return { text: 'Try again!', color: 'text-red-600' };
  };

  const grade = getGrade();

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
