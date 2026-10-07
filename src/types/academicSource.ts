export type AcademicSourceType =
  | 'snies'
  | 'men_open_data'
  | 'institution_website'
  | 'mock';

export type SourceVerificationStatus =
  | 'verified'
  | 'stale'
  | 'unavailable'
  | 'mock';

export type ContentExtractionStatus =
  | 'verified'
  | 'partial'
  | 'unavailable';

/**
 * Entidad explícita de procedencia y trazabilidad de fuentes académicas (Sección 6).
 * Permite rastrear qué fuente respalda cada institución, programa o contenido descriptivo.
 */
export interface AcademicSourceRecord {
  sourceId: string;
  type: AcademicSourceType;
  sourceUrl: string;
  institutionId?: string;
  programId?: string;
  verificationStatus: SourceVerificationStatus;
  retrievedAt?: string;
  lastVerifiedAt?: string;
  contentHash?: string;
  notes?: string;
}

/**
 * Entidad separada para contenido descriptivo enriquecido proveniente del sitio web oficial
 * de la institución (Sección 9).
 * La ausencia de información se representa con `undefined` y NUNCA con texto inventado.
 */
export interface ProgramOfficialContent {
  contentId: string;
  programId: string;
  sourceUrl: string;
  description?: string;
  duration?: string;
  tuition?: string;
  admissionRequirements?: string[];
  graduateProfile?: string;
  professionalProfile?: string;
  studyPlanUrl?: string;
  modalityText?: string;
  additionalInformation?: string;
  retrievedAt: string;
  lastVerifiedAt: string;
  contentHash?: string;
  extractionStatus: ContentExtractionStatus;
}

/**
 * Conflicto detectado entre fuentes complementarias (Sección 17), por ejemplo:
 * SNIES registra modalidad "Presencial" mientras el sitio web institucional indica "Virtual".
 * Nunca se sobrescribe silenciosamente la autoridad regulatoria de SNIES.
 */
export interface AcademicConflict {
  conflictId: string;
  institutionId?: string;
  programId?: string;
  field: string;
  sourceA: string;
  valueA: unknown;
  sourceB: string;
  valueB: unknown;
  detectedAt: string;
  resolved: boolean;
  resolution?: string;
}

/**
 * Entidad explícita de relación Career -> AcademicProgram (Sección 15).
 */
export interface CareerProgramMapping {
  id: string;
  careerId: string;
  programId: string;
  matchType: 'direct_match' | 'related_match';
  confidence: number;
  reason?: string;
  createdAt?: string;
}
