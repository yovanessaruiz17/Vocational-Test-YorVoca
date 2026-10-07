import {
  filterAndSortAcademicPrograms,
  validateAcademicProgram,
  validateInstitution,
} from '../../lib/academic';
import {
  AcademicProgram,
  AcademicSearchFilters,
  AcademicSearchResult,
  AcademicSourceRecord,
  Institution,
} from '../../types/academic';
import { AcademicProviderSearchContext } from '../snies/snies.types';
import { AcademicDataProvider } from './AcademicDataProvider';
import {
  AcademicRepository,
  defaultAcademicRepository,
} from './AcademicRepository';

export const OFFLINE_ACADEMIC_CACHE_KEY = 'yorvoca_academic_verified_cache_v1';

interface OfflineAcademicSnapshot {
  savedAt: string;
  lastVerifiedAt: string;
  institutions: Institution[];
  programs: AcademicProgram[];
}

function saveOfflineSnapshot(snapshot: OfflineAcademicSnapshot): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(
        OFFLINE_ACADEMIC_CACHE_KEY,
        JSON.stringify(snapshot)
      );
    }
  } catch {
    // Ignorar errores de cuota de localStorage
  }
}

function loadOfflineSnapshot(): OfflineAcademicSnapshot | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const raw = window.localStorage.getItem(OFFLINE_ACADEMIC_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<OfflineAcademicSnapshot>;
    if (
      !parsed ||
      !Array.isArray(parsed.institutions) ||
      !Array.isArray(parsed.programs)
    ) {
      return null;
    }
    return parsed as OfflineAcademicSnapshot;
  } catch {
    return null;
  }
}

export interface LocalAcademicProviderOptions {
  repository?: AcademicRepository;
  simulateOfflineFromCache?: boolean;
}

/**
 * `LocalAcademicProvider` (Sección 20, 25 y 42):
 * Consume el repositorio de datos académicos reales y verificados (SNIES/MEN + sitios oficiales),
 * sin exponer detalles de scraping, SQL ni credenciales al frontend.
 *
 * Además mantiene una copia validada en `localStorage` para soporte PWA Offline (Sección 42),
 * distinguiendo explícitamente cuando los datos provienen del almacenamiento local offline.
 */
export class LocalAcademicProvider implements AcademicDataProvider {
  public readonly providerName = 'snies' as const;
  private readonly repository: AcademicRepository;
  private readonly simulateOfflineFromCache: boolean;

  constructor(options: LocalAcademicProviderOptions = {}) {
    this.repository = options.repository ?? defaultAcademicRepository;
    this.simulateOfflineFromCache = Boolean(options.simulateOfflineFromCache);
  }

  public isReady(): boolean {
    return this.repository.hasVerifiedData();
  }

  public async searchPrograms(
    filters: AcademicSearchFilters,
    context?: AcademicProviderSearchContext
  ): Promise<AcademicSearchResult> {
    try {
      let rawInstitutions = this.repository.getAllInstitutions();
      let rawPrograms = this.repository.getAllPrograms();
      let lastVerifiedAt = this.repository.getLastVerifiedAt();
      let isFromOfflineCache = false;

      const isBrowserOffline =
        this.simulateOfflineFromCache ||
        (typeof navigator !== 'undefined' && navigator.onLine === false);

      if (isBrowserOffline) {
        const cached = loadOfflineSnapshot();
        if (cached && cached.institutions.length > 0 && cached.programs.length > 0) {
          rawInstitutions = cached.institutions;
          rawPrograms = cached.programs;
          lastVerifiedAt = cached.lastVerifiedAt;
          isFromOfflineCache = true;
        }
      } else if (rawInstitutions.length > 0 && rawPrograms.length > 0) {
        saveOfflineSnapshot({
          savedAt: new Date().toISOString(),
          lastVerifiedAt,
          institutions: rawInstitutions,
          programs: rawPrograms,
        });
      }

      const validInstitutionsById: Record<string, Institution> = {};
      for (const inst of rawInstitutions) {
        const check = validateInstitution(inst);
        if (check.isValid && check.institution) {
          validInstitutionsById[inst.institutionId] = check.institution;
        }
      }

      const validPrograms: AcademicProgram[] = [];
      for (const prog of rawPrograms) {
        const inst = validInstitutionsById[prog.institutionId];
        const check = validateAcademicProgram(prog, inst);
        if (check.isValid && check.program && inst) {
          validPrograms.push(check.program);
        }
      }

      const {
        programs: filteredPrograms,
        institutions: filteredInstitutions,
        unfilteredCareerProgramsCount,
      } = filterAndSortAcademicPrograms({
        programs: validPrograms,
        institutionsById: validInstitutionsById,
        mappings: this.repository.getCareerAcademicMappings(),
        filters,
        studentContext: context?.studentContext,
        affinityByCareerId: context?.affinityByCareerId,
      });

      const nowIso = new Date().toISOString();

      return {
        status: filteredPrograms.length > 0 ? 'ready' : 'empty',
        provider: 'snies',
        programs: filteredPrograms,
        institutions: filteredInstitutions,
        totalProgramsCount: filteredPrograms.length,
        totalInstitutionsCount: filteredInstitutions.length,
        unfilteredCareerProgramsCount,
        appliedFilters: filters,
        cacheMetadata: {
          retrievedAt: nowIso,
          lastVerifiedAt,
          expiresAt: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
          provider: 'snies',
          isFromOfflineCache,
        },
        notice: isFromOfflineCache
          ? 'Modo sin conexión (PWA): mostrando datos académicos verificados almacenados localmente en este dispositivo.'
          : 'Información académica real verificada mediante fuentes oficiales SNIES/MEN y portales institucionales (.edu.co).',
      };
    } catch (error) {
      return {
        status: 'error',
        provider: 'snies',
        programs: [],
        institutions: [],
        totalProgramsCount: 0,
        totalInstitutionsCount: 0,
        appliedFilters: filters,
        errorMessage:
          error instanceof Error
            ? error.message
            : 'No fue posible consultar el catálogo académico verificado.',
      };
    }
  }

  public async getProgramById(programId: string): Promise<AcademicProgram | null> {
    return this.repository.getProgramById(programId);
  }

  public async getInstitutionById(institutionId: string): Promise<Institution | null> {
    return this.repository.getInstitutionById(institutionId);
  }

  public async getSourceById(
    sourceId: string
  ): Promise<AcademicSourceRecord | null> {
    return this.repository.getSourceById(sourceId);
  }
}

export const defaultLocalAcademicProvider = new LocalAcademicProvider();
