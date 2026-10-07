import React from 'react';
import { LikertValue, Question } from '../../../types/assessment';
import { LikertScale } from './LikertScale';

interface QuestionCardProps {
  question: Question;
  selectedValue?: LikertValue;
  onSelectAnswer: (value: LikertValue) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedValue,
  onSelectAnswer,
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Autopercepción vocacional</span>
          <span>
            {selectedValue !== undefined ? 'Respuesta registrada' : 'Respuesta obligatoria'}
          </span>
        </div>

        <h2
          id={`${question.id}-prompt`}
          className="text-xl md:text-2xl font-semibold text-gray-900 leading-snug"
          style={{ textWrap: 'balance' }}
        >
          {question.text}
        </h2>
      </div>

      <LikertScale
        questionId={question.id}
        options={question.options}
        selectedValue={selectedValue}
        onSelect={onSelectAnswer}
      />
    </div>
  );
};
