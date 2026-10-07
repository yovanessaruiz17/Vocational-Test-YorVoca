import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  CAREER_FAMILIES_BY_ID,
  CAREERS_BY_ID,
} from '../../data/careers';
import { buildCareerExplanation } from '../../lib/assessment';
import { loadAndValidateResultsFromStorage } from '../results/hooks/useResults';
import {
  ArrowLeft,
  Building2,
  Compass,
} from 'lucide-react';

export const CareerDetailPage: React.FC = () => {
  const { careerId } = useParams<{ careerId: string }>();
  const navigate = useNavigate();

  const loaded = loadAndValidateResultsFromStorage();
  const career = careerId ? CAREERS_BY_ID[careerId] : undefined;

  if (loaded.status === 'empty' || loaded.status === 'corrupt' || !loaded.result) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 text-center space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Compass className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Completa primero tu exploración vocacional
            </h1>
            <p className="text-sm text-gray-600 leading-relaxed">
              Para conocer tu nivel de afinidad con esta carrera y ver dónde estudiarla según tu
              perfil, realiza primero el test vocacional.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/test"
              className="inline-flex min-h-[48px] px-7 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 items-center justify-center transition-colors whitespace-nowrap"
            >
              Comenzar exploración
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!career) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 text-center space-y-5">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Carrera no encontrada en el catálogo
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            El identificador de carrera solicitado no existe dentro del catálogo vocacional de
            YorVoca.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/results"
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 flex items-center justify-center whitespace-nowrap"
            >
              Volver a mis resultados
            </Link>
            <Link
              to="/academic"
              className="min-h-[44px] px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 flex items-center justify-center whitespace-nowrap"
            >
              Ir al explorador académico
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const family = CAREER_FAMILIES_BY_ID[career.familyId];
  const careerScore = loaded.result.careerScores.find((cs) => cs.careerId === career.id);

  if (!careerScore) {
    return null;
  }

  const explanation = buildCareerExplanation(careerScore, career, family);
  const strongMatches = careerScore.explanation.strongMatches;
  const moderateMatches = careerScore.explanation.moderateMatches;
  const lowMatches = careerScore.explanation.lowMatches;

  return (
    <div className="max-w-4xl mx-auto py-4 md:py-6 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate('/results')}
          className="min-h-[44px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-gray-700 hover:bg-white border border-transparent hover:border-gray-200 flex items-center gap-2 transition-colors whitespace-nowrap"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Volver a mis resultados
        </button>

        <Link
          to={`/academic?career=${encodeURIComponent(career.id)}`}
          className="min-h-[44px] px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs sm:text-sm font-semibold hover:bg-blue-700 flex items-center gap-2 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <Building2 className="w-4 h-4" aria-hidden="true" />
          Ver dónde estudiar
        </Link>
      </div>

      {/* Encabezado de la carrera */}
      <section className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
              <span className="font-bold text-blue-600 tabular-nums">
                Posición #{explanation.rank} en tu perfil
              </span>
              <span aria-hidden="true">·</span>
              <span>{explanation.familyName}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              {explanation.careerName}
            </h1>
          </div>

          <div className="sm:text-right shrink-0">
            <div className="text-2xl sm:text-3xl font-bold text-blue-600 tabular-nums">
              {explanation.affinityPercent}% de afinidad
            </div>
            <div className="text-xs text-gray-500">
              Puntaje proveniente de tu evaluación vocacional
            </div>
          </div>
        </div>

        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
          {explanation.shortDescription}
        </p>

        <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 space-y-1.5">
          <h2 className="text-sm font-semibold text-gray-900">
            ¿Por qué aparece esta carrera en tu perfil?
          </h2>
          <p className="text-sm text-gray-800 leading-relaxed">{explanation.whyItAppeared}</p>
        </div>
      </section>

      {/* Qué suele hacerse y áreas habituales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-white p-6 rounded-2xl border border-gray-200 space-y-3">
          <h2 className="text-base font-bold text-gray-900">
            ¿Qué suele hacerse en este campo?
          </h2>
          <ul className="space-y-2 text-sm text-gray-600 leading-relaxed">
            {explanation.whatYouDo.map((activity, idx) => (
              <li key={idx}>• {activity}</li>
            ))}
          </ul>
        </section>

        <section className="bg-white p-6 rounded-2xl border border-gray-200 space-y-3">
          <h2 className="text-base font-bold text-gray-900">
            Áreas habituales de desempeño
          </h2>
          <ul className="space-y-2 text-sm text-gray-600 leading-relaxed">
            {explanation.typicalAreas.map((area, idx) => (
              <li key={idx}>• {area}</li>
            ))}
          </ul>
        </section>
      </div>

      {/* Desglose de dimensiones */}
      <section className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 space-y-4">
        <h2 className="text-lg font-bold text-gray-900">
          Coincidencia detallada con tus dimensiones evaluadas
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
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

          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
            <div className="font-semibold text-gray-900">
              Coincidencias moderadas ({moderateMatches.length})
            </div>
            {moderateMatches.length > 0 ? (
              <ul className="space-y-1.5 text-gray-700">
                {moderateMatches.slice(0, 6).map((m) => (
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

          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
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
      </section>

      {/* CTA principal hacia /academic (Sección 15) */}
      <section className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-gray-900">
            ¿Dónde puedes estudiar opciones relacionadas con {explanation.careerName}?
          </h2>
          <p className="text-sm text-gray-600">
            Pasa del análisis vocacional a explorar instituciones y programas académicos en
            Colombia compatibles con tus filtros de ciudad y modalidad.
          </p>
        </div>

        <Link
          to={`/academic?career=${encodeURIComponent(career.id)}`}
          className="min-h-[48px] px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <Building2 className="w-4 h-4" aria-hidden="true" />
          Ver dónde estudiar
        </Link>
      </section>
    </div>
  );
};
