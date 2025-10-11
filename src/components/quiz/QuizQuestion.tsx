import { QuizOption, QuizOptionButton } from './QuizOptionButton';

export interface Question {
  question: string;
  options: QuizOption[];
  correctAnswer: string;
}

interface QuizQuestionProps {
  question: Question;
  selectedAnswer: string | null;
  showResult: boolean;
  onSelectAnswer: (answerId: string) => void;
}

export function QuizQuestion({
  question,
  selectedAnswer,
  showResult,
  onSelectAnswer,
}: QuizQuestionProps) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-6 md:p-8 shadow-sm">
      <h2 className="text-xl md:text-2xl font-semibold text-neutral-900 mb-6">
        {question.question}
      </h2>
      <div className="space-y-3">
        {question.options.map((option) => (
          <QuizOptionButton
            key={option.id}
            option={option}
            isSelected={selectedAnswer === option.id}
            isCorrect={showResult && option.id === question.correctAnswer}
            isIncorrect={showResult && selectedAnswer === option.id && option.id !== question.correctAnswer}
            showResult={showResult}
            onClick={() => onSelectAnswer(option.id)}
          />
        ))}
      </div>
    </div>
  );
}
