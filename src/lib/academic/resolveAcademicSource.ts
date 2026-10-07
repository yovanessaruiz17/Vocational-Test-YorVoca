import {
  AcademicConflict,
  AcademicProgram,
  AcademicSourceType,
  Institution,
  ProgramOfficialContent,
  SourceVerificationStatus,
} from '../../types/academic';
import { RawOfficialWebsiteProgramInput } from '../../types/ingestion';
import { detectAcademicConflicts } from './detectAcademicConflicts';
import { verifyOfficialDomain } from './verifyOfficialDomain';

/**
 * Umbral por defecto para considerar una verificación como desactualizada (`stale`): 180 días.
 */
export const DEFAULT_STALE_THRESHOLD_DAYS = 180;

/**
 * Determina el estado de verificación (`verified` | `stale` | `unavailable` | `mock`)
 * según el tipo de fuente, disponibilidad de URL/datos y antigüedad de `lastVerifiedAt` (Sección 18).
 *
 * REGLA SECCIÓN 19 y 36:
 * Una fuente `mock` NUNCA puede obtener estado `verified`; siempre devuelve `mock`.
 */
export function computeSourceVerificationStatus(options: {
  sourceType: AcademicSourceType;
  lastVerifiedAt?: string;
  isSourceAvailable?: boolean;
  referenceDateIso?: string;
  staleThresholdDays?: number;
}): SourceVerificationStatus {
  const {
    sourceType,
    lastVerifiedAt,
    isSourceAvailable = true,
    referenceDateIso,
    staleThresholdDays = DEFAULT_STALE_THRESHOLD_DAYS,
  } = options;

  if (sourceType === 'mock') {
    return 'mock';
  }

  if (!isSourceAvailable || !lastVerifiedAt) {
    return 'unavailable';
  }

  const verifiedMs = Date.parse(lastVerifiedAt);
  if (Number.isNaN(verifiedMs)) {
    return 'unavailable';
  }

  const refMs = referenceDateIso ? Date.parse(referenceDateIso) : Date.now();
  const ageDays = (refMs - verifiedMs) / (1000 * 60 * 60 * 24);

  if (ageDays > staleThresholdDays) {
    return 'stale';
  }

  return 'verified';
}

export interface MergeProgramSourcesResult {
  program: AcademicProgram;
  officialContent: ProgramOfficialContent | null;
  conflicts: AcademicConflict[];
}

/**
 * Aplica las reglas de precedencia entre Fuentes (Sección 16):
 *
 * - SNIES / MEN conserva autoridad regulatoria en:
 *   - `sniesCode`
 *   - existencia y `status` oficial (`active` | `inactive` | `unknown`)
 *   - `institutionId` / identidad institucional
 *   - `city` / `municipality` y `department` registrados
 *   - `modality` oficial registrada
 *   - `academicLevel`
 *
 * - SITIO WEB OFICIAL conserva autoridad en contenido descriptivo orientado al estudiante:
 *   - `description`
 *   - `duration`
 *   - `tuition`
 *   - `admissionRequirements`
 *   - `graduateProfile`
 *   - `professionalProfile`
 *   - `studyPlanUrl`
 *   - `officialProgramUrl` / `officialUrl` (siempre que pase `verifyOfficialDomain`)
 *
 * Si hay contradicción (p. ej. SNIES dice `presential` y la web dice `virtual`),
 * NO sobrescribe el campo regulatorio de SNIES y registra un `AcademicConflict`.
 */
export function resolveAndMergeProgramSources(params: {
  sniesProgram: AcademicProgram;
  institution: Institution;
  websiteInput?: RawOfficialWebsiteProgramInput;
  referenceDateIso?: string;
}): MergeProgramSourcesResult {
  const { sniesProgram, institution, websiteInput, referenceDateIso } = params;

  if (!websiteInput) {
    return {
      program: sniesProgram,
      officialContent: sniesProgram.officialContent ?? null,
      conflicts: sniesProgram.conflicts ?? [],
    };
  }

  // Verificar que la URL del sitio web institucional pertenezca al dominio oficial de la institución
  const domainCheck = verifyOfficialDomain(institution, websiteInput.sourceUrl);
  if (!domainCheck.isValid) {
    return {
      program: sniesProgram,
      officialContent: null,
      conflicts: sniesProgram.conflicts ?? [],
    };
  }

  // Verificar también studyPlanUrl si fue suministrado
  let verifiedStudyPlanUrl: string | undefined;
  if (websiteInput.studyPlanUrl) {
    const planDomainCheck = verifyOfficialDomain(institution, websiteInput.studyPlanUrl);
    if (planDomainCheck.isValid) {
      verifiedStudyPlanUrl = websiteInput.studyPlanUrl;
    }
  }

  // Detectar conflictos sin sobrescribir los campos regulatorios de SNIES
  const detectedConflicts = detectAcademicConflicts(
    sniesProgram,
    websiteInput,
    referenceDateIso ?? websiteInput.retrievedAt
  );

  const hasDescriptiveFields = Boolean(
    websiteInput.description ||
      websiteInput.duration ||
      websiteInput.tuition ||
      (websiteInput.admissionRequirements &&
        websiteInput.admissionRequirements.length > 0) ||
      websiteInput.graduateProfile ||
      websiteInput.professionalProfile ||
      verifiedStudyPlanUrl
  );

  const officialContent: ProgramOfficialContent = {
    contentId: `content_${sniesProgram.programId}`,
    programId: sniesProgram.programId,
    sourceUrl: websiteInput.sourceUrl,
    description: websiteInput.description?.trim() || undefined,
    duration: websiteInput.duration?.trim() || undefined,
    tuition: websiteInput.tuition?.trim() || undefined,
    admissionRequirements:
      websiteInput.admissionRequirements && websiteInput.admissionRequirements.length > 0
        ? websiteInput.admissionRequirements
        : undefined,
    graduateProfile: websiteInput.graduateProfile?.trim() || undefined,
    professionalProfile: websiteInput.professionalProfile?.trim() || undefined,
    studyPlanUrl: verifiedStudyPlanUrl,
    modalityText: websiteInput.modalityText?.trim() || undefined,
    additionalInformation: websiteInput.additionalInformation?.trim() || undefined,
    retrievedAt: websiteInput.retrievedAt,
    lastVerifiedAt: websiteInput.lastVerifiedAt,
    extractionStatus: hasDescriptiveFields ? 'verified' : 'partial',
  };

  // El programa conserva INTACTOS todos sus campos regulatorios de SNIES,
  // y enlaza la URL oficial verificada + el contenido descriptivo institucional + conflictos
  const mergedProgram: AcademicProgram = {
    ...sniesProgram,
    // Datos regulatorios: autoridad exclusiva de SNIES
    sniesCode: sniesProgram.sniesCode,
    status: sniesProgram.status,
    modality: sniesProgram.modality,
    city: sniesProgram.city,
    municipality: sniesProgram.municipality ?? sniesProgram.city,
    department: sniesProgram.department,
    academicLevel: sniesProgram.academicLevel,
    // Enlace oficial al programa verificado por dominio institucional
    officialUrl: websiteInput.sourceUrl,
    officialProgramUrl: websiteInput.sourceUrl,
    officialContent,
    conflicts: [...(sniesProgram.conflicts ?? []), ...detectedConflicts],
  };

  return {
    program: mergedProgram,
    officialContent,
    conflicts: mergedProgram.conflicts ?? [],
  };
}
