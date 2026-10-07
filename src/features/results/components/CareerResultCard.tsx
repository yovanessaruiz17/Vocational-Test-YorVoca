import React from 'react';
import { Link } from 'react-router-dom';
import { CareerScore } from '../../../types/assessment';
import { Career, CareerFamily } from '../../../types/career';
import { CareerDetailedExplanation } from '../../../types/interpretation';
import { ArrowUpRight, Building2 } from 'lucide-react';

interface CareerResultCardProps {
  careerScore: CareerScore;
  career?: Career;
  family?: CareerFamily;
  explanation: CareerDetailedExplanation;
  isSelected?: boolean;
  onExplore: (careerId: string) => void;
}

export const CareerResultCard: React.FC<CareerResultCardProps> = ({
  careerScore,
  career,
  family,
  explanation,
  isSelected = false,
  onExplore,
}) => {
  const topMatchedDims =
    careerScore.explanation.strongMatches.length > 0
      ? careerScore.explanation.strongMatches.slice(0, 4)
      : careerScore.matchedDimensions.slice(0, 4);

  return (
    <article
      className={`p-6 rounded-2xl border transition-colors space-y-4 ${
        isSelected
          ? 'bg-blue-50/40 border-blue-600'
          : 'bg-white border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span className="font-bold text-blue-600 tabular-nums">
              #{careerScore.rank}
            </span>
            <span aria-hidden="true">·</span>
            <span>{family?.name ?? explanation.familyName}</span>
          </div>

          <h3 className="text-xl font-bold text-gray-900">
            {career?.name ?? explanation.careerName}
          </h3>
        </div>

        <div className="sm:text-right shrink-0">
          <div className="text-xl sm:text-2xl font-bold text-blue-600 tabular-nums">
            {explanation.affinityPercent}% de afinidad
          </div>
          <div className="text-xs text-gray-500">
            Afinidad relativa con el perfil evaluado
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-600 leading-relaxed">
        {explanation.shortDescription}
      </p>

      <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
        <div className="text-xs font-semibold text-gray-700">
          Coincide especialmente con:
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-700">
          {topMatchedDims.map((match) => (
            <li key={match.dimensionId} className="flex items-center justify-between gap-2">
              <span className="truncate">• {match.dimensionName}</span>
              <span className="text-xs font-medium text-gray-500 tabular-nums shrink-0">
                {Math.round(match.userScore * 100)}%
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-xs text-gray-500 line-clamp-2 sm:max-w-md">
          {explanation.whyItAppeared}
        </p>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link
            to={`/academic?career=${encodeURIComponent(careerScore.careerId)}`}
            className="min-h-[44px] px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-800 text-xs sm:text-sm font-semibold hover:bg-gray-50 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <Building2 className="w-4 h-4 text-blue-600" aria-hidden="true" />
            Ver dónde estudiar
          </Link>

          <button
            type="button"
            onClick={() => onExplore(careerScore.careerId)}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs sm:text-sm font-semibold hover:bg-blue-700 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1"
          >
            Explorar esta carrera
            <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
};
