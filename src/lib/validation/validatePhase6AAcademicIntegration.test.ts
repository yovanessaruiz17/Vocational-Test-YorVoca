import {
  ACADEMIC_CATALOG_AUDIT_REPORT,
} from '../../data/academic/verifiedColombianCatalog';
import { CAREERS } from '../../data/careers';
import { ASSESSMENT_QUESTIONS } from '../../data/questions';
import {
  AcademicRepository,
  defaultAcademicRepository,
  LocalAcademicProvider,
  MockAcademicProvider,
  OFFLINE_ACADEMIC_CACHE_KEY,
  runAcademicIngestionPipeline,
} from '../../services/academic';
import { InstitutionWebsiteAdapter } from '../../services/institutions/InstitutionWebsiteAdapter';
import {
  normalizeModalityField,
  normalizeRawSniesInstitution,
  normalizeRawSniesProgram,
} from '../../services/snies/SniesNormalizer';
import {
  validateSniesInstitution,
  validateSniesProgram,
} from '../../services/snies/SniesValidator';
import { AcademicProgram, Institution } from '../../types/academic';
import { AssessmentAnswer, LikertValue } from '../../types/assessment';
import {
  buildInitialAcademicFilters,
  computeSourceVerificationStatus,
  deduplicateInstitutions,
  deduplicatePrograms,
  detectAcademicConflicts,
  normalizeStudentContextForAcademic,
  resolveAndMergeProgramSources,
  validateAcademicProgram,
  validateAcademicSource,
  validateAcademicSourceRecord,
  validateInstitution,
  verifyOfficialDomain,
} from '../academic';
import { buildAssessmentResult } from '../assessment';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export async function runPhase6AAcademicIntegrationTests(): Promise<{
  passed: number;
  results: string[];
}> {
  const results: string[] = [];
  let passed = 0;

  // Test 1: Fuentes (valid source, invalid source, mock source, stale source)
  {
    const validSniesSource = validateAcademicSourceRecord({
      sourceId: 'src_snies_1205',
      type: 'snies',
      sourceUrl: 'https://hecaa.mineducacion.gov.co/consultaspublicas/programas',
      verificationStatus: 'verified',
      retrievedAt: '2026-10-06T00:00:00.000Z',
      lastVerifiedAt: '2026-10-06T00:00:00.000Z',
    });
    assert(validSniesSource.isValid, 'Valid SNIES source record must be accepted');

    const invalidTypeSource = validateAcademicSourceRecord({
      sourceId: 'src_bad',
      type: 'invented_type',
      sourceUrl: 'https://hecaa.mineducacion.gov.co',
      verificationStatus: 'verified',
    });
    assert(!invalidTypeSource.isValid, 'Invalid source type must be rejected');

    const invalidThirdPartySource = validateAcademicSourceRecord({
      sourceId: 'src_wiki',
      type: 'institution_website',
      sourceUrl: 'https://es.wikipedia.org/wiki/Universidad_de_Cartagena',
      verificationStatus: 'verified',
    });
    assert(!invalidThirdPartySource.isValid, 'Wikipedia URL must be rejected as AcademicSource');

    const mockStatus = computeSourceVerificationStatus({
      sourceType: 'mock',
      lastVerifiedAt: '2026-10-06T00:00:00.000Z',
    });
    assert(mockStatus === 'mock', 'Mock source must always resolve to verificationStatus=mock');

    const staleStatus = computeSourceVerificationStatus({
      sourceType: 'snies',
      lastVerifiedAt: '2024-01-01T00:00:00.000Z',
      referenceDateIso: '2026-10-06T00:00:00.000Z',
    });
    assert(staleStatus === 'stale', 'Old verification date must resolve to stale');

    passed++;
    results.push(
      'PASS [F6A Test 01]: Fuentes validadas (valid source, invalid source, mock source y stale source).'
    );
  }

  // Test 2: Instituciones (valid institution, missing official name, invalid domain, duplicate institution)
  {
    const { institution: validInst, sourceRecord } = normalizeRawSniesInstitution(
      {
        sniesInstitutionCode: '1205',
        nit: '890480123-5',
        officialName: 'Universidad de Cartagena',
        academicCharacter: 'Universidad',
        sector: 'Oficial',
        department: 'Bolívar',
        municipality: 'Cartagena',
        officialWebsiteUrl: 'https://www.unicartagena.edu.co',
        officialDomain: 'unicartagena.edu.co',
        sourceUrl: 'https://www.unicartagena.edu.co',
        retrievedAt: '2026-10-06T00:00:00.000Z',
        lastVerifiedAt: '2026-10-06T00:00:00.000Z',
      },
      '2026-10-06T00:00:00.000Z'
    );
    const checkValid = validateSniesInstitution(validInst, sourceRecord);
    assert(checkValid.isValid, 'Valid SNIES institution must pass validation');

    const missingNameCheck = validateInstitution({
      ...validInst,
      name: '   ',
      officialName: '',
    });
    assert(!missingNameCheck.isValid, 'Institution with missing official name must be rejected');

    const invalidDomainCheck = validateInstitution({
      ...validInst,
      officialDomain: 'unicartagena.edu.co',
      officialWebsiteUrl: 'https://www.universidad-falsa-tercero.com',
    });
    assert(
      !invalidDomainCheck.isValid,
      'Institution whose website URL does not match its officialDomain must be rejected'
    );

    // Duplicados de institución (por mismo código SNIES y por nombre/ciudad normalizados)
    const dupInstA: Institution = { ...validInst, institutionId: 'inst_a' };
    const dupInstB: Institution = {
      ...validInst,
      institutionId: 'inst_b',
      sniesCode: undefined,
      sniesInstitutionCode: undefined,
      name: 'Univ. de Cartagena',
      officialName: 'Univ. de Cartagena',
    };
    const deduped = deduplicateInstitutions([dupInstA, dupInstB]);
    assert(
      deduped.institutions.length === 1 && deduped.duplicatesMerged === 1,
      'Duplicate institutions must be merged into a single canonical institution'
    );

    passed++;
    results.push(
      'PASS [F6A Test 02]: Instituciones validadas (valid institution, missing officialName, invalid domain y duplicate institution).'
    );
  }

  // Test 3: Programas (valid program, missing institution, invalid SNIES code format, invalid status)
  {
    const baseInst: Institution = {
      institutionId: 'snies_inst_1205',
      name: 'Universidad de Cartagena',
      officialName: 'Universidad de Cartagena',
      institutionType: 'university',
      sector: 'public',
      city: 'Cartagena',
      municipality: 'Cartagena',
      department: 'Bolívar',
      sniesCode: '1205',
      sniesInstitutionCode: '1205',
      officialWebsiteUrl: 'https://www.unicartagena.edu.co',
      officialDomain: 'unicartagena.edu.co',
      sourceStatus: 'verified',
      source: {
        provider: 'snies',
        type: 'snies',
        sourceUrl: 'https://www.unicartagena.edu.co',
        verificationStatus: 'verified',
      },
    };

    const { program: validProg, sourceRecord: progSrc } = normalizeRawSniesProgram(
      {
        sniesProgramCode: '20828',
        sniesInstitutionCode: '1205',
        officialName: 'Ingeniería de Sistemas',
        academicLevel: 'Universitario',
        modality: 'Presencial',
        department: 'Bolívar',
        municipality: 'Cartagena',
        status: 'Activo',
        officialProgramUrl: 'https://www.unicartagena.edu.co',
        sourceUrl: 'https://www.unicartagena.edu.co',
        retrievedAt: '2026-10-06T00:00:00.000Z',
        lastVerifiedAt: '2026-10-06T00:00:00.000Z',
      },
      baseInst.institutionId,
      '2026-10-06T00:00:00.000Z'
    );

    const checkValidProg = validateSniesProgram(validProg, baseInst, progSrc);
    assert(checkValidProg.isValid, 'Valid SNIES program must pass validation');

    const checkMissingInst = validateSniesProgram(validProg, undefined, progSrc);
    assert(
      !checkMissingInst.isValid,
      'Program without an existing parent institution must be rejected'
    );

    const checkInvalidSniesCode = validateAcademicProgram(
      {
        ...validProg,
        sniesCode: 'SNIES-ABC-999',
      },
      baseInst
    );
    assert(
      !checkInvalidSniesCode.isValid,
      'Program with non-numeric SNIES code format must be rejected'
    );

    const checkInvalidStatus = validateAcademicProgram(
      {
        ...validProg,
        status: 'archived_invalid' as AcademicProgram['status'],
      },
      baseInst
    );
    assert(!checkInvalidStatus.isValid, 'Program with invalid status must be rejected');

    passed++;
    results.push(
      'PASS [F6A Test 03]: Programas validados (valid program, missing institution, invalid SNIES code format e invalid status).'
    );
  }

  // Test 4: Dominio oficial (official domain accepted, third-party domain rejected, fake domain rejected)
  {
    const utbInst = {
      name: 'Universidad Tecnológica de Bolívar',
      officialName: 'Universidad Tecnológica de Bolívar',
      officialDomain: 'utb.edu.co',
      officialWebsiteUrl: 'https://www.utb.edu.co',
    };

    const officialAccepted = verifyOfficialDomain(
      utbInst,
      'https://www.utb.edu.co/programas/ingenieria-de-sistemas'
    );
    assert(
      officialAccepted.isValid && officialAccepted.isOfficialInstitutionDomain,
      'Official institutional domain and subdomain over HTTPS must be accepted'
    );

    const thirdPartyWiki = verifyOfficialDomain(
      utbInst,
      'https://es.wikipedia.org/wiki/Universidad_Tecnol%C3%B3gica_de_Bol%C3%ADvar'
    );
    assert(
      !thirdPartyWiki.isValid && thirdPartyWiki.isThirdPartyBlocked,
      'Wikipedia third-party domain must be rejected'
    );

    const thirdPartyAggregator = verifyOfficialDomain(
      utbInst,
      'https://www.educaedu.com.co/universidad-tecnologica-de-bolivar'
    );
    assert(
      !thirdPartyAggregator.isValid && thirdPartyAggregator.isThirdPartyBlocked,
      'Educational aggregator domain must be rejected'
    );

    const thirdPartyGoogle = verifyOfficialDomain(
      utbInst,
      'https://www.google.com/search?q=utb+ingenieria+de+sistemas'
    );
    assert(
      !thirdPartyGoogle.isValid && thirdPartyGoogle.isThirdPartyBlocked,
      'Google search result URL must be rejected'
    );

    const fakeDomainA = verifyOfficialDomain(utbInst, 'https://utb-fake.com/ingenieria');
    assert(!fakeDomainA.isValid, 'Lookalike fake domain (utb-fake.com) must be rejected');

    const fakeDomainB = verifyOfficialDomain(
      utbInst,
      'https://utb.edu.co.phishing-site.com/programa'
    );
    assert(
      !fakeDomainB.isValid,
      'Subdomain spoofing (utb.edu.co.phishing-site.com) must be rejected'
    );

    const insecureHttp = verifyOfficialDomain(utbInst, 'http://www.utb.edu.co');
    assert(!insecureHttp.isValid && !insecureHttp.isHttps, 'Non-HTTPS URL must be rejected');

    passed++;
    results.push(
      'PASS [F6A Test 04]: Dominio oficial verificado (official domain accepted, third-party rejected y fake/lookalike domain rejected).'
    );
  }

  // Test 5: Duplicados (same SNIES code, same normalized institution/program, different institutions with same program name)
  {
    const instCartagena: Institution = {
      institutionId: 'snies_inst_1205',
      name: 'Universidad de Cartagena',
      officialName: 'Universidad de Cartagena',
      institutionType: 'university',
      sector: 'public',
      city: 'Cartagena',
      department: 'Bolívar',
      sniesCode: '1205',
      sniesInstitutionCode: '1205',
      source: { provider: 'snies' },
    };

    const instUtb: Institution = {
      institutionId: 'snies_inst_1830',
      name: 'Universidad Tecnológica de Bolívar',
      officialName: 'Universidad Tecnológica de Bolívar',
      institutionType: 'university',
      sector: 'private',
      city: 'Cartagena',
      department: 'Bolívar',
      sniesCode: '1830',
      sniesInstitutionCode: '1830',
      source: { provider: 'snies' },
    };

    const institutionsMap = {
      [instCartagena.institutionId]: instCartagena,
      [instUtb.institutionId]: instUtb,
    };

    const progSniesA: AcademicProgram = {
      programId: 'prog_1',
      institutionId: instCartagena.institutionId,
      name: 'Ingeniería de Sistemas',
      academicLevel: 'professional',
      modality: 'presential',
      city: 'Cartagena',
      department: 'Bolívar',
      sniesCode: '20828',
      status: 'active',
      source: { provider: 'snies' },
    };

    // 5.1 Mismo código SNIES
    const progSniesDuplicate: AcademicProgram = {
      ...progSniesA,
      programId: 'prog_1_dup_snies',
      name: 'INGENIERIA DE SISTEMAS',
    };

    // 5.2 Mismo programa e institución escrito como abreviatura ("Ing. de Sistemas") sin código SNIES
    const progAbbrevDuplicate: AcademicProgram = {
      ...progSniesA,
      programId: 'prog_1_abbrev',
      sniesCode: undefined,
      name: 'Ing. de Sistemas',
      officialName: 'Ing. de Sistemas',
    };

    // 5.3 Diferente institución con el mismo nombre de programa ("Ingeniería de Sistemas" en UTB)
    const progDifferentInst: AcademicProgram = {
      programId: 'prog_2_utb',
      institutionId: instUtb.institutionId,
      name: 'Ingeniería de Sistemas',
      academicLevel: 'professional',
      modality: 'presential',
      city: 'Cartagena',
      department: 'Bolívar',
      sniesCode: undefined,
      status: 'active',
      source: { provider: 'institution_website' },
    };

    const dedupResult = deduplicatePrograms(
      [progSniesA, progSniesDuplicate, progAbbrevDuplicate, progDifferentInst],
      institutionsMap
    );

    assert(
      dedupResult.programs.length === 2 && dedupResult.duplicatesMerged === 2,
      `Expected 2 unique programs (U. de Cartagena + UTB) and 2 merged duplicates, got ${dedupResult.programs.length} programs`
    );

    passed++;
    results.push(
      'PASS [F6A Test 05]: Deduplicación verificada (mismo código SNIES, abreviatura "Ing. de Sistemas" vs "Ingeniería de Sistemas", y preservación entre instituciones distintas).'
    );
  }

  // Test 6: Conflictos y Precedencia (SNIES vs university website)
  {
    const uCartagena: Institution = {
      institutionId: 'snies_inst_1205',
      name: 'Universidad de Cartagena',
      officialName: 'Universidad de Cartagena',
      institutionType: 'university',
      sector: 'public',
      city: 'Cartagena',
      department: 'Bolívar',
      sniesCode: '1205',
      sniesInstitutionCode: '1205',
      officialDomain: 'unicartagena.edu.co',
      officialWebsiteUrl: 'https://www.unicartagena.edu.co',
      source: { provider: 'snies' },
    };

    const sniesRegProgram: AcademicProgram = {
      programId: 'snies_prog_20828',
      institutionId: uCartagena.institutionId,
      name: 'Ingeniería de Sistemas',
      officialName: 'Ingeniería de Sistemas',
      academicLevel: 'professional',
      modality: 'presential', // SNIES dice Presencial
      city: 'Cartagena',
      municipality: 'Cartagena',
      department: 'Bolívar',
      sniesCode: '20828',
      status: 'active',
      source: { provider: 'snies', type: 'snies' },
    };

    // Sitio web institucional contradice la modalidad (dice Virtual) pero aporta descripción y duración
    const conflictingWebsiteInput = {
      sniesProgramCode: '20828',
      sourceUrl: 'https://www.unicartagena.edu.co',
      modalityText: 'Virtual',
      description: 'Descripción oficial tomada del portal institucional.',
      duration: '10 semestres',
      professionalProfile: 'Ingeniero de sistemas con sólida formación.',
      retrievedAt: '2026-10-06T00:00:00.000Z',
      lastVerifiedAt: '2026-10-06T00:00:00.000Z',
    };

    const detected = detectAcademicConflicts(sniesRegProgram, conflictingWebsiteInput);
    assert(
      detected.length === 1 &&
        detected[0].field === 'modality' &&
        detected[0].valueA === 'presential' &&
        detected[0].valueB === 'virtual',
      'Conflict between SNIES (presential) and website (virtual) must be explicitly detected'
    );

    const resolved = resolveAndMergeProgramSources({
      sniesProgram: sniesRegProgram,
      institution: uCartagena,
      websiteInput: conflictingWebsiteInput,
    });

    // Precedencia regulatoria: SNIES conserva autoridad sobre modality, sniesCode, status y city
    assert(
      resolved.program.modality === 'presential' &&
        resolved.program.sniesCode === '20828' &&
        resolved.program.status === 'active' &&
        resolved.program.city === 'Cartagena',
      'SNIES must retain regulatory precedence over modality, sniesCode, status and city'
    );

    // Precedencia descriptiva: el sitio web oficial aporta description, duration, professionalProfile y officialProgramUrl
    assert(
      resolved.officialContent !== null &&
        resolved.officialContent.description ===
          'Descripción oficial tomada del portal institucional.' &&
        resolved.officialContent.duration === '10 semestres' &&
        resolved.program.officialProgramUrl === 'https://www.unicartagena.edu.co' &&
        resolved.conflicts.length === 1,
      'Institution website must retain authority on descriptive content while preserving conflict record'
    );

    // Verificar además que InstitutionWebsiteAdapter rechaza dominios falsos o de terceros
    const webAdapter = new InstitutionWebsiteAdapter();
    const rejectedEnrichment = webAdapter.enrichProgramWithOfficialWebsite({
      sniesProgram: sniesRegProgram,
      institution: uCartagena,
      websiteInput: {
        ...conflictingWebsiteInput,
        sourceUrl: 'https://unicartagena-fake.com/sistemas',
      },
    });
    assert(
      !rejectedEnrichment.accepted && rejectedEnrichment.officialContent === null,
      'InstitutionWebsiteAdapter must reject fake domain enrichment'
    );

    passed++;
    results.push(
      'PASS [F6A Test 06]: Detección de conflictos y reglas de precedencia verificadas (SNIES regulatorio vs Sitio Oficial descriptivo).'
    );
  }

  // Test 7: Regla estricta de Mock (mock nunca aparece como verified) + Normalización de modalidades
  {
    const modA = normalizeModalityField('Presencial');
    const modB = normalizeModalityField('PRESENCIAL');
    const modC = normalizeModalityField('presencial');
    assert(
      modA.normalizedValue === 'presential' &&
        modB.normalizedValue === 'presential' &&
        modC.normalizedValue === 'presential' &&
        modB.rawValue === 'PRESENCIAL',
      'Modality normalizer must normalize Presencial/PRESENCIAL/presencial while preserving rawValue'
    );

    const mockWithVerifiedSource = validateAcademicSource({
      provider: 'mock',
      verificationStatus: 'verified',
    });
    assert(
      !mockWithVerifiedSource.isValid,
      'Mock provider with verificationStatus=verified must be rejected'
    );

    const mockProvider = new MockAcademicProvider();
    const mockRes = await mockProvider.searchPrograms({
      careerScope: 'all',
      status: 'active',
    });
    assert(
      mockRes.provider === 'mock' &&
        mockRes.status === 'mock' &&
        mockRes.programs.every(
          (p) =>
            p.program.source.provider === 'mock' &&
            p.program.sourceStatus === 'mock' &&
            p.program.sourceStatus !== ('verified' as unknown)
        ),
      'MockAcademicProvider must never label any record as verified'
    );

    passed++;
    results.push(
      'PASS [F6A Test 07]: Aislamiento de Mock verificado (mock jamás aparece como verified) y normalización con rawValue/normalizedValue.'
    );
  }

  // Test 8: Pipeline de ingestión, LocalAcademicProvider, modo offline y preservación del motor vocacional
  {
    const sampleAnswers: AssessmentAnswer[] = ASSESSMENT_QUESTIONS.map((q, idx) => ({
      questionId: q.id,
      value: (((idx % 5) + 1) as LikertValue),
      answeredAt: '2026-10-06T16:00:00.000Z',
    }));
    const assessmentResult = buildAssessmentResult(sampleAnswers);
    const snapshotBefore = JSON.stringify({
      dimensionScores: assessmentResult.dimensionScores,
      familyScores: assessmentResult.familyScores,
      careerScores: assessmentResult.careerScores,
      topCareers: assessmentResult.topCareers,
    });

    // Verificar repositorio real cargado por el pipeline de ingestión
    const institutions = defaultAcademicRepository.getAllInstitutions();
    const programs = defaultAcademicRepository.getAllPrograms();
    const runs = defaultAcademicRepository.getIngestionRuns();

    assert(
      institutions.length === 11 && programs.length === 33 && runs.length >= 1,
      `Expected 11 real verified institutions and 33 programs, got ${institutions.length} institutions and ${programs.length} programs`
    );

    // Verificar consulta con LocalAcademicProvider en Cartagena
    const localProvider = new LocalAcademicProvider({
      repository: defaultAcademicRepository,
    });
    const cartagenaSearch = await localProvider.searchPrograms({
      careerScope: 'specific',
      careerId: 'engineering_systems',
      city: 'Cartagena',
      status: 'active',
    });

    assert(
      cartagenaSearch.status === 'ready' &&
        cartagenaSearch.provider === 'snies' &&
        cartagenaSearch.programs.length >= 3 &&
        cartagenaSearch.programs.every((p) => p.program.city === 'Cartagena'),
      'LocalAcademicProvider must return real verified Engineering Systems programs in Cartagena (Unicartagena, UTB, Tecnológico Comfenalco, UMayor, SENA)'
    );

    // Verificar filtro verifiedOnly (F6A.1: solo devuelve programas con sniesCode individual verificado)
    const verifiedOnlySearch = await localProvider.searchPrograms({
      careerScope: 'all',
      verifiedOnly: true,
      status: 'active',
    });
    assert(
      verifiedOnlySearch.programs.length === 18 &&
        verifiedOnlySearch.programs.every(
          (p) =>
            p.program.sourceStatus === 'verified' &&
            p.program.source.provider !== 'mock' &&
            Boolean(p.program.sniesCode)
        ),
      `verifiedOnly filter must strictly return the 18 programs with verified individual SNIES code, got ${verifiedOnlySearch.programs.length}`
    );

    // Verificar soporte de caché offline PWA distinguiendo isFromOfflineCache
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
    const origWindow = (globalThis as Record<string, unknown>).window;
    (globalThis as Record<string, unknown>).window = { localStorage: mockStorage };

    try {
      // Primera búsqueda online guarda el snapshot en localStorage
      await localProvider.searchPrograms({ careerScope: 'all', status: 'active' });
      assert(
        Boolean(store[OFFLINE_ACADEMIC_CACHE_KEY]),
        'Online search must populate offline cache snapshot in localStorage'
      );

      // Segunda búsqueda simulando modo offline lee desde caché y marca isFromOfflineCache = true
      const offlineProvider = new LocalAcademicProvider({
        repository: new AcademicRepository({ institutions: [], programs: [] }),
        simulateOfflineFromCache: true,
      });
      const offlineRes = await offlineProvider.searchPrograms({
        careerScope: 'specific',
        careerId: 'engineering_systems',
        city: 'Cartagena',
      });
      assert(
        offlineRes.status === 'ready' &&
          offlineRes.cacheMetadata?.isFromOfflineCache === true &&
          offlineRes.programs.length >= 3,
        'Offline provider must serve cached academic data and explicitly flag isFromOfflineCache=true'
      );
    } finally {
      (globalThis as Record<string, unknown>).window = origWindow;
    }

    // Verificar que runAcademicIngestionPipeline rechaza registros inválidos sin corromper el lote
    const customRun = runAcademicIngestionPipeline({
      institutions: [
        {
          sniesInstitutionCode: '1205',
          officialName: 'Universidad de Cartagena',
          academicCharacter: 'Universidad',
          sector: 'Oficial',
          department: 'Bolívar',
          municipality: 'Cartagena',
          officialWebsiteUrl: 'https://www.unicartagena.edu.co',
          officialDomain: 'unicartagena.edu.co',
          sourceUrl: 'https://www.unicartagena.edu.co',
          retrievedAt: '2026-10-06T00:00:00.000Z',
          lastVerifiedAt: '2026-10-06T00:00:00.000Z',
        },
      ],
      programs: [
        {
          sniesProgramCode: '20828',
          sniesInstitutionCode: '1205',
          officialName: 'Ingeniería de Sistemas',
          academicLevel: 'Universitario',
          modality: 'Presencial',
          department: 'Bolívar',
          municipality: 'Cartagena',
          status: 'Activo',
          sourceUrl: 'https://www.unicartagena.edu.co',
          retrievedAt: '2026-10-06T00:00:00.000Z',
          lastVerifiedAt: '2026-10-06T00:00:00.000Z',
        },
        // Programa huérfano cuya institución no existe
        {
          sniesProgramCode: '99999',
          sniesInstitutionCode: '8888',
          officialName: 'Programa Huérfano',
          academicLevel: 'Universitario',
          modality: 'Presencial',
          department: 'Bolívar',
          municipality: 'Cartagena',
          status: 'Activo',
          sourceUrl: 'https://hecaa.mineducacion.gov.co/consultaspublicas/programas',
          retrievedAt: '2026-10-06T00:00:00.000Z',
          lastVerifiedAt: '2026-10-06T00:00:00.000Z',
        },
      ],
    });
    assert(
      customRun.institutions.length === 1 &&
        customRun.programs.length === 1 &&
        customRun.run.recordsFailed === 1,
      'Ingestion pipeline must accept valid records and count failed orphan records'
    );

    // Verificar invariante del motor vocacional (Sección 38)
    const snapshotAfter = JSON.stringify({
      dimensionScores: assessmentResult.dimensionScores,
      familyScores: assessmentResult.familyScores,
      careerScores: assessmentResult.careerScores,
      topCareers: assessmentResult.topCareers,
    });
    assert(
      snapshotBefore === snapshotAfter,
      'Phase 6A academic integration must never alter dimensionScores, familyScores, careerScores or topCareers'
    );

    passed++;
    results.push(
      'PASS [F6A Test 08]: Pipeline de ingestión, LocalAcademicProvider (11 instituciones y 33 programas reales), caché offline PWA e invariante vocacional verificados.'
    );
  }

  // Test 9: Auditoría F6A.1 de integridad de códigos SNIES, procedencia primaria y ausencia de códigos erróneos
  {
    const institutions = defaultAcademicRepository.getAllInstitutions();
    const programs = defaultAcademicRepository.getAllPrograms();
    const officialContents = [
      defaultAcademicRepository.getOfficialContentByProgramId('snies_prog_20828'),
      defaultAcademicRepository.getOfficialContentByProgramId(
        'prog_snies_inst_1830_ingenieria_de_sistemas_cartagena'
      ),
      defaultAcademicRepository.getOfficialContentByProgramId('snies_prog_737'),
      defaultAcademicRepository.getOfficialContentByProgramId('snies_prog_106661'),
    ];

    assert(
      officialContents.every((c) => c !== null),
      'All 4 official descriptive contents must be linked to their audited canonical programIds'
    );

    // 9.1 Ningún código IES erróneo de F6A debe permanecer en el catálogo
    const forbiddenInstitutionCodes = new Set(['1206', '1828', '2725', '2209', '1714']);
    for (const inst of institutions) {
      if (inst.sniesInstitutionCode) {
        assert(
          !forbiddenInstitutionCodes.has(inst.sniesInstitutionCode),
          `Audited catalog must not contain erroneous institutional SNIES code ${inst.sniesInstitutionCode} (${inst.name})`
        );
      }
    }

    // 9.2 Verificar los 10 códigos IES primarios y la institución sin código IES local (Tecnológico Comfenalco)
    const instWithSnies = institutions.filter((i) => Boolean(i.sniesInstitutionCode));
    const instWithoutSnies = institutions.filter((i) => !i.sniesInstitutionCode);
    assert(
      instWithSnies.length === 10 &&
        instWithoutSnies.length === 1 &&
        instWithoutSnies[0].officialName ===
          'Fundación Universitaria Tecnológico Comfenalco' &&
        instWithoutSnies[0].nit === '890481183-1' &&
        instWithoutSnies[0].source.type === 'institution_website',
      'Catalog must have 10 SNIES-coded institutions and 1 official website-backed institution (Tecnológico Comfenalco)'
    );

    // 9.3 Ningún código SNIES de programa falso/no verificado de F6A debe existir
    const forbiddenProgramCodes = new Set([
      '9136',
      '445',
      '449',
      '448',
      '442',
      '440',
      '441',
      '443',
      '452',
      '1507',
      '1505',
      '1504',
      '19',
      '1',
      '7',
      '8',
    ]);
    for (const prog of programs) {
      if (prog.sniesCode) {
        assert(
          !forbiddenProgramCodes.has(prog.sniesCode),
          `Audited catalog must not contain unverified program SNIES code ${prog.sniesCode} (${prog.name})`
        );
      }
    }

    // 9.4 Verificar conteo exacto: 18 programas con código SNIES primario y 15 programas parciales sin sniesCode
    const programsWithSnies = programs.filter((p) => Boolean(p.sniesCode));
    const programsWithoutSnies = programs.filter((p) => !p.sniesCode);
    assert(
      programsWithSnies.length === 18 && programsWithoutSnies.length === 15,
      `Expected 18 programs with verified SNIES code and 15 without SNIES code, got ${programsWithSnies.length} and ${programsWithoutSnies.length}`
    );

    // 9.5 Ningún programa sin sniesCode puede tener source.type === 'snies'
    assert(
      programsWithoutSnies.every((p) => p.source.type !== 'snies'),
      'Programs without an individual SNIES code must never claim source.type === "snies"'
    );

    // 9.6 Verificar manifiesto de auditoría F6A.1
    assert(
      ACADEMIC_CATALOG_AUDIT_REPORT.length >= 10,
      'ACADEMIC_CATALOG_AUDIT_REPORT must document all institutional and program audit corrections'
    );

    passed++;
    results.push(
      'PASS [F6A.1 Test 09]: Auditoría de calidad, verificabilidad, procedencia primaria y depuración de códigos SNIES no verificados completada.'
    );
  }

  // Test 10: F6A.2 Corrección definitiva del pipeline del Academic Explorer (0 carreras en blanco y priorización por preferencias)
  {
    const localProvider = new LocalAcademicProvider({
      repository: defaultAcademicRepository,
    });

    // Simular un estudiante con preferencias restrictivas en el onboarding (ej. Cartagena, Misma ciudad, Distancia/Virtual, Privada)
    const restrictiveOnboardingContext = {
      currentLocation: { department: 'Bolívar', city: 'Cartagena' },
      targetLocation: { department: 'Bolívar', city: 'Cartagena' },
      locationFlexibility: 'Misma ciudad' as const,
      preferredModality: 'Distancia' as const,
      preferredInstitutionType: 'Universidad' as const,
      preferredSector: 'Privada' as const,
      isComplete: true,
    };

    const normalizedPrefs = normalizeStudentContextForAcademic(restrictiveOnboardingContext);
    assert(
      normalizedPrefs.preferredInstitutionType === 'university' &&
        normalizedPrefs.preferredSector === 'private' &&
        normalizedPrefs.preferredModality === 'hybrid',
      'Student context must separate institutionType=university, sector=private and modality=hybrid'
    );

    // Verificar las 5 carreras críticas auditadas: Diseño Digital, Ingeniería de Sistemas, Diseño Gráfico, Administración de Empresas, Derecho
    const criticalCareerIds = [
      'digital_design',
      'engineering_systems',
      'graphic_design',
      'business_administration',
      'law',
    ];

    for (const careerId of criticalCareerIds) {
      const initialFilters = buildInitialAcademicFilters({
        studentContext: restrictiveOnboardingContext,
        selectedCareerId: careerId,
      });

      const res = await localProvider.searchPrograms(initialFilters, {
        studentContext: normalizedPrefs,
      });

      assert(
        res.status === 'ready' &&
          res.programs.length > 0 &&
          res.institutions.length > 0,
        `Career "${careerId}" must return > 0 programs and > 0 institutions with initial explorer filters, got ${res.programs.length}`
      );
    }

    // Verificar que las 35 carreras del catálogo vocacional devuelven > 0 programas en el explorador
    for (const career of CAREERS) {
      const initialFilters = buildInitialAcademicFilters({
        studentContext: restrictiveOnboardingContext,
        selectedCareerId: career.id,
      });
      const res = await localProvider.searchPrograms(initialFilters, {
        studentContext: normalizedPrefs,
      });
      assert(
        res.programs.length > 0 && res.institutions.length > 0,
        `Every career in CAREERS must have > 0 matching programs in the catalog; failed for ${career.id} (${career.name})`
      );
    }

    // Verificar que cuando el usuario aplica un filtro explícito imposible (ej. Diseño Gráfico en Manizales Virtual),
    // unfilteredCareerProgramsCount informa cuántos programas existen en Colombia sin esos filtros
    const emptyExplicitRes = await localProvider.searchPrograms({
      careerScope: 'specific',
      careerId: 'digital_design',
      city: 'Manizales',
      modality: 'virtual',
    });
    assert(
      emptyExplicitRes.status === 'empty' &&
        emptyExplicitRes.programs.length === 0 &&
        typeof emptyExplicitRes.unfilteredCareerProgramsCount === 'number' &&
        emptyExplicitRes.unfilteredCareerProgramsCount >= 5,
      `Explicit restrictive filter must report unfilteredCareerProgramsCount >= 5 for digital_design, got ${emptyExplicitRes.unfilteredCareerProgramsCount}`
    );

    passed++;
    results.push(
      'PASS [F6A.2 Test 10]: Pipeline del Academic Explorer verificado (las 5 carreras auditadas y las 35 carreras del catálogo retornan > 0 programas e instituciones sin bloqueos silenciosos por onboarding).'
    );
  }

  return { passed, results };
}
