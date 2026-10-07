import {
  AcademicSearchFilters,
  AcademicSearchResult,
} from '../../types/academic';
import { MockAcademicProvider } from './mockAcademicProvider';
import { SniesAdapter } from './snies.adapter';
import { SniesClient } from './snies.client';
import {
  AcademicProvider,
  AcademicProviderSearchContext,
} from './snies.types';

export {
  MockAcademicProvider,
  type MockAcademicProviderOptions,
} from './mockAcademicProvider';
export {
  adaptSniesInstitution,
  adaptSniesProgram,
  SniesAdapter,
} from './snies.adapter';
export { SniesClient, type SniesDatasetSnapshot } from './snies.client';
export type {
  AcademicProvider,
  AcademicProviderSearchContext,
  SniesVerifiedInstitutionRecord,
  SniesVerifiedProgramRecord,
} from './snies.types';

interface CachedSearchEntry {
  result: AcademicSearchResult;
  retrievedAt: string;
  lastVerifiedAt?: string;
  expiresAtMs: number;
}

const ACADEMIC_CACHE_TTL_MS = 1000 * 60 * 15; // 15 minutos (no indefinido, Sección 35)
const memorySearchCache = new Map<string, CachedSearchEntry>();

export function invalidateAcademicSearchCache(): void {
  memorySearchCache.clear();
}

const defaultSniesClient = new SniesClient();
const defaultSniesAdapter = new SniesAdapter(defaultSniesClient);
const defaultMockProvider = new MockAcademicProvider();

/**
 * Devuelve el proveedor académico activo.
 * Si `SniesClient` cuenta con un dataset oficial verificado conectado, utiliza `SniesAdapter`.
 * De lo contrario, utiliza `MockAcademicProvider` identificando explícitamente `provider = "mock"`.
 */
export function getActiveAcademicProvider(): AcademicProvider {
  if (defaultSniesClient.isConfigured()) {
    return defaultSniesAdapter;
  }
  return defaultMockProvider;
}

/**
 * Ejecuta una búsqueda académica a través del `AcademicProvider` con soporte de caché temporal
 * que conserva `retrievedAt` y `lastVerifiedAt` y permite invalidación explícita (Sección 35).
 */
export async function searchAcademicOffer(
  filters: AcademicSearchFilters,
  context?: AcademicProviderSearchContext,
  options?: {
    provider?: AcademicProvider;
    bypassCache?: boolean;
  }
): Promise<AcademicSearchResult> {
  const provider = options?.provider ?? getActiveAcademicProvider();
  const cacheKey = JSON.stringify({
    provider: provider.providerName,
    filters,
    context,
  });

  if (!options?.bypassCache) {
    const cached = memorySearchCache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAtMs) {
      return cached.result;
    }
    if (cached) {
      memorySearchCache.delete(cacheKey);
    }
  }

  const result = await provider.searchPrograms(filters, context);

  if (result.status !== 'error') {
    const nowIso = new Date().toISOString();
    memorySearchCache.set(cacheKey, {
      result,
      retrievedAt: result.cacheMetadata?.retrievedAt ?? nowIso,
      lastVerifiedAt: result.cacheMetadata?.lastVerifiedAt,
      expiresAtMs: Date.now() + ACADEMIC_CACHE_TTL_MS,
    });
  }

  return result;
}
