import {
  MOCK_INSTITUTIONS,
  MOCK_INSTITUTIONS_BY_ID,
} from '../../data/academic/mockInstitutions';
import {
  MOCK_CAREER_ACADEMIC_MAPPINGS,
  MOCK_PROGRAMS,
  MOCK_PROGRAMS_BY_ID,
} from '../../data/academic/mockPrograms';
import {
  filterAndSortAcademicPrograms,
  validateAcademicProgram,
  validateInstitution,
} from '../../lib/academic';
import {
  AcademicProgram,
  AcademicSearchFilters,
  AcademicSearchResult,
  CareerAcademicMapping,
  Institution,
} from '../../types/academic';
import {
  AcademicProvider,
  AcademicProviderSearchContext,
} from './snies.types';

export interface MockAcademicProviderOptions {
  institutions?: Institution[];
  programs?: AcademicProgram[];
  mappings?: CareerAcademicMapping[];
  simulateError?: boolean;
}

/**
 * Proveedor académico de desarrollo (`provider = "mock"`).
 *
 * REGLA SECCIONES 26, 28 y 29:
 * - Etiqueta explícitamente cada registro y resultado como `provider: "mock"` y `status: "mock"`.
 * - Jamás presenta datos mock como si fueran registros oficiales de SNIES.
 * - Valida todos los modelos antes de procesarlos.
 */
export class MockAcademicProvider implements AcademicProvider {
  public readonly providerName = 'mock' as const;
  private readonly institutions: Institution[];
  private readonly programs: AcademicProgram[];
  private readonly mappings: CareerAcademicMapping[];
  private readonly simulateError: boolean;

  constructor(options: MockAcademicProviderOptions = {}) {
    this.institutions = options.institutions ?? MOCK_INSTITUTIONS;
    this.programs = options.programs ?? MOCK_PROGRAMS;
    this.mappings = options.mappings ?? MOCK_CAREER_ACADEMIC_MAPPINGS;
    this.simulateError = Boolean(options.simulateError);
  }

  public async searchPrograms(
    filters: AcademicSearchFilters,
    context?: AcademicProviderSearchContext
  ): Promise<AcademicSearchResult> {
    if (this.simulateError) {
      return {
        status: 'error',
        provider: 'mock',
        programs: [],
        institutions: [],
        totalProgramsCount: 0,
        totalInstitutionsCount: 0,
        appliedFilters: filters,
        errorMessage: 'No fue posible cargar los programas académicos en este momento.',
      };
    }

    const validInstitutionsById: Record<string, Institution> = {};
    for (const inst of this.institutions) {
      const check = validateInstitution(inst);
      if (check.isValid && check.institution) {
        validInstitutionsById[inst.institutionId] = check.institution;
      }
    }

    const validPrograms: AcademicProgram[] = [];
    for (const prog of this.programs) {
      const check = validateAcademicProgram(prog);
      if (check.isValid && check.program && validInstitutionsById[prog.institutionId]) {
        validPrograms.push(check.program);
      }
    }

    const { programs: filteredPrograms, institutions: filteredInstitutions } =
      filterAndSortAcademicPrograms({
        programs: validPrograms,
        institutionsById: validInstitutionsById,
        mappings: this.mappings,
        filters,
        studentContext: context?.studentContext,
        affinityByCareerId: context?.affinityByCareerId,
      });

    const nowIso = new Date().toISOString();

    return {
      status: filteredPrograms.length > 0 ? 'mock' : 'empty',
      provider: 'mock',
      programs: filteredPrograms,
      institutions: filteredInstitutions,
      totalProgramsCount: filteredPrograms.length,
      totalInstitutionsCount: filteredInstitutions.length,
      appliedFilters: filters,
      cacheMetadata: {
        retrievedAt: nowIso,
        lastVerifiedAt: '2026-10-06T12:00:00.000Z',
        expiresAt: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
        provider: 'mock',
      },
      notice:
        'Datos de demostración (provider = mock). Las instituciones "Demo YorVoca" permiten probar la búsqueda y el filtrado mientras se conecta un dataset oficial SNIES.',
    };
  }

  public async getProgramById(programId: string): Promise<AcademicProgram | null> {
    return MOCK_PROGRAMS_BY_ID[programId] ?? null;
  }

  public async getInstitutionById(institutionId: string): Promise<Institution | null> {
    return MOCK_INSTITUTIONS_BY_ID[institutionId] ?? null;
  }
}
