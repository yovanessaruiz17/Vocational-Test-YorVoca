import { ProgramOfficialContent } from '../../types/academic';
import { RawOfficialWebsiteProgramInput } from '../../types/ingestion';
import { verifyOfficialDomain } from './OfficialDomainValidator';
import { Institution } from '../../types/academic';

function sanitizeOptionalText(text?: string, maxLength = 600): string | undefined {
  if (!text || typeof text !== 'string') return undefined;
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) return undefined;
  return cleaned.length > maxLength ? `${cleaned.slice(0, maxLength - 1)}…` : cleaned;
}

/**
 * Normaliza el contenido descriptivo proveniente del sitio web oficial de una institución (Sección 9 y 31).
 *
 * Reglas:
 * - No almacena páginas completas; solo conserva fragmentos estructurados orientados al estudiante.
 * - La ausencia de un campo se representa como `undefined` y NUNCA con texto inventado.
 * - Verifica que `sourceUrl` (y `studyPlanUrl` si existe) pertenezca al dominio oficial de la institución.
 */
export function normalizeOfficialProgramContent(
  input: RawOfficialWebsiteProgramInput,
  programId: string,
  institution: Institution
): ProgramOfficialContent | null {
  const domainCheck = verifyOfficialDomain(institution, input.sourceUrl);
  if (!domainCheck.isValid) {
    return null;
  }

  let verifiedStudyPlanUrl: string | undefined;
  if (input.studyPlanUrl) {
    const planCheck = verifyOfficialDomain(institution, input.studyPlanUrl);
    if (planCheck.isValid) {
      verifiedStudyPlanUrl = input.studyPlanUrl.trim();
    }
  }

  const description = sanitizeOptionalText(input.description, 500);
  const duration = sanitizeOptionalText(input.duration, 120);
  const tuition = sanitizeOptionalText(input.tuition, 180);
  const graduateProfile = sanitizeOptionalText(input.graduateProfile, 450);
  const professionalProfile = sanitizeOptionalText(input.professionalProfile, 450);
  const modalityText = sanitizeOptionalText(input.modalityText, 100);
  const additionalInformation = sanitizeOptionalText(input.additionalInformation, 400);

  const admissionRequirements = Array.isArray(input.admissionRequirements)
    ? input.admissionRequirements
        .map((r) => sanitizeOptionalText(r, 200))
        .filter((r): r is string => Boolean(r))
    : undefined;

  const hasRichContent = Boolean(
    description ||
      duration ||
      tuition ||
      (admissionRequirements && admissionRequirements.length > 0) ||
      graduateProfile ||
      professionalProfile ||
      verifiedStudyPlanUrl
  );

  return {
    contentId: `content_${programId}`,
    programId,
    sourceUrl: input.sourceUrl.trim(),
    description,
    duration,
    tuition,
    admissionRequirements:
      admissionRequirements && admissionRequirements.length > 0
        ? admissionRequirements
        : undefined,
    graduateProfile,
    professionalProfile,
    studyPlanUrl: verifiedStudyPlanUrl,
    modalityText,
    additionalInformation,
    retrievedAt: input.retrievedAt,
    lastVerifiedAt: input.lastVerifiedAt,
    extractionStatus: hasRichContent ? 'verified' : 'partial',
  };
}
