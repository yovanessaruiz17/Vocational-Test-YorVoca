import React from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

interface AssessmentNavigationProps {
  currentIndex: number;
  totalQuestions: number;
  hasCurrentAnswer: boolean;
  isAllRequiredAnswered: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onFinish: () => void;
}

export const AssessmentNavigation: React.FC<AssessmentNavigationProps> = ({
  currentIndex,
  totalQuestions,
  hasCurrentAnswer,
  isAllRequiredAnswered,
  onPrevious,
  onNext,
  onFinish,
}) => {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalQuestions - 1;

  return (
    <div className="pt-6 border-t border-gray-100 flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={onPrevious}
        disabled={isFirst}
        className="min-h-[48px] px-5 py-2.5 rounded-xl border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
      >
        <ArrowLeft className="w-4 h-4" />
        Anterior
      </button>

      <div className="flex items-center gap-2.5">
        {!isLast ? (
          <button
            type="button"
            onClick={onNext}
            disabled={!hasCurrentAnswer}
            className="min-h-[48px] px-6 py-2.5 rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1"
          >
            Siguiente
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onFinish}
            disabled={!hasCurrentAnswer}
            className="min-h-[48px] px-6 py-2.5 rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1"
          >
            <CheckCircle2 className="w-4 h-4" />
            {isAllRequiredAnswered ? 'Calcular afinidades' : 'Revisar pendientes'}
          </button>
        )}
      </div>
    </div>
  );
};
