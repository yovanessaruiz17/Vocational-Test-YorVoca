import React from 'react';
import {
  AcademicInstitutionType,
  AcademicLevel,
  AcademicModality,
  AcademicProgramStatus,
  AcademicSector,
  AcademicSourceProvider,
  EnrichedAcademicProgram,
} from '../../../types/academic';
import { ExternalLink } from 'lucide-react';

export const MODALITY_LABELS: Record<AcademicModality, string> = {
  presential: 'Presencial',
  virtual: 'Virtual',
  hybrid: 'Híbrida',
  unknown: 'No especificada',
};

export const LEVEL_LABELS: Record<AcademicLevel, string> = {
  technical_professional: 'Técnico profesional',
  technological: 'Tecnológico',
  professional: 'Profesional universitario',
  specialization: 'Especialización',
  masters: 'Maestría',
  doctorate: 'Doctorado',
  other: 'Otro nivel',
};

export const INSTITUTION_TYPE_LABELS: Record<AcademicInstitutionType, string> = {
  university: 'Universidad',
  university_institution: 'Institución Universitaria',
  technological: 'Institución Tecnológica',
  technical: 'Técnica Profesional',
  technical_professional: 'Técnica Profesional',
  sena: 'SENA',
  other: 'Otra institución',
};

export const SECTOR_LABELS: Record<AcademicSector, string> = {
  public: 'Pública',
  private: 'Privada',
  mixed: 'Mixta',
  unknown: 'Sector no especificado',
};

export const STATUS_LABELS: Record<AcademicProgramStatus, string> = {
  active: 'Activo',
  inactive: 'Inactivo',
  unknown: 'Estado sin verificar',
};

export const SOURCE_PROVIDER_LABELS: Record<AcademicSourceProvider, string> = {
  snies: 'Fuente oficial SNIES',
  men_open_data: 'Datos Abiertos MEN',
  institution_official: 'Sitio oficial institucional',
  institution_website: 'Sitio oficial institucional',
  mock: 'Datos de demostración',
};

export function formatVerificationDate(isoDate?: string): string {
  if (!isoDate) return 'Sin fecha de verificación';
  try {
    const d = new Date(isoDate);
    if (Number.isNaN(d.getTime())) return isoDate;
    const day = String(d.getUTCDate()).padStart(2, '0');
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const year = d.getUTCFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return isoDate;
  }
}

export function getProgramTrustIndicator(item: EnrichedAcademicProgram): {
  label: string;
  tone: 'verified' | 'partial' | 'stale' | 'mock';
} {
  const { program } = item;
  const status =
    program.sourceStatus ??
    program.source.verificationStatus ??
    (program.source.provider === 'mock' ? 'mock' : 'verified');

  if (program.source.provider === 'mock' || status === 'mock') {
    return { label: 'Datos de demostración', tone: 'mock' };
  }
  if (status === 'stale') {
    return { label: 'Información pendiente de re-verificación', tone: 'stale' };
  }
  if (status === 'unavailable') {
    return { label: 'Fuente temporalmente no disponible', tone: 'stale' };
  }
  if (status === 'partial' || !program.sniesCode) {
    return { label: 'Información oficial parcial', tone: 'partial' };
  }
  return { label: '✓ Información oficial verificada', tone: 'verified' };
}

interface ProgramCardProps {
  item: EnrichedAcademicProgram;
  onSelectProgram: (item: EnrichedAcademicProgram) => void;
  hideInstitutionHeader?: boolean;
}

export const ProgramCard: React.FC<ProgramCardProps> = ({
  item,
  onSelectProgram,
  hideInstitutionHeader = false,
}) => {
  const { program, institution, primaryMatch } = item;
  const trust = getProgramTrustIndicator(item);
  const officialUrl = program.officialProgramUrl ?? program.officialUrl;
  const instWebsiteUrl =
    institution.officialWebsiteUrl ?? institution.officialWebsite;
  const isRootInstitutionUrl = Boolean(
    officialUrl &&
      instWebsiteUrl &&
      officialUrl.replace(/\/+$/, '') === instWebsiteUrl.replace(/\/+$/, '')
  );

  const matchLabel =
    primaryMatch?.matchType === 'direct'
      ? 'Programa directamente relacionado'
      : 'Programa relacionado con esta carrera';

  return (
    <article className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 hover:border-gray-300 transition-colors space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="space-y-1">
          {primaryMatch && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
              <span
                className={
                  primaryMatch.matchType === 'direct'
                    ? 'font-semibold text-blue-600'
                    : 'font-medium text-gray-700'
                }
              >
                {matchLabel}
              </span>
              <span aria-hidden="true">·</span>
              <span>Carrera afín: {primaryMatch.careerName}</span>
              {typeof primaryMatch.careerAffinityPercent === 'number' && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">
                    {primaryMatch.careerAffinityPercent}% afinidad en tu perfil
                  </span>
                </>
              )}
            </div>
          )}

          <h3 className="text-lg sm:text-xl font-bold text-gray-900">
            {program.officialName ?? program.name}
          </h3>

          {!hideInstitutionHeader && (
            <div className="text-sm font-medium text-gray-700">
              {institution.officialName ?? institution.name}
            </div>
          )}
        </div>

        <div className="sm:text-right shrink-0 space-y-0.5 text-xs text-gray-500">
          <div className="font-mono tabular-nums text-gray-700">
            {program.sniesCode
              ? `Código SNIES: ${program.sniesCode}`
              : 'Código SNIES no disponible en esta fuente'}
          </div>
          <div>Estado: {STATUS_LABELS[program.status]}</div>
        </div>
      </div>

      {/* Metadatos del programa en texto limpio sin cápsulas artificiales */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-gray-600 pt-1 border-t border-gray-100">
        <span className="font-medium text-gray-800">
          {program.city}, {program.department}
        </span>
        <span aria-hidden="true">·</span>
        <span>Modalidad {MODALITY_LABELS[program.modality]}</span>
        <span aria-hidden="true">·</span>
        <span>{LEVEL_LABELS[program.academicLevel]}</span>
        <span aria-hidden="true">·</span>
        <span>{INSTITUTION_TYPE_LABELS[institution.institutionType]}</span>
        <span aria-hidden="true">·</span>
        <span>{SECTOR_LABELS[institution.sector]}</span>
      </div>

      {item.preferenceMatchLabels && item.preferenceMatchLabels.length > 0 && (
        <div className="text-xs text-emerald-800 bg-emerald-50/70 border border-emerald-100 rounded-xl px-3 py-2 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-semibold">Coincide con tus preferencias:</span>
          <span>{item.preferenceMatchLabels.join(' · ')}</span>
        </div>
      )}

      {primaryMatch?.rationale && (
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
          {primaryMatch.rationale}
        </p>
      )}

      {/* Pie con indicador de confianza, fecha DD/MM/YYYY y enlace oficial */}
      <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <span
            className={
              trust.tone === 'mock'
                ? 'font-semibold text-amber-800'
                : trust.tone === 'verified'
                ? 'font-semibold text-emerald-800'
                : 'font-medium text-blue-800'
            }
          >
            {trust.label}
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Última verificación:{' '}
            {formatVerificationDate(
              program.lastVerifiedAt ?? program.source.lastVerifiedAt
            )}
          </span>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {officialUrl && (
            <a
              href={officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[40px] px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              {isRootInstitutionUrl
                ? 'Sitio oficial institucional'
                : 'Ver programa oficial'}
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          )}

          <button
            type="button"
            onClick={() => onSelectProgram(item)}
            className="min-h-[40px] px-4 py-2 rounded-xl bg-blue-600 text-white text-xs sm:text-sm font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            Ver detalle
          </button>
        </div>
      </div>
    </article>
  );
};
