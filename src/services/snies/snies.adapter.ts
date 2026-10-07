import {
  filterAndSortAcademicPrograms,
  isValidHttpUrl,
  normalizeAcademicText,
  validateAcademicProgram,
  validateInstitution,
} from '../../lib/academic';
import {
  AcademicInstitutionType,
  AcademicLevel,
  AcademicModality,
  AcademicProgram,
  AcademicProgramStatus,
  AcademicSearchFilters,
  AcademicSearchResult,
  AcademicSector,
  CareerAcademicMapping,
  Institution,
} from '../../types/academic';
import { SniesClient } from './snies.client';
import {
  AcademicProvider,
  AcademicProviderSearchContext,
  SniesVerifiedInstitutionRecord,
  SniesVerifiedProgramRecord,
} from './snies.types';

function mapSniesInstitutionType(raw: string): AcademicInstitutionType {
  const norm = normalizeAcademicText(raw);
  if (norm.includes('sena')) return 'sena';
  if (norm.includes('institucion universitaria') || norm.includes('escuela tecnologica')) {
    return 'university_institution';
  }
  if (norm.includes('universidad')) return 'university';
  if (norm.includes('tecnologic')) return 'technological';
  if (norm.includes('tecnica profesional') || norm.includes('tecnico profesional')) {
    return 'technical_professional';
  }
  return 'other';
}

function mapSniesSector(raw: string): AcademicSector {
  const norm = normalizeAcademicText(raw);
  if (norm.includes('oficial') || norm.includes('public')) return 'public';
  if (norm.includes('privad')) return 'private';
  if (norm.includes('mixt')) return 'mixed';
  return 'unknown';
}

function mapSniesAcademicLevel(raw: string): AcademicLevel {
  const norm = normalizeAcademicText(raw);
  if (norm.includes('doctorado')) return 'doctorate';
  if (norm.includes('maestria') || norm.includes('magister')) return 'masters';
  if (norm.includes('especializacion')) return 'specialization';
  if (norm.includes('universitari') || norm.includes('profesional')) return 'professional';
  if (norm.includes('tecnologic')) return 'technological';
  if (norm.includes('tecnic')) return 'technical_professional';
  return 'other';
}

function mapSniesModality(raw: string): AcademicModality {
  const norm = normalizeAcademicText(raw);
  if (norm.includes('virtual')) return 'virtual';
  if (
    norm.includes('hibrid') ||
    norm.includes('combinad') ||
    norm.includes('distancia') ||
    norm.includes('dual')
  ) {
    return 'hybrid';
  }
  if (norm.includes('presencial')) return 'presential';
  return 'unknown';
}

function mapSniesStatus(raw: string): AcademicProgramStatus {
  const norm = normalizeAcademicText(raw);
  if (norm === 'activo' || norm === 'active') return 'active';
  if (norm === 'inactivo' || norm === 'inactive') return 'inactive';
  return 'unknown';
}

export function adaptSniesInstitution(
  record: SniesVerifiedInstitutionRecord,
  retrievedAt: string
): Institution | null {
  const candidate: Institution = {
    institutionId: `snies_inst_${record.codigoInstitucionSnies.trim()}`,
    name: record.nombreInstitucion.trim(),
    institutionType: mapSniesInstitutionType(record.caracterAcademico),
    sector: mapSniesSector(record.sector),
    city: record.municipioDomicilio.trim(),
    department: record.departamentoDomicilio.trim(),
    sniesCode: record.codigoInstitucionSnies.trim(),
    accreditation: record.acreditacionAltaCalidad?.trim() || undefined,
    officialWebsite:
      record.sitioWebOficial && isValidHttpUrl(record.sitioWebOficial)
        ? record.sitioWebOficial
        : undefined,
    source: {
      provider: 'snies',
      sourceUrl:
        record.urlFuenteOficial && isValidHttpUrl(record.urlFuenteOficial)
          ? record.urlFuenteOficial
          : undefined,
      retrievedAt,
      lastVerifiedAt: record.fechaVerificacion,
    },
    lastVerifiedAt: record.fechaVerificacion,
  };

  const validation = validateInstitution(candidate);
  return validation.isValid ? validation.institution : null;
}

export function adaptSniesProgram(
  record: SniesVerifiedProgramRecord,
  retrievedAt: string
): AcademicProgram | null {
  const candidate: AcademicProgram = {
    programId: `snies_prog_${record.codigoSniesPrograma.trim()}`,
    institutionId: `snies_inst_${record.codigoInstitucionSnies.trim()}`,
    name: record.nombrePrograma.trim(),
    normalizedName: normalizeAcademicText(record.nombrePrograma),
    academicLevel: mapSniesAcademicLevel(record.nivelFormacion),
    modality: mapSniesModality(record.modalidad),
    city: record.municipioOferta.trim(),
    department: record.departamentoOferta.trim(),
    sniesCode: record.codigoSniesPrograma.trim(),
    status: mapSniesStatus(record.estadoPrograma),
    officialUrl:
      record.urlOficialPrograma && isValidHttpUrl(record.urlOficialPrograma)
        ? record.urlOficialPrograma
        : undefined,
    source: {
      provider: 'snies',
      sourceUrl:
        record.urlFuenteOficial && isValidHttpUrl(record.urlFuenteOficial)
          ? record.urlFuenteOficial
          : undefined,
      retrievedAt,
      lastVerifiedAt: record.fechaVerificacion,
    },
    lastVerifiedAt: record.fechaVerificacion,
  };

  const validation = validateAcademicProgram(candidate);
  return validation.isValid ? validation.program : null;
}

/**
 * Adaptador oficial para SNIES que implementa `AcademicProvider`.
 * Convierte registros verificados del MEN a las entidades internas `Institution` y `AcademicProgram`
 * conservando `source.provider = "snies"`.
 */
export class SniesAdapter implements AcademicProvider {
  public readonly providerName = 'snies' as const;
  private readonly client: SniesClient;
  private readonly mappings: CareerAcademicMapping[];

  constructor(client: SniesClient = new SniesClient(), mappings: CareerAcademicMapping[] = []) {
    this.client = client;
    this.mappings = mappings;
  }

  public async searchPrograms(
    filters: AcademicSearchFilters,
    context?: AcademicProviderSearchContext
  ): Promise<AcademicSearchResult> {
    try {
      const snapshot = await this.client.fetchVerifiedDataset();
      if (!snapshot.available) {
        return {
          status: 'empty',
          provider: 'snies',
          programs: [],
          institutions: [],
          totalProgramsCount: 0,
          totalInstitutionsCount: 0,
          appliedFilters: filters,
          notice:
            snapshot.reason ??
            'No hay un dataset oficial SNIES conectado en este momento.',
        };
      }

      const institutionsById: Record<string, Institution> = {};
      for (const rawInst of snapshot.institutions) {
        const adapted = adaptSniesInstitution(rawInst, snapshot.retrievedAt);
        if (adapted) {
          institutionsById[adapted.institutionId] = adapted;
        }
      }

      const programs: AcademicProgram[] = [];
      for (const rawProg of snapshot.programs) {
        const adapted = adaptSniesProgram(rawProg, snapshot.retrievedAt);
        if (adapted && institutionsById[adapted.institutionId]) {
          programs.push(adapted);
        }
      }

      const { programs: filteredPrograms, institutions: filteredInstitutions } =
        filterAndSortAcademicPrograms({
          programs,
          institutionsById,
          mappings: this.mappings,
          filters,
          studentContext: context?.studentContext,
          affinityByCareerId: context?.affinityByCareerId,
        });

      return {
        status: filteredPrograms.length > 0 ? 'ready' : 'empty',
        provider: 'snies',
        programs: filteredPrograms,
        institutions: filteredInstitutions,
        totalProgramsCount: filteredPrograms.length,
        totalInstitutionsCount: filteredInstitutions.length,
        appliedFilters: filters,
        cacheMetadata: {
          retrievedAt: snapshot.retrievedAt,
          lastVerifiedAt: snapshot.lastVerifiedAt,
          expiresAt: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
          provider: 'snies',
        },
        notice: 'Información académica verificada mediante fuente oficial SNIES.',
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
            : 'No fue posible consultar la fuente oficial SNIES.',
      };
    }
  }

  public async getProgramById(programId: string): Promise<AcademicProgram | null> {
    const snapshot = await this.client.fetchVerifiedDataset();
    if (!snapshot.available) return null;
    for (const rawProg of snapshot.programs) {
      const adapted = adaptSniesProgram(rawProg, snapshot.retrievedAt);
      if (adapted && adapted.programId === programId) {
        return adapted;
      }
    }
    return null;
  }

  public async getInstitutionById(institutionId: string): Promise<Institution | null> {
    const snapshot = await this.client.fetchVerifiedDataset();
    if (!snapshot.available) return null;
    for (const rawInst of snapshot.institutions) {
      const adapted = adaptSniesInstitution(rawInst, snapshot.retrievedAt);
      if (adapted && adapted.institutionId === institutionId) {
        return adapted;
      }
    }
    return null;
  }
}
