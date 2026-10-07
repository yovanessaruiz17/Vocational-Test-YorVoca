import {
  AcademicConflict,
  AcademicSourceRecord,
  AcademicSourceType,
  CareerProgramMapping,
  ProgramOfficialContent,
} from './academicSource';
import { AcademicProgram, Institution } from './academic';

/**
 * Conserva tanto el valor crudo original de la fuente como el valor normalizado (Sección 30).
 */
export interface NormalizedField<T> {
  rawValue: string;
  normalizedValue: T;
}

export type IngestionRunStatus = 'running' | 'completed' | 'completed_with_warnings' | 'failed';

/**
 * Registro de auditoría de una ejecución del pipeline de ingestión académica (Sección 14 y 28).
 */
export interface AcademicIngestionRun {
  id: string;
  sourceType: AcademicSourceType;
  startedAt: string;
  finishedAt?: string;
  status: IngestionRunStatus;
  recordsFound: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsSkipped: number;
  recordsFailed: number;
  conflictsDetected: number;
  errorSummary?: string[];
}

/**
 * Datos crudos de entrada de una institución proveniente de SNIES / Datos Abiertos MEN.
 */
export interface RawSniesInstitutionInput {
  sniesInstitutionCode?: string;
  nit?: string;
  officialName: string;
  shortName?: string;
  academicCharacter: string;
  sector: string;
  department: string;
  municipality: string;
  status?: string;
  accreditation?: string;
  officialWebsiteUrl?: string;
  officialDomain?: string;
  sourceUrl: string;
  retrievedAt: string;
  lastVerifiedAt: string;
  sourceType?: AcademicSourceType;
  notes?: string;
}

/**
 * Datos crudos de entrada de un programa académico proveniente de SNIES / Datos Abiertos MEN / Portal Institucional.
 */
export interface RawSniesProgramInput {
  sniesProgramCode?: string;
  sniesInstitutionCode?: string;
  institutionOfficialName?: string;
  officialName: string;
  academicLevel: string;
  modality: string;
  department: string;
  municipality: string;
  status: string;
  officialProgramUrl?: string;
  sourceUrl: string;
  retrievedAt: string;
  lastVerifiedAt: string;
  sourceType?: AcademicSourceType;
  notes?: string;
}

/**
 * Datos crudos de contenido descriptivo extraído del sitio oficial de una institución (Fuente B).
 */
export interface RawOfficialWebsiteProgramInput {
  sniesProgramCode?: string;
  programId?: string;
  institutionId?: string;
  sourceUrl: string;
  commercialProgramName?: string;
  modalityText?: string;
  municipalityText?: string;
  statusText?: string;
  description?: string;
  duration?: string;
  tuition?: string;
  admissionRequirements?: string[];
  graduateProfile?: string;
  professionalProfile?: string;
  studyPlanUrl?: string;
  additionalInformation?: string;
  retrievedAt: string;
  lastVerifiedAt: string;
}

export interface IngestionPipelineInput {
  institutions: RawSniesInstitutionInput[];
  programs: RawSniesProgramInput[];
  officialContents?: RawOfficialWebsiteProgramInput[];
  careerMappings?: CareerProgramMapping[];
  referenceDateIso?: string;
}

export interface IngestionPipelineResult {
  run: AcademicIngestionRun;
  institutions: Institution[];
  programs: AcademicProgram[];
  sources: AcademicSourceRecord[];
  officialContents: ProgramOfficialContent[];
  conflicts: AcademicConflict[];
  careerMappings: CareerProgramMapping[];
}
