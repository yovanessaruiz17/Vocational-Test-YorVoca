import React, { useEffect } from 'react';
import { EnrichedAcademicProgram } from '../../../types/academic';
import {
  formatVerificationDate,
  getProgramTrustIndicator,
  INSTITUTION_TYPE_LABELS,
  LEVEL_LABELS,
  MODALITY_LABELS,
  SECTOR_LABELS,
  SOURCE_PROVIDER_LABELS,
  STATUS_LABELS,
} from './ProgramCard';
import { ExternalLink, X } from 'lucide-react';

interface ProgramDetailModalProps {
  item: EnrichedAcademicProgram | null;
  onClose: () => void;
}

export const ProgramDetailModal: React.FC<ProgramDetailModalProps> = ({ item, onClose }) => {
  useEffect(() => {
    if (!item) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [item, onClose]);

  if (!item) return null;

  const { program, institution, matches, primaryMatch } = item;
  const trust = getProgramTrustIndicator(item);
  const instWebsiteUrl =
    institution.officialWebsiteUrl ?? institution.officialWebsite;
  const officialUrl =
    program.officialProgramUrl ?? program.officialUrl ?? instWebsiteUrl;
  const isRootInstitutionUrl = Boolean(
    officialUrl &&
      instWebsiteUrl &&
      officialUrl.replace(/\/+$/, '') === instWebsiteUrl.replace(/\/+$/, '')
  );
  const officialContent = program.officialContent;
  const conflicts = program.conflicts ?? [];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="program-detail-modal-title"
    >
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-t-3xl sm:rounded-2xl border border-gray-200 flex flex-col overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-gray-100 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
              <span className="font-semibold text-blue-600">
                {primaryMatch?.matchType === 'direct'
                  ? 'Programa directamente relacionado'
                  : 'Programa relacionado con tu exploración'}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {program.sniesCode
                  ? `Código SNIES: ${program.sniesCode}`
                  : 'Código SNIES no disponible en esta fuente'}
              </span>
            </div>

            <h2
              id="program-detail-modal-title"
              className="text-xl sm:text-2xl font-bold text-gray-900"
            >
              {program.officialName ?? program.name}
            </h2>
            <p className="text-sm font-medium text-gray-700">
              {institution.officialName ?? institution.name}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ficha del programa"
            className="min-h-[44px] min-w-[44px] rounded-xl text-gray-500 hover:bg-gray-100 flex items-center justify-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Aviso de procedencia e indicador de confianza (Sección 26 y 27) */}
          <div
            className={`p-4 rounded-xl border text-xs sm:text-sm space-y-1.5 ${
              trust.tone === 'mock'
                ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                : trust.tone === 'verified'
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                : 'bg-blue-50/70 border-blue-200 text-blue-900'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 font-semibold">
              <span>{trust.label}</span>
              <span className="text-xs font-normal tabular-nums">
                Última verificación:{' '}
                {formatVerificationDate(
                  program.lastVerifiedAt ?? program.source.lastVerifiedAt
                )}
              </span>
            </div>
            <p className="leading-relaxed">
              {program.source.provider === 'mock'
                ? 'Este registro pertenece al conjunto de datos de demostración ("Demo YorVoca") utilizado en el entorno de desarrollo. No representa una oferta oficial del SNIES.'
                : `Fuente regulatoria: ${
                    SOURCE_PROVIDER_LABELS[program.source.provider]
                  }. Los datos oficiales institucionales y de registro se validan sin inventar información ausente.`}
            </p>
          </div>

          {/* Ficha técnica regulatoria (SNIES / MEN) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
              <div className="font-semibold text-gray-900">
                Datos regulatorios del programa
              </div>
              <dl className="space-y-1.5 text-gray-700">
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-500">Ubicación:</dt>
                  <dd className="font-medium text-right">
                    {program.city}, {program.department}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-500">Modalidad:</dt>
                  <dd className="font-medium text-right">{MODALITY_LABELS[program.modality]}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-500">Nivel académico:</dt>
                  <dd className="font-medium text-right">
                    {LEVEL_LABELS[program.academicLevel]}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-500">Estado:</dt>
                  <dd className="font-medium text-right">{STATUS_LABELS[program.status]}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-500">Código SNIES:</dt>
                  <dd className="font-mono tabular-nums text-right">
                    {program.sniesCode ?? 'No disponible en esta fuente'}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
              <div className="font-semibold text-gray-900">Datos de la institución</div>
              <dl className="space-y-1.5 text-gray-700">
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-500">Tipo:</dt>
                  <dd className="font-medium text-right">
                    {INSTITUTION_TYPE_LABELS[institution.institutionType]}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-500">Sector:</dt>
                  <dd className="font-medium text-right">{SECTOR_LABELS[institution.sector]}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-500">Sede institucional:</dt>
                  <dd className="font-medium text-right">
                    {institution.city}, {institution.department}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-500">SNIES Institución:</dt>
                  <dd className="font-mono tabular-nums text-right">
                    {institution.sniesInstitutionCode ??
                      institution.sniesCode ??
                      'No disponible en esta fuente'}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-500">Dominio oficial:</dt>
                  <dd className="font-mono text-right">
                    {institution.officialDomain ?? 'No registrado'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Información descriptiva del Sitio Oficial Institucional (Fuente B — Sección 9 y 31) */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2.5 text-xs sm:text-sm">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-gray-900">
                Información del sitio oficial de la institución
              </h3>
              <span className="text-xs text-gray-500">
                {officialContent
                  ? `Verificado: ${formatVerificationDate(officialContent.lastVerifiedAt)}`
                  : 'Consulta directa en portal institucional'}
              </span>
            </div>

            {officialContent?.description ? (
              <p className="text-gray-700 leading-relaxed">{officialContent.description}</p>
            ) : (
              <p className="text-gray-500">
                Descripción detallada, costos de matrícula y plan de estudios por semestre no se
                almacenan localmente en este corte; consúltalos directamente en el portal oficial
                de {institution.officialName ?? institution.name}.
              </p>
            )}

            {officialContent?.professionalProfile && (
              <div className="pt-1 text-gray-700">
                <span className="font-semibold text-gray-900">Perfil profesional: </span>
                {officialContent.professionalProfile}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs text-gray-600">
              <div>
                <span className="text-gray-500">Duración publicada: </span>
                <span className="font-medium text-gray-800">
                  {officialContent?.duration ?? 'Información no disponible en esta fuente'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Matrícula publicada: </span>
                <span className="font-medium text-gray-800">
                  {officialContent?.tuition ?? 'Consultar en el sitio oficial'}
                </span>
              </div>
            </div>
          </div>

          {/* Conflictos detectados entre fuentes si existieran (Sección 17) */}
          {conflicts.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-1.5 text-xs">
              <div className="font-semibold text-amber-900">
                Nota de trazabilidad entre fuentes ({conflicts.length})
              </div>
              <ul className="space-y-1 text-amber-900">
                {conflicts.map((c) => (
                  <li key={c.conflictId}>
                    • Campo <strong>{c.field}</strong>: {c.sourceA} registra &ldquo;
                    {String(c.valueA)}&rdquo; mientras {c.sourceB} reporta &ldquo;
                    {String(c.valueB)}&rdquo;. {c.resolution}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Relación explicable con las carreras vocacionales */}
          <div className="space-y-2.5 pt-2 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">
              Relación con tu perfil vocacional
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
              {matches.map((m) => (
                <li
                  key={m.careerId}
                  className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 space-y-1"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-gray-900">{m.careerName}</span>
                    <span className="text-xs font-medium text-blue-700 tabular-nums">
                      {m.matchType === 'direct'
                        ? 'Programa directamente relacionado'
                        : 'Programa relacionado con esta carrera'}
                      {typeof m.careerAffinityPercent === 'number'
                        ? ` · ${m.careerAffinityPercent}% afinidad vocacional`
                        : ''}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{m.rationale}</p>
                </li>
              ))}
            </ul>
            <p className="text-xs text-gray-500 leading-relaxed pt-1">
              Nota: El porcentaje de afinidad indica la coincidencia de la carrera con tu perfil
              vocacional. No representa una calificación ni un ranking de calidad institucional.
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-5 border-t border-gray-100 bg-white flex flex-wrap items-center justify-between gap-3">
          {officialUrl ? (
            <a
              href={officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] px-4 py-2 rounded-xl border border-gray-300 text-xs sm:text-sm font-semibold text-blue-700 hover:bg-blue-50/50 flex items-center gap-1.5 whitespace-nowrap"
            >
              {isRootInstitutionUrl
                ? 'Ir al sitio oficial de la institución →'
                : 'Ver información oficial del programa →'}
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
            </a>
          ) : (
            <span className="text-xs text-gray-500">
              Enlace oficial externo: Información no disponible en este registro
            </span>
          )}

          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-6 py-2 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
