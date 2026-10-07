import {
  MOCK_ACADEMIC_SOURCE,
  MOCK_INSTITUTIONS,
} from '../../data/academic/mockInstitutions';
import {
  MOCK_CAREER_ACADEMIC_MAPPINGS,
  MOCK_PROGRAMS,
} from '../../data/academic/mockPrograms';
import { CAREERS_BY_ID } from '../../data/careers';
import { ASSESSMENT_QUESTIONS } from '../../data/questions';
import { ASSESSMENT_STORAGE_KEY } from '../../features/assessment/hooks/useAssessment';
import { loadAndValidateResultsFromStorage } from '../../features/results/hooks/useResults';
import {
  invalidateAcademicSearchCache,
  MockAcademicProvider,
  searchAcademicOffer,
  SniesAdapter,
  SniesClient,
} from '../../services/snies';
import { AssessmentAnswer, LikertValue } from '../../types/assessment';
import {
  buildInitialAcademicFilters,
  buildSuggestedFiltersFromContext,
  filterAndSortAcademicPrograms,
  matchCareerToProgram,
  normalizeStudentContextForAcademic,
  validateAcademicProgram,
  validateAcademicSource,
  validateInstitution,
} from '../academic';
import { buildAssessmentResult } from '../assessment';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export async function runAcademicExplorerTests(): Promise<{
  passed: number;
  results: string[];
}> {
  const results: string[] = [];
  let passed = 0;

  const sampleAnswers: AssessmentAnswer[] = ASSESSMENT_QUESTIONS.map((q, idx) => ({
    questionId: q.id,
    value: (((idx % 5) + 1) as LikertValue),
    answeredAt: '2026-10-06T16:00:00.000Z',
  }));
  const sampleResult = buildAssessmentResult(sampleAnswers, {
    assessmentId: 'assessment_test_f5',
    completedAt: '2026-10-06T16:05:00.000Z',
  });

  // Test 1: Academic model (Institution válido, AcademicProgram válido, AcademicSource válido)
  {
    const srcValid = validateAcademicSource(MOCK_ACADEMIC_SOURCE);
    assert(srcValid.isValid && srcValid.source !== null, 'MOCK_ACADEMIC_SOURCE must be valid');

    const srcInvalid = validateAcademicSource({ provider: 'invented_provider' });
    assert(!srcInvalid.isValid, 'Invalid provider must be rejected');

    for (const inst of MOCK_INSTITUTIONS) {
      const check = validateInstitution(inst);
      assert(
        check.isValid,
        `Mock institution ${inst.institutionId} failed validation: ${check.error}`
      );
    }

    for (const prog of MOCK_PROGRAMS) {
      const check = validateAcademicProgram(prog);
      assert(
        check.isValid,
        `Mock program ${prog.programId} failed validation: ${check.error}`
      );
    }

    passed++;
    results.push(
      'PASS [F5 Test 01]: Modelo académico validado (Institution, AcademicProgram y AcademicSource válidos).'
    );
  }

  // Test 2: Filtering (ciudad, departamento, modalidad, tipo de institución, sector y estado)
  {
    const provider = new MockAcademicProvider();

    // Filtro por ciudad: Cartagena
    const byCity = await provider.searchPrograms({
      careerScope: 'all',
      city: 'Cartagena',
      status: 'active',
    });
    assert(
      byCity.programs.length > 0 &&
        byCity.programs.every((p) => p.program.city === 'Cartagena'),
      'City filter must only return programs in Cartagena'
    );

    // Filtro por departamento: Antioquia
    const byDept = await provider.searchPrograms({
      careerScope: 'all',
      department: 'Antioquia',
      status: 'active',
    });
    assert(
      byDept.programs.length > 0 &&
        byDept.programs.every((p) => p.program.department === 'Antioquia'),
      'Department filter must only return programs in Antioquia'
    );

    // Filtro por modalidad: virtual
    const byModality = await provider.searchPrograms({
      careerScope: 'all',
      modality: 'virtual',
      status: 'active',
    });
    assert(
      byModality.programs.length > 0 &&
        byModality.programs.every((p) => p.program.modality === 'virtual'),
      'Modality filter must only return virtual programs'
    );

    // Filtro por tipo de institución: sena
    const byInstType = await provider.searchPrograms({
      careerScope: 'all',
      institutionType: 'sena',
      status: 'active',
    });
    assert(
      byInstType.programs.length > 0 &&
        byInstType.programs.every((p) => p.institution.institutionType === 'sena'),
      'Institution type filter must only return SENA programs'
    );

    // Filtro por sector: private
    const bySector = await provider.searchPrograms({
      careerScope: 'all',
      sector: 'private',
      status: 'active',
    });
    assert(
      bySector.programs.length > 0 &&
        bySector.programs.every((p) => p.institution.sector === 'private'),
      'Sector filter must only return private sector programs'
    );

    // Filtro por estado: active vs inactive
    const activeOnly = await provider.searchPrograms({
      careerScope: 'all',
      status: 'active',
    });
    assert(
      activeOnly.programs.every((p) => p.program.status === 'active'),
      'Status filter active must exclude inactive programs'
    );

    const inactiveOnly = await provider.searchPrograms({
      careerScope: 'all',
      status: 'inactive',
    });
    assert(
      inactiveOnly.programs.length === 1 &&
        inactiveOnly.programs[0].program.programId === 'prog_demo_inactive_legacy',
      'Status filter inactive must locate the inactive legacy program'
    );

    passed++;
    results.push(
      'PASS [F5 Test 02]: Filtros verificados (ciudad, departamento, modalidad, tipo de institución, sector y estado).'
    );
  }

  // Test 3: Matching determinista (direct match, related match y ausencia de match)
  {
    const softwareCareer = CAREERS_BY_ID['engineering_software'];
    const medicineCareer = CAREERS_BY_ID['medicine'];

    const softProg = MOCK_PROGRAMS.find((p) => p.programId === 'prog_demo_soft_ctg')!;
    const sistProg = MOCK_PROGRAMS.find((p) => p.programId === 'prog_demo_sist_ctg')!;
    const medProg = MOCK_PROGRAMS.find((p) => p.programId === 'prog_demo_med_ctg')!;

    const directMatch = matchCareerToProgram(
      softwareCareer,
      softProg,
      MOCK_CAREER_ACADEMIC_MAPPINGS,
      0.87
    );
    assert(
      directMatch !== null &&
        directMatch.matchType === 'direct' &&
        directMatch.careerAffinityPercent === 87,
      'Ingeniería de Software must be a direct_match for engineering_software'
    );

    const relatedMatch = matchCareerToProgram(
      softwareCareer,
      sistProg,
      MOCK_CAREER_ACADEMIC_MAPPINGS,
      0.87
    );
    assert(
      relatedMatch !== null && relatedMatch.matchType === 'related',
      'Ingeniería de Sistemas must be a related_match for engineering_software'
    );

    const noMatch = matchCareerToProgram(
      softwareCareer,
      medProg,
      MOCK_CAREER_ACADEMIC_MAPPINGS,
      0.87
    );
    assert(noMatch === null, 'Medicina must have no match with engineering_software');

    const medDirect = matchCareerToProgram(medicineCareer, medProg, [], 0.91);
    assert(
      medDirect !== null && medDirect.matchType === 'direct',
      'Medicina must be a direct_match for medicine career'
    );

    passed++;
    results.push(
      'PASS [F5 Test 03]: Matching determinista verificado (direct_match, related_match y ausencia de match).'
    );
  }

  // Test 4: Contexto del estudiante y separación Preferencias vs Filtros (F6A.2)
  {
    // 4.1 Semántica estricta: "Universidad" -> institutionType='university', sector='any' (nunca convertir Universidad en Pública)
    const uniContext = normalizeStudentContextForAcademic({
      currentLocation: { department: 'Bolívar', city: 'Cartagena' },
      preferredInstitutionType: 'Universidad',
      preferredModality: 'Presencial',
      isComplete: true,
    });
    assert(
      uniContext.preferredInstitutionType === 'university' &&
        uniContext.preferredSector === 'any',
      'Universidad must map to preferredInstitutionType=university and never to preferredSector=public'
    );

    // 4.2 Semántica estricta: "SENA" -> institutionType='sena', sector='any' (nunca convertir SENA en Universidad pública)
    const senaContext = normalizeStudentContextForAcademic({
      currentLocation: { department: 'Bolívar', city: 'Cartagena' },
      preferredInstitutionType: 'SENA',
      isComplete: true,
    });
    assert(
      senaContext.preferredInstitutionType === 'sena' &&
        senaContext.preferredSector === 'any',
      'SENA must map to preferredInstitutionType=sena and never to university/public'
    );

    // 4.3 Filtros iniciales abiertos: las preferencias del onboarding NO bloquean silenciosamente la oferta
    const initialOpenFilters = buildInitialAcademicFilters({
      studentContext: {
        currentLocation: { department: 'Bolívar', city: 'Cartagena' },
        targetLocation: { department: 'Bolívar', city: 'Cartagena' },
        locationFlexibility: 'Misma ciudad',
        preferredModality: 'Virtual',
        preferredInstitutionType: 'Universidad',
        preferredSector: 'Privada',
        isComplete: true,
      },
      topCareerIds: sampleResult.topCareers,
    });
    assert(
      initialOpenFilters.city === 'any' &&
        initialOpenFilters.department === 'any' &&
        initialOpenFilters.modality === 'any' &&
        initialOpenFilters.institutionType === 'any' &&
        initialOpenFilters.sector === 'any' &&
        initialOpenFilters.verifiedOnly === false,
      'buildInitialAcademicFilters must keep initial filters open (any) so onboarding preferences do not silently eliminate programs'
    );

    // 4.4 Sugerencias explícitas de filtros desde el contexto (cuando el usuario decide aplicarlas)
    const suggestedCurrentCity = buildSuggestedFiltersFromContext({
      currentLocation: { department: 'Bolívar', city: 'Cartagena' },
      targetLocation: { department: 'Bolívar', city: 'Cartagena' },
      locationFlexibility: 'Misma ciudad',
      preferredModality: 'Presencial',
      preferredInstitutionType: 'Universidad',
      preferredSector: 'Pública',
      isComplete: true,
    });
    assert(
      suggestedCurrentCity.city === 'Cartagena' &&
        suggestedCurrentCity.department === 'Bolívar' &&
        suggestedCurrentCity.modality === 'presential' &&
        suggestedCurrentCity.institutionType === 'university' &&
        suggestedCurrentCity.sector === 'public',
      'buildSuggestedFiltersFromContext must accurately suggest Cartagena, Bolívar, presential, university and public'
    );

    // 4.5 specific_city + only_current_city en sugerencias
    const suggestedSpecificCity = buildSuggestedFiltersFromContext({
      currentLocation: { department: 'Bolívar', city: 'Cartagena' },
      targetLocation: { department: 'Antioquia', city: 'Medellín' },
      studyLocationPreference: 'specific_city',
      flexibility: 'only_current_city',
      isComplete: true,
    });
    assert(
      suggestedSpecificCity.city === 'Medellín' &&
        suggestedSpecificCity.department === 'Antioquia',
      'specific_city must suggest Medellín, Antioquia'
    );

    // 4.6 any_colombian_city y undecided mantienen ubicación abierta
    const undecidedContext = normalizeStudentContextForAcademic({
      currentLocation: { department: 'Bolívar', city: 'Cartagena' },
      studyLocationPreference: 'undecided',
    });
    const undecidedSuggested = buildSuggestedFiltersFromContext({
      currentLocation: { department: 'Bolívar', city: 'Cartagena' },
      studyLocationPreference: 'undecided',
    });
    assert(
      undecidedContext.studyLocationPreference === 'undecided' &&
        undecidedSuggested.city === 'any' &&
        undecidedSuggested.department === 'any',
      'undecided must NOT lock city to Cartagena; it must keep city=any and department=any'
    );

    // 4.7 virtual mantiene city='any'
    const virtualSuggested = buildSuggestedFiltersFromContext({
      currentLocation: { department: 'Bolívar', city: 'Cartagena' },
      studyLocationPreference: 'virtual',
      preferredModality: 'Virtual',
    });
    assert(
      virtualSuggested.modality === 'virtual' && virtualSuggested.city === 'any',
      'virtual preference must suggest modality=virtual and city=any'
    );

    passed++;
    results.push(
      'PASS [F5/F6A.2 Test 04]: Semántica de contexto (institutionType vs sector) y separación entre preferencias y filtros verificadas.'
    );
  }

  // Test 5: Integridad (no inventar URLs, no mostrar mock como snies, no incluir inactivos por defecto, no modificar careerScores ni topCareers)
  {
    const beforeTopCareers = JSON.stringify(sampleResult.topCareers);
    const beforeCareerScores = JSON.stringify(sampleResult.careerScores);

    // Verificar que ningún registro mock inventa URLs ni códigos SNIES ni finge ser provider 'snies'
    for (const inst of MOCK_INSTITUTIONS) {
      assert(inst.source.provider === 'mock', 'Mock institution must have provider=mock');
      assert(inst.sniesCode === undefined, 'Mock institution must not invent sniesCode');
      assert(inst.officialWebsite === undefined, 'Mock institution must not invent URLs');
    }
    for (const prog of MOCK_PROGRAMS) {
      assert(prog.source.provider === 'mock', 'Mock program must have provider=mock');
      assert(prog.sniesCode === undefined, 'Mock program must not invent sniesCode');
      assert(prog.officialUrl === undefined, 'Mock program must not invent URLs');
    }

    // Verificar que un registro mock que intente fingir código SNIES o URL malformada es rechazado
    const fakeSniesInMock = validateAcademicProgram({
      ...MOCK_PROGRAMS[0],
      sniesCode: '99999',
    });
    assert(
      !fakeSniesInMock.isValid,
      'Mock program pretending to have an official SNIES code must be rejected'
    );

    const invalidUrlProg = validateAcademicProgram({
      ...MOCK_PROGRAMS[0],
      source: { provider: 'snies' },
      officialUrl: 'not-a-valid-url',
    });
    assert(!invalidUrlProg.isValid, 'Program with malformed officialUrl must be rejected');

    // Verificar que la búsqueda por defecto nunca incluye programas inactivos y devuelve status='mock'
    invalidateAcademicSearchCache();
    const defaultSearch = await searchAcademicOffer({
      careerScope: 'specific',
      careerId: 'engineering_software',
    });
    assert(
      defaultSearch.provider === 'mock' && defaultSearch.status === 'mock',
      'Default search with MockAcademicProvider must report provider=mock and status=mock, never snies'
    );
    assert(
      defaultSearch.programs.every((p) => p.program.status === 'active') &&
        !defaultSearch.programs.some(
          (p) => p.program.programId === 'prog_demo_inactive_legacy'
        ),
      'Inactive programs must not be included by default'
    );

    // Verificar que direct_match aparece ordenado antes que related_match (Sección 23)
    const firstMatchType = defaultSearch.programs[0]?.primaryMatch?.matchType;
    const lastMatchType =
      defaultSearch.programs[defaultSearch.programs.length - 1]?.primaryMatch?.matchType;
    assert(
      firstMatchType === 'direct' && lastMatchType === 'related',
      'Deterministic sorting must place direct matches before related matches'
    );

    // Verificar que careerScores y topCareers no fueron alterados
    assert(
      JSON.stringify(sampleResult.topCareers) === beforeTopCareers &&
        JSON.stringify(sampleResult.careerScores) === beforeCareerScores,
      'Academic search must never mutate topCareers or careerScores'
    );

    passed++;
    results.push(
      'PASS [F5 Test 05]: Integridad verificada (sin URLs inventadas, mock diferenciado de snies, sin inactivos por defecto y sin mutar careerScores/topCareers).'
    );
  }

  // Test 6: Edge cases (sin AssessmentResult, resultado corrupto, carrera inexistente, sin programas/filtros restrictivos, provider con error y SniesAdapter)
  {
    // 6.1 Carrera inexistente
    const unknownCareerSearch = await searchAcademicOffer({
      careerScope: 'specific',
      careerId: 'non_existent_career_id_999',
    });
    assert(
      unknownCareerSearch.status === 'empty' &&
        unknownCareerSearch.programs.length === 0 &&
        unknownCareerSearch.institutions.length === 0,
      'Non-existent careerId must safely return empty results without throwing'
    );

    // 6.2 Filtros demasiado restrictivos (sin programas coincidentes)
    const restrictiveSearch = await searchAcademicOffer({
      careerScope: 'specific',
      careerId: 'medicine',
      city: 'Manizales',
      modality: 'virtual',
    });
    assert(
      restrictiveSearch.status === 'empty' && restrictiveSearch.programs.length === 0,
      'Overly restrictive filters must return status=empty and 0 programs'
    );

    // 6.3 Provider con error
    const errorProvider = new MockAcademicProvider({ simulateError: true });
    const errorResult = await searchAcademicOffer(
      { careerScope: 'top5', topCareerIds: sampleResult.topCareers },
      undefined,
      { provider: errorProvider, bypassCache: true }
    );
    assert(
      errorResult.status === 'error' && Boolean(errorResult.errorMessage),
      'Provider error must return status=error with an error message'
    );

    // 6.4 SniesAdapter sin dataset vs con dataset oficial verificado
    const unconfiguredSnies = new SniesAdapter(new SniesClient());
    const unconfiguredRes = await unconfiguredSnies.searchPrograms({
      careerScope: 'all',
    });
    assert(
      unconfiguredRes.status === 'empty' && unconfiguredRes.provider === 'snies',
      'Unconfigured SniesAdapter must return status=empty without inventing endpoints'
    );

    const configuredSniesClient = new SniesClient({
      available: true,
      retrievedAt: '2026-10-06T12:00:00.000Z',
      lastVerifiedAt: '2026-10-06T12:00:00.000Z',
      institutions: [
        {
          codigoInstitucionSnies: '1101',
          nombreInstitucion: 'Institución Oficial Verificada de Prueba',
          caracterAcademico: 'Universidad',
          sector: 'Oficial',
          municipioDomicilio: 'Bogotá D.C.',
          departamentoDomicilio: 'Bogotá D.C.',
          fechaVerificacion: '2026-10-06T12:00:00.000Z',
        },
      ],
      programs: [
        {
          codigoSniesPrograma: '5001',
          codigoInstitucionSnies: '1101',
          nombrePrograma: 'Ingeniería de Sistemas',
          nivelFormacion: 'Universitario',
          modalidad: 'Presencial',
          municipioOferta: 'Bogotá D.C.',
          departamentoOferta: 'Bogotá D.C.',
          estadoPrograma: 'Activo',
          fechaVerificacion: '2026-10-06T12:00:00.000Z',
        },
      ],
    });
    const configuredSniesAdapter = new SniesAdapter(configuredSniesClient);
    const sniesSearchRes = await configuredSniesAdapter.searchPrograms({
      careerScope: 'specific',
      careerId: 'engineering_systems',
    });
    assert(
      sniesSearchRes.status === 'ready' &&
        sniesSearchRes.provider === 'snies' &&
        sniesSearchRes.programs.length === 1 &&
        sniesSearchRes.programs[0].program.sniesCode === '5001',
      'SniesAdapter with verified snapshot must return status=ready and provider=snies'
    );

    // 6.5 Sin AssessmentResult y con AssessmentResult corrupto
    const store: Record<string, string> = {};
    const mockStorage = {
      getItem: (key: string) => (key in store ? store[key] : null),
      setItem: (key: string, val: string) => {
        store[key] = val;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
    };
    const originalLocalStorage = (globalThis as Record<string, unknown>).localStorage;
    (globalThis as Record<string, unknown>).localStorage = mockStorage;

    try {
      const noResultState = loadAndValidateResultsFromStorage();
      assert(
        noResultState.status === 'empty' && noResultState.result === null,
        'Missing AssessmentResult must return status=empty'
      );

      mockStorage.setItem(
        ASSESSMENT_STORAGE_KEY,
        JSON.stringify({ result: { assessmentId: 'bad', topCareers: [] } })
      );
      const corruptState = loadAndValidateResultsFromStorage();
      assert(
        corruptState.status === 'corrupt' && corruptState.result === null,
        'Corrupt AssessmentResult must return status=corrupt'
      );
    } finally {
      (globalThis as Record<string, unknown>).localStorage = originalLocalStorage;
    }

    // Verificar también que la vista de instituciones y la vista de programas provienen del mismo dataset filtrado
    const dualViewCheck = filterAndSortAcademicPrograms({
      programs: MOCK_PROGRAMS,
      institutionsById: Object.fromEntries(
        MOCK_INSTITUTIONS.map((i) => [i.institutionId, i])
      ),
      mappings: MOCK_CAREER_ACADEMIC_MAPPINGS,
      filters: { careerScope: 'specific', careerId: 'engineering_software', status: 'active' },
    });
    const countInInstitutions = dualViewCheck.institutions.reduce(
      (acc, inst) => acc + inst.programs.length,
      0
    );
    assert(
      countInInstitutions === dualViewCheck.programs.length,
      'Institutions grouped view must contain the exact same programs as the Programs view'
    );

    passed++;
    results.push(
      'PASS [F5 Test 06]: Casos borde verificados (sin AssessmentResult, resultado corrupto, carrera inexistente, filtros restrictivos, error de provider y SniesAdapter).'
    );
  }

  return { passed, results };
}
