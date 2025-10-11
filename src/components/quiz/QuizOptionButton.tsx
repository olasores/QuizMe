export interface QuizOption {
  id: string;
  text: string;
}

interface QuizOptionButtonProps {
  option: QuizOption;
  isSelected: boolean;
  isCorrect?: boolean;
  isIncorrect?: boolean;
  showResult: boolean;
  onClick: () => void;
}

export function QuizOptionButton({
  option,
  isSelected,
  isCorrect,
  isIncorrect,
  showResult,
  onClick,
}: QuizOptionButtonProps) {
  const getStyles = () => {
    if (showResult) {
      if (isCorrect) {
        return 'bg-green-100 border-green-500 text-green-900';
      }
      if (isIncorrect) {
        return 'bg-red-100 border-red-500 text-red-900';
      }
      return 'bg-neutral-50 border-neutral-200 text-neutral-400';
    }
    if (isSelected) {
      return 'bg-blue-100 border-blue-500 text-blue-900';
    }
    return 'bg-white border-neutral-300 text-neutral-900 hover:border-neutral-400 hover:bg-neutral-50';
  };

  return (
    <button
      onClick={onClick}
      disabled={showResult}
      className={`w-full rounded-xl border-2 p-4 text-left transition flex items-center gap-3 ${getStyles()} disabled:cursor-not-allowed`}
    >
      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-black/5 text-sm font-semibold shrink-0">
        {option.id}
      </span>
      <span className="text-sm font-medium flex-1">{option.text}</span>
      {showResult && isCorrect && (
        <svg className="w-5 h-5 text-green-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )}
      {showResult && isIncorrect && (
        <svg className="w-5 h-5 text-red-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  );
}
