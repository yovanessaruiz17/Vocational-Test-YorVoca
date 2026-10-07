import React from 'react';
import {
  AIInterpretation as AIInterpretationType,
  InterpretationSource,
} from '../../../types/interpretation';
import { RefreshCw } from 'lucide-react';

interface AIInterpretationProps {
  interpretation: AIInterpretationType | null;
  source: InterpretationSource;
  isLoading: boolean;
  notice: string | null;
  onRequestGemini: () => void;
}

export const AIInterpretation: React.FC<AIInterpretationProps> = ({
  interpretation,
  source,
  isLoading,
  notice,
  onRequestGemini,
}) => {
  if (!interpretation) return null;

  return (
    <section
      aria-labelledby="ai-interpretation-heading"
      className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="font-semibold text-blue-600">
              6. Síntesis e interpretación orientativa
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {source === 'gemini'
                ? 'Interpretación enriquecida con Gemini'
                : 'Síntesis determinista local'}
            </span>
          </div>

          <h2
            id="ai-interpretation-heading"
            className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight"
          >
            Lectura integral de tus afinidades
          </h2>
        </div>

        <button
          type="button"
          onClick={onRequestGemini}
          disabled={isLoading}
          className="min-h-[44px] px-4 py-2 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <RefreshCw
            className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`}
            aria-hidden="true"
          />
          {isLoading
            ? 'Generando lectura...'
            : source === 'gemini'
            ? 'Actualizar lectura con IA'
            : 'Personalizar lectura con Gemini'}
        </button>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600">
          {notice} Mostrando la interpretación determinista generada a partir de tus puntajes.
        </div>
      )}

      <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
        {interpretation.summary}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2.5">
          <h3 className="text-sm font-semibold text-gray-900">
            Patrones que destacan en tu perfil
          </h3>
          <ul className="space-y-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
            {interpretation.strengths.map((item, idx) => (
              <li key={idx}>• {item}</li>
            ))}
          </ul>
        </div>

        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2.5">
          <h3 className="text-sm font-semibold text-gray-900">
            Sugerencias para tu exploración
          </h3>
          <ul className="space-y-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
            {interpretation.explorationAdvice.map((item, idx) => (
              <li key={idx}>• {item}</li>
            ))}
          </ul>
        </div>

        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2.5">
          <h3 className="text-sm font-semibold text-gray-900">
            Preguntas para reflexionar
          </h3>
          <ul className="space-y-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
            {interpretation.reflectionQuestions.map((item, idx) => (
              <li key={idx}>• {item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
