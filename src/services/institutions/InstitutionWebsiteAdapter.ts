import {
  computeSourceVerificationStatus,
  resolveAndMergeProgramSources,
  verifyOfficialDomain,
} from '../../lib/academic';
import {
  AcademicConflict,
  AcademicProgram,
  AcademicSourceRecord,
  Institution,
  ProgramOfficialContent,
} from '../../types/academic';
import { RawOfficialWebsiteProgramInput } from '../../types/ingestion';
import { normalizeOfficialProgramContent } from './ProgramContentNormalizer';

export interface InstitutionWebsiteEnrichmentResult {
  accepted: boolean;
  program: AcademicProgram;
  officialContent: ProgramOfficialContent | null;
  sourceRecord: AcademicSourceRecord | null;
  conflicts: AcademicConflict[];
  rejectionReason?: string;
}

/**
 * Adaptador para vincular información del sitio web oficial de una institución (Fuente B)
 * a un programa previamente validado por SNIES/MEN (Fuente A) (Sección 11, 12 y 16).
 *
 * IMPORTANTE:
 * - No realiza scraping desde el navegador React.
 * - Rechaza cualquier URL cuyo dominio no coincida con el dominio oficial registrado de la institución.
 * - Nunca reemplaza los campos regulatorios de SNIES (código, estado, modalidad registrada, municipio).
 * - Detecta y registra conflictos académicos cuando el sitio web difiere de SNIES.
 */
export class InstitutionWebsiteAdapter {
  public enrichProgramWithOfficialWebsite(params: {
    sniesProgram: AcademicProgram;
    institution: Institution;
    websiteInput: RawOfficialWebsiteProgramInput;
    referenceDateIso?: string;
  }): InstitutionWebsiteEnrichmentResult {
    const { sniesProgram, institution, websiteInput, referenceDateIso } = params;

    const domainCheck = verifyOfficialDomain(institution, websiteInput.sourceUrl);
    if (!domainCheck.isValid) {
      return {
        accepted: false,
        program: sniesProgram,
        officialContent: null,
        sourceRecord: null,
        conflicts: sniesProgram.conflicts ?? [],
        rejectionReason:
          domainCheck.reason ??
          'La URL proporcionada no pertenece al dominio oficial de la institución.',
      };
    }

    const normalizedContent = normalizeOfficialProgramContent(
      websiteInput,
      sniesProgram.programId,
      institution
    );

    const merged = resolveAndMergeProgramSources({
      sniesProgram,
      institution,
      websiteInput,
      referenceDateIso,
    });

    const verificationStatus = computeSourceVerificationStatus({
      sourceType: 'institution_website',
      lastVerifiedAt: websiteInput.lastVerifiedAt,
      isSourceAvailable: true,
      referenceDateIso,
    });

    const sourceId = `src_${sniesProgram.programId}_institution_website`;
    const sourceRecord: AcademicSourceRecord = {
      sourceId,
      type: 'institution_website',
      sourceUrl: websiteInput.sourceUrl.trim(),
      institutionId: institution.institutionId,
      programId: sniesProgram.programId,
      verificationStatus,
      retrievedAt: websiteInput.retrievedAt,
      lastVerifiedAt: websiteInput.lastVerifiedAt,
    };

    const updatedProgram: AcademicProgram = {
      ...merged.program,
      officialContent: normalizedContent ?? merged.officialContent ?? undefined,
    };

    return {
      accepted: true,
      program: updatedProgram,
      officialContent: normalizedContent ?? merged.officialContent,
      sourceRecord,
      conflicts: merged.conflicts,
    };
  }
}
