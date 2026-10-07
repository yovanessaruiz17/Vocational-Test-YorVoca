import { CAREERS } from '../../data/careers';
import {
  AcademicProgram,
  AcademicSearchFilters,
  CareerAcademicMapping,
  EnrichedAcademicProgram,
  Institution,
  InstitutionWithPrograms,
  NormalizedStudentAcademicContext,
} from '../../types/academic';
import { matchProgramAgainstCareers, normalizeAcademicText } from './academicMatcher';

export interface FilterAndSortOptions {
  programs: AcademicProgram[];
  institutionsById: Record<string, Institution>;
  mappings?: CareerAcademicMapping[];
  filters: AcademicSearchFilters;
  studentContext?: NormalizedStudentAcademicContext;
  affinityByCareerId?: Record<string, number>;
}

function isInstitutionDataComplete(institution: Institution): boolean {
  return Boolean(
    institution.name &&
      institution.city &&
      institution.department &&
      institution.institutionType &&
      institution.sector &&
      institution.sector !== 'unknown' &&
      institution.lastVerifiedAt
  );
}

function isInstitutionTypeMatch(
  actual: Institution['institutionType'],
  expected: AcademicSearchFilters['institutionType']
): boolean {
  if (!expected || expected === 'any') return true;
  if (expected === 'technical' || expected === 'technical_professional') {
    return actual === 'technical' || actual === 'technical_professional';
  }
  return actual === expected;
}

function checkLocationCompatibility(
  program: AcademicProgram,
  context?: NormalizedStudentAcademicContext
): boolean {
  if (!context || !context.hasContext) return true;
  if (
    context.studyLocationPreference === 'undecided' ||
    context.studyLocationPreference === 'any_colombian_city'
  ) {
    return true;
  }
  if (context.studyLocationPreference === 'virtual') {
    return program.modality === 'virtual' || program.modality === 'hybrid';
  }

  const preferredCity = context.targetCity ?? context.currentCity;
  const preferredDept = context.targetDepartment ?? context.currentDepartment;

  if (preferredCity && normalizeAcademicText(program.city) === normalizeAcademicText(preferredCity)) {
    return true;
  }
  if (
    preferredDept &&
    normalizeAcademicText(program.department) === normalizeAcademicText(preferredDept)
  ) {
    return true;
  }
  if (
    context.geographicFlexibility === 'open_to_virtual' &&
    program.modality === 'virtual'
  ) {
    return true;
  }

  return false;
}

function checkModalityCompatibility(
  program: AcademicProgram,
  context?: NormalizedStudentAcademicContext
): boolean {
  if (!context || !context.hasContext) return true;
  if (context.preferredModality === 'any') return true;
  return program.modality === context.preferredModality;
}

function checkInstitutionTypeCompatibility(
  institution: Institution,
  context?: NormalizedStudentAcademicContext
): boolean {
  if (!context || !context.hasContext) return true;
  if (context.preferredInstitutionType === 'any') return true;
  return isInstitutionTypeMatch(institution.institutionType, context.preferredInstitutionType);
}

function checkSectorCompatibility(
  institution: Institution,
  context?: NormalizedStudentAcademicContext
): boolean {
  if (!context || !context.hasContext) return true;
  if (context.preferredSector === 'any') return true;
  return institution.sector === context.preferredSector;
}

function buildPreferenceMatchLabels(
  program: AcademicProgram,
  institution: Institution,
  context?: NormalizedStudentAcademicContext
): string[] {
  if (!context || !context.hasContext) return [];
  const labels: string[] = [];

  const preferredCity = context.targetCity ?? context.currentCity;
  const preferredDept = context.targetDepartment ?? context.currentDepartment;

  if (
    preferredCity &&
    normalizeAcademicText(program.city) === normalizeAcademicText(preferredCity)
  ) {
    labels.push(`En tu ciudad preferida (${program.city})`);
  } else if (
    preferredDept &&
    normalizeAcademicText(program.department) === normalizeAcademicText(preferredDept)
  ) {
    labels.push(`En tu departamento (${program.department})`);
  }

  if (context.preferredModality !== 'any' && program.modality === context.preferredModality) {
    const modName =
      program.modality === 'presential'
        ? 'Presencial'
        : program.modality === 'virtual'
        ? 'Virtual'
        : 'Híbrida';
    labels.push(`Modalidad preferida (${modName})`);
  }

  if (
    context.preferredInstitutionType !== 'any' &&
    isInstitutionTypeMatch(institution.institutionType, context.preferredInstitutionType)
  ) {
    labels.push('Tipo de institución preferido');
  }

  if (context.preferredSector !== 'any' && institution.sector === context.preferredSector) {
    labels.push(
      `Sector preferido (${institution.sector === 'public' ? 'Público' : 'Privado'})`
    );
  }

  return labels;
}

/**
 * Filtra, enriquece, ordena de forma determinista (Sección 23 y F6A.2) y agrupa por institución (Sección 21)
 * sin duplicar datasets ni alterar las puntuaciones vocacionales.
 */
export function filterAndSortAcademicPrograms(options: FilterAndSortOptions): {
  programs: EnrichedAcademicProgram[];
  institutions: InstitutionWithPrograms[];
  unfilteredCareerProgramsCount: number;
} {
  const {
    programs,
    institutionsById,
    mappings = [],
    filters,
    studentContext,
    affinityByCareerId = {},
  } = options;

  // Determinar qué carreras se evalúan según careerScope
  let targetCareerIds: string[] = [];
  if (filters.careerScope === 'specific' && filters.careerId) {
    targetCareerIds = [filters.careerId];
  } else if (
    filters.careerScope === 'top5' &&
    filters.topCareerIds &&
    filters.topCareerIds.length > 0
  ) {
    targetCareerIds = filters.topCareerIds;
  } else {
    targetCareerIds = CAREERS.map((c) => c.id);
  }

  const effectiveStatusFilter = filters.status ?? 'active';
  const normQuery = filters.searchQuery ? normalizeAcademicText(filters.searchQuery) : '';

  const enriched: EnrichedAcademicProgram[] = [];
  let unfilteredCareerProgramsCount = 0;

  for (const program of programs) {
    const institution = institutionsById[program.institutionId];
    if (!institution) continue;

    // 1. Filtro de estado (por defecto 'active'; nunca mostrar inactivos por defecto)
    if (effectiveStatusFilter !== 'all' && program.status !== effectiveStatusFilter) {
      continue;
    }

    // 2. Matching determinista contra las carreras objetivo (evaluado primero para conocer el total vocacional disponible)
    const matches = matchProgramAgainstCareers(
      program,
      targetCareerIds,
      mappings,
      affinityByCareerId
    );

    if (matches.length === 0) {
      continue;
    }

    unfilteredCareerProgramsCount += 1;

    // 3. Filtro opcional por tipo de coincidencia (direct | related)
    const filteredMatches =
      filters.matchType && filters.matchType !== 'all'
        ? matches.filter((m) => m.matchType === filters.matchType)
        : matches;

    if (filteredMatches.length === 0) {
      continue;
    }

    // 4. Filtro por departamento y ciudad (solo cuando el usuario o filtro explícito lo solicita)
    if (
      filters.department &&
      filters.department !== 'any' &&
      normalizeAcademicText(program.department) !== normalizeAcademicText(filters.department)
    ) {
      continue;
    }

    if (
      filters.city &&
      filters.city !== 'any' &&
      normalizeAcademicText(program.city) !== normalizeAcademicText(filters.city)
    ) {
      continue;
    }

    // 5. Filtro por modalidad
    if (
      filters.modality &&
      filters.modality !== 'any' &&
      program.modality !== filters.modality
    ) {
      continue;
    }

    // 6. Filtro por tipo de institución
    if (
      filters.institutionType &&
      filters.institutionType !== 'any' &&
      !isInstitutionTypeMatch(institution.institutionType, filters.institutionType)
    ) {
      continue;
    }

    // 7. Filtro por sector
    if (
      filters.sector &&
      filters.sector !== 'any' &&
      institution.sector !== filters.sector
    ) {
      continue;
    }

    // 8. Filtro opcional por fuentes verificadas únicamente (Sección 22 y F6A.1)
    if (filters.verifiedOnly) {
      const effectiveStatus =
        program.sourceStatus ??
        program.source.verificationStatus ??
        (program.source.provider === 'mock' ? 'mock' : 'verified');
      const hasVerifiedSniesProgramCode = Boolean(
        program.sniesCode && program.sniesCode.trim().length > 0
      );
      if (
        effectiveStatus !== 'verified' ||
        program.source.provider === 'mock' ||
        !hasVerifiedSniesProgramCode
      ) {
        continue;
      }
    }

    // 9. Filtro de búsqueda por texto libre (programa, institución o ciudad)
    if (normQuery) {
      const searchable = normalizeAcademicText(
        `${program.name} ${institution.name} ${program.city} ${program.department}`
      );
      if (!searchable.includes(normQuery)) {
        continue;
      }
    }

    const locationCompatible = checkLocationCompatibility(program, studentContext);
    const modalityCompatible = checkModalityCompatibility(program, studentContext);
    const institutionTypeCompatible = checkInstitutionTypeCompatibility(
      institution,
      studentContext
    );
    const sectorCompatible = checkSectorCompatibility(institution, studentContext);
    const preferenceMatchLabels = buildPreferenceMatchLabels(
      program,
      institution,
      studentContext
    );

    enriched.push({
      program,
      institution,
      matches: filteredMatches,
      primaryMatch: filteredMatches[0] ?? null,
      locationCompatible,
      modalityCompatible,
      institutionTypeCompatible,
      sectorCompatible,
      preferenceMatchCount: preferenceMatchLabels.length,
      preferenceMatchLabels,
    });
  }

  // Ordenamiento determinista (Sección 23 y F6A.2):
  // 1. coincidencia directa con la carrera
  // 2. coincidencia relacionada (mayor relevancia / afinidad vocacional)
  // 3. ubicación compatible con la preferencia del estudiante
  // 4. modalidad compatible con la preferencia del estudiante
  // 5. tipo de institución y sector compatibles con la preferencia del estudiante
  // 6. programa activo
  // 7. institución con datos completos
  // 8. nombre alfabético como desempate
  const relevanceRank = { high: 3, medium: 2, low: 1 };

  enriched.sort((a, b) => {
    const matchA = a.primaryMatch;
    const matchB = b.primaryMatch;

    // 1. Coincidencia directa antes que relacionada
    const isDirectA = matchA?.matchType === 'direct' ? 1 : 0;
    const isDirectB = matchB?.matchType === 'direct' ? 1 : 0;
    if (isDirectB !== isDirectA) {
      return isDirectB - isDirectA;
    }

    // 2. Relevancia y afinidad de la carrera relacionada
    const relA = matchA ? relevanceRank[matchA.relevance] : 0;
    const relB = matchB ? relevanceRank[matchB.relevance] : 0;
    if (relB !== relA) {
      return relB - relA;
    }

    const affA = matchA?.careerAffinityScore ?? 0;
    const affB = matchB?.careerAffinityScore ?? 0;
    if (Math.abs(affB - affA) > 1e-6) {
      return affB - affA;
    }

    // 3. Ubicación compatible
    const locA = a.locationCompatible ? 1 : 0;
    const locB = b.locationCompatible ? 1 : 0;
    if (locB !== locA) {
      return locB - locA;
    }

    // 4. Modalidad compatible
    const modA = a.modalityCompatible ? 1 : 0;
    const modB = b.modalityCompatible ? 1 : 0;
    if (modB !== modA) {
      return modB - modA;
    }

    // 5. Tipo de institución y sector compatibles
    const instTypeA = a.institutionTypeCompatible ? 1 : 0;
    const instTypeB = b.institutionTypeCompatible ? 1 : 0;
    if (instTypeB !== instTypeA) {
      return instTypeB - instTypeA;
    }

    const secA = a.sectorCompatible ? 1 : 0;
    const secB = b.sectorCompatible ? 1 : 0;
    if (secB !== secA) {
      return secB - secA;
    }

    // 6. Programa activo
    const activeA = a.program.status === 'active' ? 1 : 0;
    const activeB = b.program.status === 'active' ? 1 : 0;
    if (activeB !== activeA) {
      return activeB - activeA;
    }

    // 7. Institución con datos completos
    const compA = isInstitutionDataComplete(a.institution) ? 1 : 0;
    const compB = isInstitutionDataComplete(b.institution) ? 1 : 0;
    if (compB !== compA) {
      return compB - compA;
    }

    // 8. Nombre alfabético como desempate determinista
    const nameCmp = a.program.name.localeCompare(b.program.name, 'es');
    if (nameCmp !== 0) {
      return nameCmp;
    }
    return a.institution.name.localeCompare(b.institution.name, 'es');
  });

  // Agrupación determinista por institución a partir de la misma fuente normalizada (Sección 21 y 22)
  const instMap = new Map<string, InstitutionWithPrograms>();
  for (const item of enriched) {
    const instId = item.institution.institutionId;
    const existing = instMap.get(instId);
    const isDirect = item.primaryMatch?.matchType === 'direct';

    if (!existing) {
      instMap.set(instId, {
        institution: item.institution,
        programs: [item],
        directMatchCount: isDirect ? 1 : 0,
        relatedMatchCount: isDirect ? 0 : 1,
      });
    } else {
      existing.programs.push(item);
      if (isDirect) {
        existing.directMatchCount += 1;
      } else {
        existing.relatedMatchCount += 1;
      }
    }
  }

  const institutions = Array.from(instMap.values()).sort((a, b) => {
    if (b.directMatchCount !== a.directMatchCount) {
      return b.directMatchCount - a.directMatchCount;
    }
    if (b.programs.length !== a.programs.length) {
      return b.programs.length - a.programs.length;
    }
    return a.institution.name.localeCompare(b.institution.name, 'es');
  });

  return {
    programs: enriched,
    institutions,
    unfilteredCareerProgramsCount,
  };
}
