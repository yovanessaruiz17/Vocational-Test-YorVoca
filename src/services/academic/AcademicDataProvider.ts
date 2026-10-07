import {
  AcademicProgram,
  AcademicSearchFilters,
  AcademicSearchResult,
  AcademicSourceProvider,
  AcademicSourceRecord,
  Institution,
} from '../../types/academic';
import {
  AcademicProvider,
  AcademicProviderSearchContext,
} from '../snies/snies.types';

/**
 * Abstracción principal `AcademicDataProvider` (Sección 20 y 39).
 * Extiende `AcademicProvider` de F5 manteniendo compatibilidad total hacia atrás.
 */
export interface AcademicDataProvider extends AcademicProvider {
  readonly providerName: AcademicSourceProvider;

  searchPrograms(
    filters: AcademicSearchFilters,
    context?: AcademicProviderSearchContext
  ): Promise<AcademicSearchResult>;

  getProgramById(programId: string): Promise<AcademicProgram | null>;

  getInstitutionById(institutionId: string): Promise<Institution | null>;

  getSourceById?(sourceId: string): Promise<AcademicSourceRecord | null>;
}
