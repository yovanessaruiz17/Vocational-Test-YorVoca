import {
  AcademicInstitutionType,
  AcademicModality,
  AcademicSearchFilters,
  GeographicFlexibilityMode,
  NormalizedStudentAcademicContext,
  StudyLocationPreferenceMode,
} from '../../types/academic';
import { StudentContextData } from '../../types/student';

export interface ExtendedStudentContextInput extends Partial<Omit<StudentContextData, 'preferredInstitutionType' | 'preferredSector' | 'preferredModality'>> {
  preferredModality?: StudentContextData['preferredModality'] | AcademicModality | 'any' | string | null;
  preferredInstitutionType?:
    | StudentContextData['preferredInstitutionType']
    | AcademicInstitutionType
    | 'any'
    | string
    | null;
  preferredSector?:
    | StudentContextData['preferredSector']
    | 'public'
    | 'private'
    | 'any'
    | string
    | null;
  studyLocationPreference?: StudyLocationPreferenceMode;
  flexibility?: GeographicFlexibilityMode;
}

/**
 * Normaliza la modalidad preferida del estudiante a los valores canónicos:
 * 'presential' | 'virtual' | 'hybrid' | 'any'
 */
export function normalizePreferredModality(
  rawModalityInput: unknown
): AcademicModality | 'any' {
  const raw = String(rawModalityInput ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (!raw || raw === 'cualquiera' || raw === 'any' || raw === 'todas' || raw === 'all') {
    return 'any';
  }
  if (raw === 'presencial' || raw === 'presential') {
    return 'presential';
  }
  if (raw === 'virtual' || raw === 'online' || raw === 'en linea') {
    return 'virtual';
  }
  if (
    raw === 'distancia' ||
    raw === 'dual' ||
    raw === 'hybrid' ||
    raw === 'hibrida' ||
    raw === 'hibrido' ||
    raw === 'combinada'
  ) {
    return 'hybrid';
  }
  return 'any';
}

/**
 * Normaliza explícitamente el tipo de institución preferido sin confundirlo jamás con el sector.
 * Valores permitidos:
 * - 'university'
 * - 'university_institution'
 * - 'technological'
 * - 'technical'
 * - 'technical_professional'
 * - 'sena'
 * - 'any'
 *
 * REGLA F6A.2 (Sección 1):
 * - Nunca convertir "Universidad" en "Publica" / "public".
 * - Nunca convertir "SENA" en "Universidad pública".
 * - Nunca utilizar sector como sustituto de institutionType.
 */
export function normalizePreferredInstitutionType(
  rawInstTypeInput: unknown
): AcademicInstitutionType | 'any' {
  const raw = String(rawInstTypeInput ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (!raw || raw === 'cualquiera' || raw === 'any' || raw === 'todas' || raw === 'all') {
    return 'any';
  }
  if (raw === 'sena' || raw === 'servicio nacional de aprendizaje') {
    return 'sena';
  }
  if (
    raw === 'university_institution' ||
    raw === 'institucion universitaria' ||
    raw === 'fundacion universitaria' ||
    raw === 'corporacion universitaria'
  ) {
    return 'university_institution';
  }
  if (raw === 'university' || raw === 'universidad') {
    return 'university';
  }
  if (
    raw === 'technological' ||
    raw === 'institucion tecnologica' ||
    raw === 'tecnologica' ||
    raw === 'tecnologico'
  ) {
    return 'technological';
  }
  if (raw === 'technical_professional' || raw === 'tecnica profesional' || raw === 'tecnico profesional') {
    return 'technical_professional';
  }
  if (raw === 'technical' || raw === 'tecnica' || raw === 'tecnico') {
    return 'technical';
  }

  // Si el valor era 'publica' o 'privada' (de versiones previas del onboarding),
  // NO es un institutionType válido; retorna 'any'.
  return 'any';
}

/**
 * Normaliza explícitamente el sector preferido ('public' | 'private' | 'any').
 * Si `preferredSector` viene explícito se usa directamente; solo si no viene definido
 * y `preferredInstitutionType` contenía un valor legado de sector ('Pública'/'Privada'),
 * se rescata como `preferredSector` sin contaminar `preferredInstitutionType`.
 */
export function normalizePreferredSector(
  rawSectorInput: unknown,
  legacyInstTypeInput?: unknown
): 'public' | 'private' | 'any' {
  const parseSector = (val: unknown): 'public' | 'private' | 'any' | null => {
    const raw = String(val ?? '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    if (!raw) return null;
    if (raw === 'cualquiera' || raw === 'any' || raw === 'todos' || raw === 'all') {
      return 'any';
    }
    if (raw === 'publica' || raw === 'publico' || raw === 'public' || raw === 'oficial') {
      return 'public';
    }
    if (raw === 'privada' || raw === 'privado' || raw === 'private') {
      return 'private';
    }
    return null;
  };

  const explicit = parseSector(rawSectorInput);
  if (explicit !== null) {
    return explicit;
  }

  const fromLegacy = parseSector(legacyInstTypeInput);
  if (fromLegacy !== null) {
    return fromLegacy;
  }

  return 'any';
}

/**
 * Normaliza el contexto del estudiante almacenado en `yorvoca_student_context`
 * hacia la estructura de preferencias tipadas del Academic Explorer.
 *
 * REGLAS F6A.2 (Secciones 1, 2, 3 y 4):
 * - Separa estrictamente `preferredInstitutionType`, `preferredSector` y `preferredModality`.
 * - Distingue `currentCity`, `targetCity`, `studyLocationPreference` y `geographicFlexibility`.
 * - Calcula `suggestedCity` y `suggestedDepartment` según la preferencia de ubicación,
 *   sin imponer filtros duros invisibles que eliminen silenciosamente la oferta académica.
 */
export function normalizeStudentContextForAcademic(
  rawContext: ExtendedStudentContextInput | null | undefined
): NormalizedStudentAcademicContext {
  if (!rawContext) {
    return {
      hasContext: false,
      studyLocationPreference: 'undecided',
      geographicFlexibility: 'any_colombian_city',
      preferredModality: 'any',
      preferredSector: 'any',
      preferredInstitutionType: 'any',
      suggestedCity: undefined,
      suggestedDepartment: undefined,
    };
  }

  const currentCity = rawContext.currentLocation?.city?.trim() || undefined;
  const currentDepartment = rawContext.currentLocation?.department?.trim() || undefined;
  const targetCity = rawContext.targetLocation?.city?.trim() || undefined;
  const targetDepartment = rawContext.targetLocation?.department?.trim() || undefined;

  const preferredModality = normalizePreferredModality(rawContext.preferredModality);
  const preferredInstitutionType = normalizePreferredInstitutionType(
    rawContext.preferredInstitutionType
  );
  const preferredSector = normalizePreferredSector(
    rawContext.preferredSector,
    rawContext.preferredInstitutionType
  );

  // Determinar flexibilidad geográfica
  let geographicFlexibility: GeographicFlexibilityMode = 'any_colombian_city';
  if (rawContext.flexibility) {
    geographicFlexibility = rawContext.flexibility;
  } else if (rawContext.locationFlexibility === 'Misma ciudad') {
    geographicFlexibility = 'only_current_city';
  } else if (rawContext.locationFlexibility === 'Mismo departamento') {
    geographicFlexibility = 'nearby_cities';
  } else if (rawContext.locationFlexibility === 'Cualquier lugar del país') {
    geographicFlexibility = 'any_colombian_city';
  } else if (preferredModality === 'virtual') {
    geographicFlexibility = 'open_to_virtual';
  }

  // Determinar preferencia de ubicación de estudio (respetando explícitamente 'undecided')
  let studyLocationPreference: StudyLocationPreferenceMode = 'undecided';
  if (rawContext.studyLocationPreference) {
    studyLocationPreference = rawContext.studyLocationPreference;
  } else if (preferredModality === 'virtual' && !targetCity && !currentCity) {
    studyLocationPreference = 'virtual';
  } else if (geographicFlexibility === 'any_colombian_city') {
    studyLocationPreference = 'any_colombian_city';
  } else if (targetCity && currentCity && targetCity === currentCity) {
    studyLocationPreference = 'current_city';
  } else if (targetCity) {
    studyLocationPreference = 'specific_city';
  } else if (currentCity) {
    studyLocationPreference = 'current_city';
  } else {
    studyLocationPreference = 'undecided';
  }

  // Sugerencias de ubicación (Sección 3):
  // - "Misma ciudad" (only_current_city) -> sugiere esa ciudad y departamento
  // - "Ciudades cercanas" (nearby_cities) -> sugiere el departamento
  // - "Cualquier lugar de Colombia" / "Virtual" / "Sin decidir" -> sin restricción sugerida
  let suggestedCity: string | undefined;
  let suggestedDepartment: string | undefined;

  if (
    studyLocationPreference === 'current_city' ||
    studyLocationPreference === 'specific_city'
  ) {
    const baseCity =
      studyLocationPreference === 'specific_city'
        ? targetCity ?? currentCity
        : currentCity ?? targetCity;
    const baseDept =
      studyLocationPreference === 'specific_city'
        ? targetDepartment ?? currentDepartment
        : currentDepartment ?? targetDepartment;

    if (geographicFlexibility === 'only_current_city') {
      suggestedCity = baseCity;
      suggestedDepartment = baseDept;
    } else if (geographicFlexibility === 'nearby_cities') {
      suggestedCity = undefined;
      suggestedDepartment = baseDept;
    }
  }

  const hasContext = Boolean(
    rawContext.isComplete ||
      currentCity ||
      targetCity ||
      rawContext.preferredModality ||
      rawContext.preferredInstitutionType ||
      rawContext.preferredSector ||
      rawContext.studyLocationPreference
  );

  return {
    hasContext,
    currentCity,
    currentDepartment,
    targetCity,
    targetDepartment,
    studyLocationPreference,
    geographicFlexibility,
    preferredModality,
    preferredSector,
    preferredInstitutionType,
    suggestedCity,
    suggestedDepartment,
  };
}

/**
 * Construye los filtros iniciales del explorador académico (Secciones 2, 3 y 4 de F6A.2).
 *
 * REGLA FUNDAMENTAL F6A.2:
 * El contexto del estudiante NO se convierte automáticamente en filtros duros invisibles
 * que eliminen silenciosamente los 33 programas al abrir el explorador o seleccionar una carrera.
 * Los filtros explícitos inician abiertos (`city: 'any'`, `department: 'any'`, `modality: 'any'`,
 * `institutionType: 'any'`, `sector: 'any'`, `matchType: 'all'`, `verifiedOnly: false`),
 * mientras que las preferencias del estudiante se usan para priorizar, ordenar, sugerir filtros
 * y mostrar coincidencias de preferencia.
 */
export function buildInitialAcademicFilters(options: {
  studentContext?: ExtendedStudentContextInput | null;
  selectedCareerId?: string | null;
  topCareerIds?: string[];
}): AcademicSearchFilters {
  const hasSpecificCareer = Boolean(
    options.selectedCareerId && options.selectedCareerId.trim().length > 0
  );

  return {
    careerScope: hasSpecificCareer
      ? 'specific'
      : options.topCareerIds && options.topCareerIds.length > 0
      ? 'top5'
      : 'all',
    careerId: hasSpecificCareer ? options.selectedCareerId!.trim() : undefined,
    topCareerIds: options.topCareerIds ?? [],
    city: 'any',
    department: 'any',
    modality: 'any',
    institutionType: 'any',
    sector: 'any',
    status: 'active',
    matchType: 'all',
    verifiedOnly: false,
    searchQuery: '',
  };
}

/**
 * Construye el conjunto de filtros explícitos sugeridos a partir de las preferencias del estudiante,
 * para cuando el usuario decide aplicarlos explícitamente mediante acción en la interfaz.
 */
export function buildSuggestedFiltersFromContext(
  studentContext: ExtendedStudentContextInput | null | undefined,
  baseFilters?: Partial<AcademicSearchFilters>
): Partial<AcademicSearchFilters> {
  const normalized = normalizeStudentContextForAcademic(studentContext);

  const city =
    normalized.studyLocationPreference === 'undecided' ||
    normalized.studyLocationPreference === 'any_colombian_city' ||
    normalized.studyLocationPreference === 'virtual'
      ? 'any'
      : normalized.suggestedCity ?? 'any';

  const department =
    normalized.studyLocationPreference === 'undecided' ||
    normalized.studyLocationPreference === 'any_colombian_city' ||
    normalized.studyLocationPreference === 'virtual'
      ? 'any'
      : normalized.suggestedDepartment ?? 'any';

  const modality =
    normalized.studyLocationPreference === 'virtual'
      ? 'virtual'
      : normalized.preferredModality;

  return {
    ...baseFilters,
    city,
    department,
    modality,
    institutionType: normalized.preferredInstitutionType,
    sector: normalized.preferredSector,
  };
}

