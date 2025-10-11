interface QuizProgressProps {
  current: number;
  total: number;
  onExit?: () => void;
}

export function QuizProgress({ current, total, onExit }: QuizProgressProps) {
  const percentage = (current / total) * 100;

  return (
    <div className="flex items-center gap-4 mb-8">
      <button
        onClick={onExit}
        className="w-8 h-8 flex items-center justify-center rounded hover:bg-neutral-200 transition"
        aria-label="Exit quiz"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <div className="flex-1 h-3 bg-neutral-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm font-medium text-neutral-900 min-w-[3rem] text-right">
        {current}/{total}
      </span>
    </div>
  );
}
