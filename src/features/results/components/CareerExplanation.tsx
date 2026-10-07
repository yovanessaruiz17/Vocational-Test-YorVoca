import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CareerScore } from '../../../types/assessment';
import { CareerDetailedExplanation } from '../../../types/interpretation';
import { Building2, X } from 'lucide-react';

interface CareerExplanationProps {
  explanation: CareerDetailedExplanation | null;
  careerScore: CareerScore | null;
  onClose: () => void;
}

export const CareerExplanation: React.FC<CareerExplanationProps> = ({
  explanation,
  careerScore,
  onClose,
}) => {
  useEffect(() => {
    if (!explanation) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [explanation, onClose]);

  if (!explanation || !careerScore) {
    return null;
  }

  const strongMatches = careerScore.explanation.strongMatches;
  const moderateMatches = careerScore.explanation.moderateMatches;
  const lowMatches = careerScore.explanation.lowMatches;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="career-explanation-title"
    >
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-t-3xl sm:rounded-2xl border border-gray-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-100 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
              <span className="font-bold text-blue-600 tabular-nums">
                Opción #{explanation.rank}
              </span>
              <span aria-hidden="true">·</span>
              <span>{explanation.familyName}</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-gray-900 tabular-nums">
                {explanation.affinityPercent}% de afinidad relativa
              </span>
            </div>

            <h2
              id="career-explanation-title"
              className="text-xl sm:text-2xl font-bold text-gray-900"
            >
              {explanation.careerName}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar exploración de carrera"
            className="min-h-[44px] min-w-[44px] rounded-xl text-gray-500 hover:bg-gray-100 flex items-center justify-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Descripción general */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900">Descripción del campo</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {explanation.shortDescription}
            </p>
          </div>

          {/* ¿Por qué apareció en tu resultado? */}
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 space-y-2">
            <h3 className="text-sm font-semibold text-gray-900">
              ¿Por qué apareció en tu resultado?
            </h3>
            <p className="text-sm text-gray-800 leading-relaxed">
              {explanation.whyItAppeared}
            </p>
          </div>

          {/* Qué suele hacerse en este campo y Áreas típicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2.5">
              <h3 className="text-sm font-semibold text-gray-900">
                ¿Qué suele hacerse en este campo?
              </h3>
              <ul className="space-y-1.5 text-xs sm:text-sm text-gray-600 leading-relaxed">
                {explanation.whatYouDo.map((activity, idx) => (
                  <li key={idx}>• {activity}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2.5">
              <h3 className="text-sm font-semibold text-gray-900">
                Áreas habituales de desempeño
              </h3>
              <ul className="space-y-1.5 text-xs sm:text-sm text-gray-600 leading-relaxed">
                {explanation.typicalAreas.map((area, idx) => (
                  <li key={idx}>• {area}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Dimensiones coincidentes */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">
              Detalle de dimensiones coincidentes
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
                <div className="font-semibold text-gray-900">
                  Fortalezas coincidentes ({strongMatches.length})
                </div>
                {strongMatches.length > 0 ? (
                  <ul className="space-y-1.5 text-gray-700">
                    {strongMatches.map((m) => (
                      <li key={m.dimensionId} className="flex justify-between gap-2">
                        <span className="truncate">{m.dimensionName}</span>
                        <span className="font-semibold text-blue-600 tabular-nums shrink-0">
                          {Math.round(m.userScore * 100)}%
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">Sin coincidencias altas.</p>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
                <div className="font-semibold text-gray-900">
                  Coincidencias moderadas ({moderateMatches.length})
                </div>
                {moderateMatches.length > 0 ? (
                  <ul className="space-y-1.5 text-gray-700">
                    {moderateMatches.slice(0, 5).map((m) => (
                      <li key={m.dimensionId} className="flex justify-between gap-2">
                        <span className="truncate">{m.dimensionName}</span>
                        <span className="font-medium text-gray-800 tabular-nums shrink-0">
                          {Math.round(m.userScore * 100)}%
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">Sin coincidencias moderadas.</p>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
                <div className="font-semibold text-gray-900">
                  Baja coincidencia ({lowMatches.length})
                </div>
                {lowMatches.length > 0 ? (
                  <ul className="space-y-1.5 text-gray-700">
                    {lowMatches.map((m) => (
                      <li key={m.dimensionId} className="flex justify-between gap-2">
                        <span className="truncate">{m.dimensionName}</span>
                        <span className="text-gray-500 tabular-nums shrink-0">
                          {Math.round(m.userScore * 100)}%
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">Sin discrepancias marcadas.</p>
                )}
              </div>
            </div>
          </div>

          {/* Aspectos que podrías explorar */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">
              Aspectos que podrías explorar
            </h3>
            <ul className="space-y-1.5 text-xs sm:text-sm text-gray-600 leading-relaxed">
              {explanation.aspectsToExplore.map((tip, idx) => (
                <li key={idx}>• {tip}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-gray-100 bg-white flex flex-wrap items-center justify-between gap-3">
          <Link
            to={`/careers/${encodeURIComponent(explanation.careerId)}`}
            onClick={onClose}
            className="text-xs sm:text-sm font-medium text-blue-600 hover:underline whitespace-nowrap"
          >
            Abrir página dedicada de la carrera
          </Link>

          <div className="flex items-center gap-2.5">
            <Link
              to={`/academic?career=${encodeURIComponent(explanation.careerId)}`}
              onClick={onClose}
              className="min-h-[44px] px-5 py-2 rounded-xl bg-blue-600 text-white text-xs sm:text-sm font-semibold hover:bg-blue-700 flex items-center gap-1.5 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <Building2 className="w-4 h-4" aria-hidden="true" />
              Ver dónde estudiar
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-5 py-2 rounded-xl border border-gray-300 text-gray-700 text-xs sm:text-sm font-semibold hover:bg-gray-50 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
