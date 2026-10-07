import React from 'react';
import { DimensionScore } from '../../../types/assessment';
import { DimensionCategory } from '../../../types/career';

const CATEGORY_LABELS: Record<DimensionCategory, string> = {
  interest: 'Interés temático',
  aptitude: 'Aptitud percibida',
  work_preference: 'Preferencia de trabajo',
  motivator: 'Motivador profesional',
};

function getAffinityLevelLabel(score: number): string {
  if (score >= 0.8) return 'Afinidad muy alta';
  if (score >= 0.65) return 'Afinidad alta';
  if (score >= 0.45) return 'Afinidad moderada';
  return 'Afinidad inicial';
}

interface EnrichedDimensionScore extends DimensionScore {
  score: number;
  name: string;
  description: string;
}

interface DimensionProfileProps {
  dimensions: EnrichedDimensionScore[];
}

export const DimensionProfile: React.FC<DimensionProfileProps> = ({ dimensions }) => {
  const safeDimensions = dimensions.filter(
    (d) => d.assessed === true && typeof d.score === 'number'
  );

  if (safeDimensions.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="dimension-profile-heading"
      className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 space-y-6"
    >
      <div className="space-y-1.5">
        <div className="text-xs font-medium text-gray-500">
          2. Tu perfil vocacional · 3. Tus dimensiones destacadas
        </div>
        <h2
          id="dimension-profile-heading"
          className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight"
        >
          Tus principales afinidades evaluadas
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Estas son las dimensiones en las que tus respuestas mostraron mayor coincidencia entre
          las áreas evaluadas durante el test.
        </p>
      </div>

      <div className="divide-y divide-gray-100">
        {safeDimensions.map((dim) => {
          const pct = Math.round(dim.score * 100);
          const levelText = getAffinityLevelLabel(dim.score);

          return (
            <div key={dim.dimensionId} className="py-4 first:pt-1 last:pb-1 space-y-2">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="space-y-0.5">
                  <h3 className="text-base font-semibold text-gray-900">{dim.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{CATEGORY_LABELS[dim.category]}</span>
                    <span aria-hidden="true">·</span>
                    <span>{levelText}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-base font-bold text-blue-600 tabular-nums">
                    {pct}%
                  </span>
                  <span className="sr-only"> de afinidad ({levelText})</span>
                </div>
              </div>

              <div
                className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden"
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${dim.name}: ${pct}% (${levelText})`}
              >
                <div
                  className="h-full bg-blue-600 rounded-full transition-transform duration-200 origin-left"
                  style={{ transform: `scaleX(${Math.max(0.04, dim.score)})` }}
                />
              </div>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {dim.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
