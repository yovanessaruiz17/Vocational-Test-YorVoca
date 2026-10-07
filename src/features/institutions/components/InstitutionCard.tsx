import React, { useState } from 'react';
import {
  EnrichedAcademicProgram,
  InstitutionWithPrograms,
} from '../../../types/academic';
import {
  formatVerificationDate,
  INSTITUTION_TYPE_LABELS,
  LEVEL_LABELS,
  MODALITY_LABELS,
  SECTOR_LABELS,
  SOURCE_PROVIDER_LABELS,
} from '../../programs/components/ProgramCard';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

interface InstitutionCardProps {
  group: InstitutionWithPrograms;
  onSelectProgram: (item: EnrichedAcademicProgram) => void;
}

export const InstitutionCard: React.FC<InstitutionCardProps> = ({
  group,
  onSelectProgram,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { institution, programs, directMatchCount, relatedMatchCount } = group;

  const programsCountLabel =
    programs.length === 1
      ? '1 programa relacionado'
      : `${programs.length} programas relacionados`;

  return (
    <article className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span>{INSTITUTION_TYPE_LABELS[institution.institutionType]}</span>
            <span aria-hidden="true">·</span>
            <span>Sector {SECTOR_LABELS[institution.sector].toLowerCase()}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">
              SNIES: {institution.sniesCode ?? 'No disponible'}
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-gray-900">{institution.name}</h3>

          <div className="text-xs sm:text-sm text-gray-600">
            {institution.city}, {institution.department}
          </div>
        </div>

        <div className="sm:text-right shrink-0 space-y-1">
          <div className="text-base font-bold text-blue-600 tabular-nums">
            {programsCountLabel}
          </div>
          <div className="text-xs text-gray-500 tabular-nums">
            {directMatchCount} directos · {relatedMatchCount} afines
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <span
            className={
              institution.source.provider === 'mock'
                ? 'font-medium text-amber-800'
                : 'font-medium text-emerald-800'
            }
          >
            Fuente: {SOURCE_PROVIDER_LABELS[institution.source.provider]}
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Verificado:{' '}
            {formatVerificationDate(
              institution.lastVerifiedAt ?? institution.source.lastVerifiedAt
            )}
          </span>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {institution.officialWebsite && (
            <a
              href={institution.officialWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[40px] px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              Sitio institucional
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-expanded={isExpanded}
            className="min-h-[40px] px-4 py-2 rounded-xl bg-blue-600 text-white text-xs sm:text-sm font-semibold hover:bg-blue-700 flex items-center gap-1.5 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            {isExpanded ? 'Ocultar programas' : 'Ver programas'}
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="pt-3 border-t border-gray-100 space-y-2.5">
          <div className="text-xs font-semibold text-gray-700">
            Programas compatibles en {institution.name}:
          </div>
          <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-gray-50/70">
            {programs.map((item) => (
              <div
                key={item.program.programId}
                className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <span
                      className={
                        item.primaryMatch?.matchType === 'direct'
                          ? 'font-semibold text-blue-600'
                          : 'font-medium text-gray-700'
                      }
                    >
                      {item.primaryMatch?.matchType === 'direct'
                        ? 'Programa directamente relacionado'
                        : 'Programa relacionado con esta carrera'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{MODALITY_LABELS[item.program.modality]}</span>
                    <span aria-hidden="true">·</span>
                    <span>{LEVEL_LABELS[item.program.academicLevel]}</span>
                  </div>

                  <div className="text-sm sm:text-base font-bold text-gray-900">
                    {item.program.name}
                  </div>

                  <div className="text-xs text-gray-600">
                    {item.program.city}, {item.program.department} · SNIES:{' '}
                    {item.program.sniesCode ?? 'No disponible'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectProgram(item)}
                  className="min-h-[38px] px-3.5 py-1.5 rounded-xl border border-gray-300 bg-white text-xs font-semibold text-gray-800 hover:bg-gray-100 transition-colors whitespace-nowrap shrink-0 self-start sm:self-center"
                >
                  Ver programa
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
};
