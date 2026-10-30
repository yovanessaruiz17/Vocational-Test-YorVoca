import {
  CAREER_FAMILIES_BY_ID,
  CAREERS,
  CAREERS_BY_ID,
  DIMENSIONS_BY_ID,
} from '../../data/careers';
import {
  CAREER_LEARNING_PATHS,
  VERIFIED_LEARNING_CATALOG_TIMESTAMP,
  VERIFIED_LEARNING_RESOURCES,
  VERIFIED_LEARNING_SOURCES,
} from '../../data/learning/verifiedLearningCatalog';
import { ASSESSMENT_QUESTIONS } from '../../data/questions';
import {
  defaultLearningRepository,
  defaultLocalLearningProvider,
  getLearningExplorerProvider,
  LearningRepository,
  LocalLearningProvider,
} from '../../services/learning';
import { AssessmentAnswer, LikertValue } from '../../types/assessment';
import {
  CareerLearningPath,
  LearningResource,
  LearningSourceReference,
} from '../../types/learning';
import { buildAssessmentResult } from '../assessment';
import {
  isValidIsoTimestamp,
  isValidLearningCanonicalUrl,
  normalizeLearningText,
  validateCareerLearningPath,
  validateLearningCanonicalUrl,
  validateLearningCatalogIntegrity,
  validateLearningResource,
  validateLearningSourceReference,
} from '../learning/validateLearningModels';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export async function runPhase6B1LearningDomainTests(): Promise<{
  passed: number;
  results: string[];
}> {
  const results: string[] = [];

  const runTest = async (name: string, fn: () => void | Promise<void>) => {
    await fn();
    results.push(`PASS: ${name}`);
  };

  const sourcesById = Object.fromEntries(
    VERIFIED_LEARNING_SOURCES.map((s) => [s.id, s])
  );
  const resourcesById = Object.fromEntries(
    VERIFIED_LEARNING_RESOURCES.map((r) => [r.id, r])
  );

  // =========================================================================
  // 1. INTEGRIDAD DE FUENTES
  // =========================================================================
  await runTest(
    '1. Integridad de fuentes: todas las fuentes tienen IDs únicos, URLs https:// válidas y fechas ISO válidas',
    () => {
      assert(
        VERIFIED_LEARNING_SOURCES.length >= 15,
        `Se esperaban al menos 15 fuentes verificadas, hay ${VERIFIED_LEARNING_SOURCES.length}`
      );
      assert(
        isValidIsoTimestamp(VERIFIED_LEARNING_CATALOG_TIMESTAMP),
        'VERIFIED_LEARNING_CATALOG_TIMESTAMP debe ser fecha ISO válida'
      );

      const seenSourceIds = new Set<string>();
      for (const source of VERIFIED_LEARNING_SOURCES) {
        assert(
          !seenSourceIds.has(source.id),
          `ID duplicado en VERIFIED_LEARNING_SOURCES: ${source.id}`
        );
        seenSourceIds.add(source.id);

        const validation = validateLearningSourceReference(source);
        assert(
          validation.valid,
          `Fuente inválida ${source.id}: ${validation.errors.join(' | ')}`
        );
        assert(
          source.canonicalUrl.startsWith('https://'),
          `Fuente ${source.id} debe usar https:// (${source.canonicalUrl})`
        );
        assert(
          isValidIsoTimestamp(source.verifiedAt),
          `Fuente ${source.id} tiene verifiedAt inválido (${source.verifiedAt})`
        );
      }
    }
  );

  // =========================================================================
  // 2. INTEGRIDAD DE RECURSOS
  // =========================================================================
  await runTest(
    '2. Integridad de recursos: todos los recursos tienen careerIds, familyIds y relatedDimensionIds válidos y URLs limpias',
    () => {
      assert(
        VERIFIED_LEARNING_RESOURCES.length >= 15,
        `Se esperaban al menos 15 recursos controlados, hay ${VERIFIED_LEARNING_RESOURCES.length}`
      );

      const seenResourceIds = new Set<string>();
      for (const resource of VERIFIED_LEARNING_RESOURCES) {
        assert(
          !seenResourceIds.has(resource.id),
          `ID duplicado en VERIFIED_LEARNING_RESOURCES: ${resource.id}`
        );
        seenResourceIds.add(resource.id);

        const validation = validateLearningResource(resource, sourcesById);
        assert(
          validation.valid,
          `Recurso inválido ${resource.id}: ${validation.errors.join(' | ')}`
        );

        for (const careerId of resource.careerIds) {
          assert(
            Boolean(CAREERS_BY_ID[careerId]),
            `Recurso ${resource.id} referencia careerId inexistente: ${careerId}`
          );
        }
        for (const familyId of resource.familyIds) {
          assert(
            Boolean(CAREER_FAMILIES_BY_ID[familyId]),
            `Recurso ${resource.id} referencia familyId inexistente: ${familyId}`
          );
        }
        for (const dimId of resource.relatedDimensionIds) {
          assert(
            Boolean(DIMENSIONS_BY_ID[dimId]),
            `Recurso ${resource.id} referencia dimensionId inexistente: ${dimId}`
          );
        }

        assert(
          isValidLearningCanonicalUrl(resource.canonicalUrl),
          `Recurso ${resource.id} tiene canonicalUrl inválida: ${resource.canonicalUrl}`
        );
        assert(
          Boolean(
            resource.prerequisitesNote &&
              resource.prerequisitesNote.trim().length > 0
          ),
          `Recurso ${resource.id} debe tener prerequisitesNote no vacío`
        );
        assert(
          resource.normalizedTitle === normalizeLearningText(resource.title),
          `Recurso ${resource.id} tiene normalizedTitle discrepante del título`
        );
      }
    }
  );

  // =========================================================================
  // 3. INTEGRIDAD DE RUTAS DE APRENDIZAJE
  // =========================================================================
  await runTest(
    '3. Integridad de rutas de aprendizaje: 47 rutas exactas, 1 por cada carrera de CAREERS, >=3 pasos secuenciales y linkedResourceIds válidos',
    () => {
      assert(
        CAREERS.length === 47,
        `El catálogo vocacional debe tener 47 carreras, tiene ${CAREERS.length}`
      );
      assert(
        CAREER_LEARNING_PATHS.length === 47,
        `CAREER_LEARNING_PATHS debe tener exactamente 47 rutas, tiene ${CAREER_LEARNING_PATHS.length}`
      );

      const seenPathIds = new Set<string>();
      const seenCareerIds = new Set<string>();
      const seenStepIds = new Set<string>();

      for (const path of CAREER_LEARNING_PATHS) {
        assert(!seenPathIds.has(path.id), `ID de ruta duplicado: ${path.id}`);
        seenPathIds.add(path.id);

        assert(
          !seenCareerIds.has(path.careerId),
          `Carrera duplicada en CAREER_LEARNING_PATHS: ${path.careerId}`
        );
        seenCareerIds.add(path.careerId);

        const pathValidation = validateCareerLearningPath(path, resourcesById);
        assert(
          pathValidation.valid,
          `Ruta inválida ${path.id}: ${pathValidation.errors.join(' | ')}`
        );

        assert(
          path.steps.length >= 3,
          `Ruta ${path.id} debe tener al menos 3 pasos`
        );

        path.steps.forEach((step, idx) => {
          assert(
            !seenStepIds.has(step.id),
            `ID de paso duplicado: ${step.id}`
          );
          seenStepIds.add(step.id);
          assert(
            step.order === idx + 1,
            `Paso ${step.id} en ${path.id} tiene orden ${step.order}, esperado ${idx + 1}`
          );
          for (const resId of step.linkedResourceIds) {
            assert(
              Boolean(resourcesById[resId]),
              `Paso ${step.id} referencia linkedResourceId inexistente: ${resId}`
            );
          }
        });
      }

      for (const career of CAREERS) {
        assert(
          seenCareerIds.has(career.id),
          `La carrera ${career.id} (${career.name}) no tiene ruta en CAREER_LEARNING_PATHS`
        );
      }

      const catalogIntegrity = validateLearningCatalogIntegrity(
        VERIFIED_LEARNING_SOURCES,
        VERIFIED_LEARNING_RESOURCES,
        CAREER_LEARNING_PATHS
      );
      assert(
        catalogIntegrity.valid,
        `Fallo de integridad global del catálogo: ${catalogIntegrity.errors.join(' | ')}`
      );
    }
  );

  // =========================================================================
  // 4. RECHAZO DE DATOS INVÁLIDOS
  // =========================================================================
  await runTest(
    '4. Rechazo de datos inválidos: URLs http/example/placeholder/javascript, careerId inexistente y pasos desordenados o incompletos fallan',
    () => {
      const badUrls = [
        'http://developer.mozilla.org/es/',
        'https://example.com/curso',
        'https://localhost:3000/recurso',
        'https://127.0.0.1/test',
        'https://portal-educativo.org/placeholder-link',
        'https://portal-educativo.org/todo-course',
        'https://mock-university.edu.co',
        'https://fake-courses.org',
        'javascript:alert(1)',
        'data:text/html,<h1>Curso</h1>',
        '',
      ];

      for (const badUrl of badUrls) {
        const check = validateLearningCanonicalUrl(badUrl);
        assert(
          !check.valid,
          `La URL inválida "${badUrl}" debió ser rechazada por validateLearningCanonicalUrl`
        );
      }

      const baseResource = VERIFIED_LEARNING_RESOURCES[0];

      const resourceWithHttp: LearningResource = {
        ...baseResource,
        id: 'res_invalid_http',
        canonicalUrl: 'http://developer.mozilla.org/es/docs/Learn',
      };
      assert(
        !validateLearningResource(resourceWithHttp, sourcesById).valid,
        'Un recurso con http:// debe fallar la validación'
      );

      const resourceWithExampleDomain: LearningResource = {
        ...baseResource,
        id: 'res_invalid_example',
        canonicalUrl: 'https://example.com/curso-python',
      };
      assert(
        !validateLearningResource(resourceWithExampleDomain, sourcesById).valid,
        'Un recurso con example.com debe fallar la validación'
      );

      const resourceWithInvalidCareer: LearningResource = {
        ...baseResource,
        id: 'res_invalid_career',
        careerIds: ['non_existent_career_xyz'],
      };
      assert(
        !validateLearningResource(resourceWithInvalidCareer, sourcesById).valid,
        'Un recurso con careerId inexistente debe fallar la validación'
      );

      const resourceWithInvalidDimension: LearningResource = {
        ...baseResource,
        id: 'res_invalid_dimension',
        relatedDimensionIds: ['non_existent_dimension_xyz'],
      };
      assert(
        !validateLearningResource(resourceWithInvalidDimension, sourcesById).valid,
        'Un recurso con dimensionId inexistente debe fallar la validación'
      );

      const resourceVerifiedOnPartialSource: LearningResource = {
        ...baseResource,
        id: 'res_invalid_verified_inheritance',
        sourceId: 'source_mintic_convocatorias_partial',
        verificationStatus: 'verified',
      };
      assert(
        !validateLearningResource(resourceVerifiedOnPartialSource, sourcesById).valid,
        'Un recurso verified no puede colgar de una fuente partial_reference'
      );

      const resourceWithEmptyPrerequisites: LearningResource = {
        ...baseResource,
        id: 'res_invalid_prerequisites',
        prerequisitesNote: '',
      };
      assert(
        !validateLearningResource(resourceWithEmptyPrerequisites, sourcesById).valid,
        'Un recurso con prerequisitesNote vacío debe fallar la validación'
      );

      const resourceWithBadNormalizedTitle: LearningResource = {
        ...baseResource,
        id: 'res_invalid_normalized_title',
        normalizedTitle: 'titulo_incorrecto_malo',
      };
      assert(
        !validateLearningResource(resourceWithBadNormalizedTitle, sourcesById).valid,
        'Un recurso con normalizedTitle discrepante del título debe fallar la validación'
      );

      const basePath = CAREER_LEARNING_PATHS[0];

      const pathWithTooFewSteps: CareerLearningPath = {
        ...basePath,
        id: 'path_invalid_few_steps',
        steps: basePath.steps.slice(0, 2),
      };
      assert(
        !validateCareerLearningPath(pathWithTooFewSteps, resourcesById).valid,
        'Una ruta con menos de 3 pasos debe fallar la validación'
      );

      const pathWithDisorderedSteps: CareerLearningPath = {
        ...basePath,
        id: 'path_invalid_order',
        steps: [
          { ...basePath.steps[0], order: 1 },
          { ...basePath.steps[1], order: 3 },
          { ...basePath.steps[2], order: 2 },
        ],
      };
      assert(
        !validateCareerLearningPath(pathWithDisorderedSteps, resourcesById).valid,
        'Una ruta con pasos desordenados (1, 3, 2) debe fallar la validación'
      );

      const pathWithUnknownResource: CareerLearningPath = {
        ...basePath,
        id: 'path_invalid_resource_ref',
        steps: [
          {
            ...basePath.steps[0],
            linkedResourceIds: ['res_ghost_non_existent'],
          },
          basePath.steps[1],
          basePath.steps[2],
        ],
      };
      assert(
        !validateCareerLearningPath(pathWithUnknownResource, resourcesById).valid,
        'Una ruta con linkedResourceId inexistente debe fallar la validación'
      );

      const invalidSource: LearningSourceReference = {
        ...VERIFIED_LEARNING_SOURCES[0],
        id: 'source_invalid_date',
        verifiedAt: 'fecha-no-iso',
      };
      assert(
        !validateLearningSourceReference(invalidSource).valid,
        'Una fuente con fecha no ISO debe fallar la validación'
      );
    }
  );

  // =========================================================================
  // 5. COBERTURA DE LAS 47 CARRERAS
  // =========================================================================
  await runTest(
    '5. Cobertura de las 47 carreras: todas tienen hasLearningPath === true y se clasifican en direct_and_path, related_and_path y path_only',
    () => {
      const coverageList = defaultLearningRepository.getAllCareerLearningCoverage();
      assert(
        coverageList.length === 47,
        `Se esperaban 47 resúmenes de cobertura, se obtuvieron ${coverageList.length}`
      );

      for (const item of coverageList) {
        assert(
          item.hasLearningPath === true,
          `La carrera ${item.careerId} debe tener hasLearningPath === true`
        );
        const path = defaultLearningRepository.getLearningPathByCareerId(item.careerId);
        assert(
          Boolean(path && path.careerId === item.careerId),
          `No se encontró ruta para ${item.careerId}`
        );

        if (item.directResourceCount > 0) {
          assert(
            item.coverageStatus === 'direct_and_path',
            `Carrera ${item.careerId} con directResourceCount=${item.directResourceCount} debe ser direct_and_path`
          );
        } else if (item.relatedResourceCount > 0) {
          assert(
            item.coverageStatus === 'related_and_path',
            `Carrera ${item.careerId} sin directos y con relatedResourceCount=${item.relatedResourceCount} debe ser related_and_path`
          );
        } else {
          assert(
            item.coverageStatus === 'path_only',
            `Carrera ${item.careerId} con 0 recursos externos debe ser path_only`
          );
        }
      }

      const directAndPathCount = coverageList.filter(
        (c) => c.coverageStatus === 'direct_and_path'
      ).length;
      const relatedAndPathCount = coverageList.filter(
        (c) => c.coverageStatus === 'related_and_path'
      ).length;
      const pathOnlyCount = coverageList.filter(
        (c) => c.coverageStatus === 'path_only'
      ).length;

      assert(
        directAndPathCount === 37,
        `Se esperaban 37 carreras con direct_and_path, se obtuvieron ${directAndPathCount}`
      );
      assert(
        relatedAndPathCount === 8,
        `Se esperaban 8 carreras con related_and_path, se obtuvieron ${relatedAndPathCount}`
      );
      assert(
        pathOnlyCount === 2,
        `Se esperaban 2 carreras con path_only (fashion_design y dentistry), se obtuvieron ${pathOnlyCount}`
      );
      assert(
        directAndPathCount + relatedAndPathCount + pathOnlyCount === 47,
        'La suma de estados de cobertura debe ser exactamente 47'
      );
    }
  );

  // =========================================================================
  // 6. FILTRADO DETERMINISTA
  // =========================================================================
  await runTest(
    '6. Filtrado determinista: verifiedOnly, colombiaOnly, difficulty, accessType, language, resourceType y searchQuery',
    () => {
      const allMatches = defaultLearningRepository.queryResources({
        verifiedOnly: false,
      });
      const verifiedMatches = defaultLearningRepository.queryResources({
        verifiedOnly: true,
      });

      assert(
        allMatches.length === 22,
        `El catálogo completo debe devolver 22 recursos activos, devolvió ${allMatches.length}`
      );
      assert(
        verifiedMatches.length === 20,
        `Con verifiedOnly: true deben devolverse 20 recursos estrictamente verificados, devolvió ${verifiedMatches.length}`
      );
      assert(
        verifiedMatches.every(
          (m) =>
            m.resource.verificationStatus === 'verified' &&
            m.source.verificationStatus === 'verified'
        ),
        'verifiedOnly: true no puede incluir recursos ni fuentes partial_reference'
      );

      const colombiaMatches = defaultLearningRepository.queryResources({
        colombiaOnly: true,
      });
      assert(
        colombiaMatches.length > 0 &&
          colombiaMatches.every((m) => m.resource.isColombiaSpecific === true),
        'colombiaOnly: true debe devolver únicamente recursos con isColombiaSpecific === true'
      );

      const foundationalMatches = defaultLearningRepository.queryResources({
        difficulty: 'foundational',
      });
      assert(
        foundationalMatches.length > 0 &&
          foundationalMatches.every((m) => m.resource.difficulty === 'foundational'),
        'Filtro por difficulty="foundational" falló'
      );

      const freeMatches = defaultLearningRepository.queryResources({
        accessType: 'free',
      });
      assert(
        freeMatches.length > 0 &&
          freeMatches.every((m) => m.resource.accessType === 'free'),
        'Filtro por accessType="free" falló'
      );

      const englishMatches = defaultLearningRepository.queryResources({
        language: 'en',
      });
      assert(
        englishMatches.length === 1 &&
          englishMatches[0].resource.id === 'res_mit_ocw_ingenieria_arquitectura',
        'Filtro por language="en" debe devolver exclusivamente el recurso de MIT OpenCourseWare'
      );

      const interactiveMatches = defaultLearningRepository.queryResources({
        resourceType: 'interactive_tutorial',
      });
      assert(
        interactiveMatches.length === 2 &&
          interactiveMatches.every(
            (m) => m.resource.resourceType === 'interactive_tutorial'
          ),
        'Filtro por resourceType="interactive_tutorial" debe devolver PhET y freeCodeCamp'
      );

      const searchPython = defaultLearningRepository.queryResources({
        searchQuery: 'PyThOn',
      });
      assert(
        searchPython.some((m) => m.resource.id === 'res_python_official_tutorial_es'),
        'searchQuery="PyThOn" debe encontrar el tutorial oficial de Python'
      );

      const searchEpidemiologia = defaultLearningRepository.queryResources({
        searchQuery: 'epidemiologia',
      });
      assert(
        searchEpidemiologia.some(
          (m) => m.resource.id === 'res_ins_vigilancia_epidemiologia_colombia'
        ),
        'searchQuery sin tildes ("epidemiologia") debe encontrar el recurso del INS'
      );
    }
  );

  // =========================================================================
  // 7. ORDENAMIENTO DETERMINISTA
  // =========================================================================
  await runTest(
    '7. Ordenamiento determinista: direct aparece antes que related y múltiples ejecuciones producen idéntico orden',
    () => {
      // software_development_tech tiene recursos direct y también recursos related de la familia technology
      const matchesRun1 = defaultLearningRepository.getResourcesForCareer(
        'software_development_tech',
        { includeRelated: true, verifiedOnly: false }
      );
      const matchesRun2 = defaultLearningRepository.getResourcesForCareer(
        'software_development_tech',
        { includeRelated: true, verifiedOnly: false }
      );

      assert(matchesRun1.length > 0, 'software_development_tech debe tener recursos');
      assert(
        JSON.stringify(matchesRun1.map((m) => m.resource.id)) ===
          JSON.stringify(matchesRun2.map((m) => m.resource.id)),
        'Dos ejecuciones con los mismos parámetros deben producir exactamente el mismo orden'
      );

      let seenRelated = false;
      for (const match of matchesRun1) {
        if (match.matchTier === 'related') {
          seenRelated = true;
        } else if (match.matchTier === 'direct' && seenRelated) {
          throw new Error(
            'Violación de ordenamiento: un recurso direct apareció después de un recurso related'
          );
        }
      }

      const directOnly = defaultLearningRepository.getResourcesForCareer(
        'software_development_tech',
        { includeRelated: false }
      );
      assert(
        directOnly.every((m) => m.matchTier === 'direct'),
        'Con includeRelated: false solo deben devolverse recursos direct'
      );
    }
  );

  // =========================================================================
  // 8. INDEPENDENCIA DE PREFERENCIAS DEL ONBOARDING
  // =========================================================================
  await runTest(
    '8. Independencia de preferencias del onboarding: el proveedor y repositorio no dependen de ciudad, modalidad ni institución',
    () => {
      const provider = getLearningExplorerProvider();
      assert(provider.isReady(), 'LocalLearningProvider debe estar listo (isReady === true)');
      assert(
        provider instanceof LocalLearningProvider,
        'getLearningExplorerProvider debe devolver una instancia de LocalLearningProvider'
      );

      const customRepo = new LearningRepository();
      const customProvider = new LocalLearningProvider({ repository: customRepo });

      for (const career of CAREERS) {
        const repoPath = defaultLearningRepository.getLearningPathByCareerId(career.id);
        const provPath = customProvider.getLearningPathByCareerId(career.id);
        assert(
          Boolean(repoPath && provPath && repoPath.id === provPath.id),
          `La ruta de aprendizaje de ${career.id} debe estar siempre disponible sin importar el contexto geográfico`
        );

        const repoResources = defaultLearningRepository.getResourcesForCareer(career.id);
        const provResources = customProvider.getResourcesForCareer(career.id);
        assert(
          repoResources.length === provResources.length,
          `Los recursos para ${career.id} deben ser deterministas e independientes de onboarding`
        );
      }

      // Verificación de getStepResources y getPathResources
      const fashionResources = provider.getPathResources('fashion_design');
      assert(
        fashionResources.length === 0,
        'fashion_design no debe tener recursos vinculados en su ruta (path_only)'
      );
      const dentistryResources = provider.getPathResources('dentistry');
      assert(
        dentistryResources.length === 0,
        'dentistry no debe tener recursos vinculados en su ruta (path_only)'
      );

      const allPaths = provider.getAllLearningPaths();
      for (const path of allPaths) {
        const pathRes = provider.getPathResources(path.careerId);
        assert(Array.isArray(pathRes), `getPathResources(${path.careerId}) debe ser un arreglo`);
        for (const step of path.steps) {
          const stepRes = provider.getStepResources(step);
          assert(
            stepRes.length === step.linkedResourceIds.length,
            `getStepResources en ${path.careerId} paso ${step.order} debe resolver exactamente ${step.linkedResourceIds.length} recursos`
          );
        }
      }
    }
  );

  // =========================================================================
  // 9. NO REGRESIÓN DEL MOTOR VOCACIONAL
  // =========================================================================
  await runTest(
    '9. No regresión del motor vocacional: los 47 resultados y el Top 5 vocacional permanecen idénticos antes y después de consultar el repositorio de aprendizaje',
    () => {
      const sampleAnswers: AssessmentAnswer[] = ASSESSMENT_QUESTIONS.map((q, idx) => ({
        questionId: q.id,
        value: (((idx % 5) + 1) as LikertValue),
        answeredAt: '2026-10-09T00:00:00.000Z',
      }));

      const beforeResult = buildAssessmentResult(sampleAnswers);

      // Ejecutar consultas intensivas sobre el repositorio y proveedor de aprendizaje
      const allPaths = defaultLocalLearningProvider.getAllLearningPaths();
      const allCoverage = defaultLocalLearningProvider.getAllCareerLearningCoverage();
      for (const topCareerId of beforeResult.topCareers) {
        defaultLocalLearningProvider.getLearningPathByCareerId(topCareerId);
        defaultLocalLearningProvider.getResourcesForCareer(topCareerId, {
          includeRelated: true,
          verifiedOnly: true,
        });
      }

      const afterResult = buildAssessmentResult(sampleAnswers);

      assert(allPaths.length === 47, 'Se esperaban 47 rutas');
      assert(allCoverage.length === 47, 'Se esperaban 47 resúmenes de cobertura');
      assert(
        beforeResult.careerScores.length === 47 &&
          afterResult.careerScores.length === 47,
        'El motor vocacional debe seguir evaluando exactamente las 47 carreras'
      );
      assert(
        JSON.stringify(beforeResult.dimensionScores) ===
          JSON.stringify(afterResult.dimensionScores),
        'Los puntajes por dimensión vocacional no pueden verse alterados por la capa de aprendizaje'
      );
      assert(
        JSON.stringify(beforeResult.careerScores) ===
          JSON.stringify(afterResult.careerScores),
        'El ranking completo de las 47 carreras debe ser idéntico antes y después'
      );
      assert(
        JSON.stringify(beforeResult.topCareers) ===
          JSON.stringify(afterResult.topCareers),
        'El Top 5 vocacional debe ser idéntico antes y después'
      );
    }
  );

  return {
    passed: results.length,
    results,
  };
}

const isDirectExecution =
  typeof process !== 'undefined' &&
  Array.isArray(process.argv) &&
  process.argv[1]?.includes('validatePhase6B1LearningDomain.test');

if (isDirectExecution) {
  runPhase6B1LearningDomainTests()
    .then(({ passed, results }) => {
      console.log('\n========================================');
      console.log('YORVOCA F6B.1 LEARNING DOMAIN TEST SUITE');
      console.log('========================================');
      for (const line of results) {
        console.log(`  ✓ ${line}`);
      }
      console.log(`\nTotal passed: ${passed}/${results.length}\n`);
    })
    .catch((err) => {
      console.error('\n❌ F6B.1 Learning Domain Tests Failed:');
      console.error(err);
      process.exit(1);
    });
}
