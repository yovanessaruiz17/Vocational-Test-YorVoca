import React from 'react';
import { FamilyScore } from '../../../types/assessment';

interface EnrichedFamilyScore extends FamilyScore {
  name: string;
  description: string;
}

interface FamilyScoresProps {
  families: EnrichedFamilyScore[];
}

export const FamilyScores: React.FC<FamilyScoresProps> = ({ families }) => {
  if (families.length === 0) return null;

  return (
    <section
      aria-labelledby="family-scores-heading"
      className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 space-y-6"
    >
      <div className="space-y-1.5">
        <div className="text-xs font-medium text-gray-500">4. Tus familias profesionales</div>
        <h2
          id="family-scores-heading"
          className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight"
        >
          Grandes áreas que conectan con tu perfil
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Estas familias agrupan carreras con enfoques cercanos. Son territorios de exploración
          recomendados, no una decisión cerrada.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {families.map((family, idx) => {
          const pct = Math.round(family.normalizedScore * 100);
          const indexFormatted = String(idx + 1).padStart(2, '0');

          return (
            <div
              key={family.familyId}
              className="p-5 rounded-xl bg-gray-50/80 border border-gray-200/80 flex flex-col justify-between gap-3"
            >
              <div className="space-y-2">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs font-semibold text-blue-600 tabular-nums">
                    {indexFormatted}. Área de exploración
                  </span>
                  <span className="text-sm font-bold text-gray-900 tabular-nums">
                    {pct}% afinidad
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  {family.name}
                </h3>

                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {family.description}
                </p>
              </div>

              <div
                className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden"
                aria-hidden="true"
              >
                <div
                  className="h-full bg-blue-600 rounded-full origin-left"
                  style={{ transform: `scaleX(${Math.max(0.05, family.normalizedScore)})` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
