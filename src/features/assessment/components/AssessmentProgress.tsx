import React from 'react';
import { DimensionCategory } from '../../../types/career';

const CATEGORY_LABELS: Record<DimensionCategory, string> = {
  interest: 'Intereses',
  aptitude: 'Aptitudes percibidas',
  work_preference: 'Preferencias de trabajo',
  motivator: 'Motivadores profesionales',
};

interface AssessmentProgressProps {
  currentIndex: number;
  totalQuestions: number;
  answeredCount: number;
  progressPercentage: number;
  category: DimensionCategory;
  onOpenReview: () => void;
}

export const AssessmentProgress: React.FC<AssessmentProgressProps> = ({
  currentIndex,
  totalQuestions,
  answeredCount,
  progressPercentage,
  category,
  onOpenReview,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900">{CATEGORY_LABELS[category]}</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">
            Pregunta {currentIndex + 1} de {totalQuestions}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="tabular-nums text-gray-500">
            {answeredCount}/{totalQuestions} respondidas ({progressPercentage}%)
          </span>
          <button
            type="button"
            onClick={onOpenReview}
            className="text-blue-600 font-medium hover:text-blue-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-1 py-0.5 whitespace-nowrap transition-colors"
          >
            Revisar respuestas
          </button>
        </div>
      </div>

      <div
        className="w-full h-2 bg-gray-200 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={answeredCount}
        aria-valuemin={0}
        aria-valuemax={totalQuestions}
        aria-label={`Progreso del test: ${answeredCount} de ${totalQuestions} preguntas respondidas`}
      >
        <div
          className="h-full bg-blue-600 transition-transform duration-200 origin-left"
          style={{ transform: `scaleX(${totalQuestions > 0 ? answeredCount / totalQuestions : 0})` }}
        />
      </div>
    </div>
  );
};
