import { AcademicDataProvider } from './AcademicDataProvider';
import { defaultLocalAcademicProvider } from './LocalAcademicProvider';
import { MockAcademicProvider } from './MockAcademicProvider';

export type { AcademicDataProvider } from './AcademicDataProvider';
export {
  AcademicRepository,
  defaultAcademicRepository,
} from './AcademicRepository';
export {
  defaultLocalAcademicProvider,
  LocalAcademicProvider,
  OFFLINE_ACADEMIC_CACHE_KEY,
  type LocalAcademicProviderOptions,
} from './LocalAcademicProvider';
export {
  MockAcademicProvider,
  type MockAcademicProviderOptions,
} from './MockAcademicProvider';
export { runAcademicIngestionPipeline } from './AcademicIngestionPipeline';
export {
  indexSourcesById,
  toCareerAcademicMapping,
} from './academicSources';
export {
  buildInitialAcademicFilters,
  filterAndSortAcademicPrograms,
  normalizeStudentContextForAcademic,
} from './academicFilters';

const fallbackMockProvider = new MockAcademicProvider();

/**
 * Devuelve `LocalAcademicProvider` cuando existen datos académicos reales verificados en el repositorio,
 * o `MockAcademicProvider` como fallback controlado (Sección 19, 20 y 25).
 */
export function getAcademicExplorerProvider(): AcademicDataProvider {
  if (defaultLocalAcademicProvider.isReady()) {
    return defaultLocalAcademicProvider;
  }
  return fallbackMockProvider;
}
