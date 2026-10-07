import React from 'react';
import { StudentContextData } from '../../../types/student';
import { RotateCcw } from 'lucide-react';

interface ResultsHeroProps {
  completedAt: string;
  evaluatedCount: number;
  studentContext: StudentContextData;
  onRequestRetake: () => void;
}

export const ResultsHero: React.FC<ResultsHeroProps> = ({
  completedAt,
  evaluatedCount,
  studentContext,
  onRequestRetake,
}) => {
  const formattedDate = (() => {
    try {
      return new Intl.DateTimeFormat('es-CO', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(new Date(completedAt));
    } catch {
      return 'Reciente';
    }
  })();

  return (
    <section className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-blue-600">Exploración vocacional</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">{evaluatedCount} dimensiones evaluadas</span>
          <span aria-hidden="true">·</span>
          <span>Calculado el {formattedDate}</span>
        </div>

        <button
          type="button"
          onClick={onRequestRetake}
          className="text-gray-600 hover:text-gray-900 font-medium hover:underline flex items-center gap-1.5 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded px-1 py-0.5"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          Volver a realizar el test
        </button>
      </div>

      <div className="space-y-3">
        <h1
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight"
          style={{ textWrap: 'balance' }}
        >
          Tu perfil vocacional está listo
        </h1>
        <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-3xl">
          Tus respuestas muestran patrones de intereses, preferencias, motivadores y aptitudes
          percibidas. A partir de esos patrones encontramos las áreas y carreras que presentan
          mayor afinidad con tu perfil y que vale la pena explorar.
        </p>
      </div>

      {studentContext.isComplete && studentContext.targetLocation && (
        <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
          <span className="font-medium text-gray-700">Contexto guardado para futura búsqueda:</span>
          <span>
            {studentContext.targetLocation.city}, {studentContext.targetLocation.department}
          </span>
          {studentContext.preferredModality && (
            <>
              <span aria-hidden="true">·</span>
              <span>Modalidad {studentContext.preferredModality.toLowerCase()}</span>
            </>
          )}
          {studentContext.preferredInstitutionType && (
            <>
              <span aria-hidden="true">·</span>
              <span>Institución {studentContext.preferredInstitutionType.toLowerCase()}</span>
            </>
          )}
          <span aria-hidden="true">·</span>
          <span className="text-gray-400">
            (Tu ubicación no modifica los puntajes vocacionales)
          </span>
        </div>
      )}
    </section>
  );
};
