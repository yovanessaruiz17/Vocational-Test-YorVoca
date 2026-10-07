import React from 'react';
import { AnswerOption, LikertValue } from '../../../types/assessment';
import { Check } from 'lucide-react';

interface LikertScaleProps {
  questionId: string;
  options: AnswerOption[];
  selectedValue?: LikertValue;
  onSelect: (value: LikertValue) => void;
}

export const LikertScale: React.FC<LikertScaleProps> = ({
  questionId,
  options,
  selectedValue,
  onSelect,
}) => {
  return (
    <div
      role="radiogroup"
      aria-labelledby={`${questionId}-prompt`}
      className="space-y-2.5"
    >
      {options.map((option) => {
        const isSelected = selectedValue === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onSelect(option.value)}
            className={`w-full min-h-[52px] px-4 py-3 rounded-xl border text-left flex items-center justify-between gap-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1 ${
              isSelected
                ? 'border-blue-600 bg-blue-50/80 text-blue-950 font-semibold'
                : 'border-gray-200 bg-white text-gray-800 hover:border-gray-300 hover:bg-gray-50/60'
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <span
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold tabular-nums shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {option.value}
              </span>
              <span className="text-sm md:text-base leading-snug">
                {option.label}
              </span>
            </div>

            <div
              className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                isSelected
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-300 bg-white'
              }`}
              aria-hidden="true"
            >
              {isSelected && <Check className="w-3.5 h-3.5" />}
            </div>
          </button>
        );
      })}
    </div>
  );
};
