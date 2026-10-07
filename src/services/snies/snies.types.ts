import {
  AcademicProgram,
  AcademicSearchFilters,
  AcademicSearchResult,
  AcademicSourceProvider,
  Institution,
  NormalizedStudentAcademicContext,
} from '../../types/academic';

export interface AcademicProviderSearchContext {
  studentContext?: NormalizedStudentAcademicContext;
  affinityByCareerId?: Record<string, number>;
}

/**
 * Contrato principal del proveedor académico (Sección 27).
 * La interfaz de usuario depende exclusivamente de esta abstracción y no de detalles internos de SNIES.
 */
export interface AcademicProvider {
  readonly providerName: AcademicSourceProvider;

  searchPrograms(
    filters: AcademicSearchFilters,
    context?: AcademicProviderSearchContext
  ): Promise<AcademicSearchResult>;

  getProgramById(programId: string): Promise<AcademicProgram | null>;

  getInstitutionById(institutionId: string): Promise<Institution | null>;
}

/**
 * Representación de un registro oficial ingerido desde SNIES (p. ej. archivo CSV/JSON oficial del MEN)
 * para ser transformado por `SniesAdapter`.
 */
export interface SniesVerifiedInstitutionRecord {
  codigoInstitucionSnies: string;
  nombreInstitucion: string;
  caracterAcademico: string;
  sector: string;
  municipioDomicilio: string;
  departamentoDomicilio: string;
  acreditacionAltaCalidad?: string;
  sitioWebOficial?: string;
  fechaVerificacion: string;
  urlFuenteOficial?: string;
}

export interface SniesVerifiedProgramRecord {
  codigoSniesPrograma: string;
  codigoInstitucionSnies: string;
  nombrePrograma: string;
  nivelFormacion: string;
  modalidad: string;
  municipioOferta: string;
  departamentoOferta: string;
  estadoPrograma: string;
  urlOficialPrograma?: string;
  fechaVerificacion: string;
  urlFuenteOficial?: string;
}
