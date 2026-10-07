import { ASSESSMENT_QUESTIONS, DEFAULT_LIKERT_OPTIONS } from '../../data/questions';
import {
  buildAssessmentResult,
  normalizeLikertAnswer,
  rankCareers,
  reverseLikertScore,
  scoreCareers,
  scoreDimensions,
  scoreFamilies,
} from '../assessment';
import { AssessmentAnswer, LikertValue, Question } from '../../types/assessment';
import { Career, CareerDimensionWeight, CareerFamily } from '../../types/career';
import { validateAssessmentQuestions } from './validateAssessmentQuestions';
import { runCatalogTests } from './validateCareerCatalog.test';
import { runResultsAndAITests } from './validateResultsAndAI.test';
import { runAcademicExplorerTests } from './validateAcademicExplorer.test';
import { runPhase6AAcademicIntegrationTests } from './validatePhase6AAcademicIntegration.test';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function assertClose(actual: number, expected: number, message: string, epsilon = 1e-6): void {
  if (Math.abs(actual - expected) > epsilon) {
    throw new Error(`${message} (expected ${expected}, got ${actual})`);
  }
}

export function runAssessmentEngineTests(): { passed: number; results: string[] } {
  const results: string[] = [];
  let passed = 0;

  // Test 1: Una respuesta de 1 produce 0
  {
    const norm = normalizeLikertAnswer(1, false);
    assertClose(norm, 0, 'Test 1 failed: answer 1 should normalize to 0');
    passed++;
    results.push('PASS [Test 01]: Una respuesta de 1 produce 0.');
  }

  // Test 2: Una respuesta de 5 produce 1
  {
    const norm = normalizeLikertAnswer(5, false);
    assertClose(norm, 1, 'Test 2 failed: answer 5 should normalize to 1');
    passed++;
    results.push('PASS [Test 02]: Una respuesta de 5 produce 1.');
  }

  // Test 3: Una respuesta de 3 produce 0.5
  {
    const norm = normalizeLikertAnswer(3, false);
    assertClose(norm, 0.5, 'Test 3 failed: answer 3 should normalize to 0.5');
    passed++;
    results.push('PASS [Test 03]: Una respuesta de 3 produce 0.5.');
  }

  // Test 4: Reverse scoring funciona correctamente
  {
    assert(reverseLikertScore(1) === 5, '1 should reverse to 5');
    assert(reverseLikertScore(2) === 4, '2 should reverse to 4');
    assert(reverseLikertScore(3) === 3, '3 should reverse to 3');
    assert(reverseLikertScore(4) === 2, '4 should reverse to 2');
    assert(reverseLikertScore(5) === 1, '5 should reverse to 1');

    assertClose(normalizeLikertAnswer(1, true), 1.0, 'Reverse 1 -> 1.0');
    assertClose(normalizeLikertAnswer(2, true), 0.75, 'Reverse 2 -> 0.75');
    assertClose(normalizeLikertAnswer(3, true), 0.5, 'Reverse 3 -> 0.5');
    assertClose(normalizeLikertAnswer(4, true), 0.25, 'Reverse 4 -> 0.25');
    assertClose(normalizeLikertAnswer(5, true), 0.0, 'Reverse 5 -> 0.0');
    passed++;
    results.push('PASS [Test 04]: Reverse scoring funciona correctamente (1↔5, 2↔4, 3↔3).');
  }

  // Test 5: El promedio de varias preguntas produce el score esperado (0.75 y 1.00 -> 0.875)
  {
    const mockQuestions: Question[] = [
      {
        id: 'q1',
        text: 'Pregunta directa',
        dimensionId: 'logical_thinking',
        category: 'aptitude',
        responseType: 'likert',
        options: DEFAULT_LIKERT_OPTIONS,
        required: true,
      },
      {
        id: 'q2',
        text: 'Segunda pregunta directa',
        dimensionId: 'logical_thinking',
        category: 'aptitude',
        responseType: 'likert',
        options: DEFAULT_LIKERT_OPTIONS,
        required: true,
      },
    ];
    const mockAnswers: AssessmentAnswer[] = [
      { questionId: 'q1', value: 4, answeredAt: '2026-10-06T00:00:00Z' }, // 0.75
      { questionId: 'q2', value: 5, answeredAt: '2026-10-06T00:00:00Z' }, // 1.00
    ];
    const dimScores = scoreDimensions(mockAnswers, mockQuestions);
    const logical = dimScores.find((d) => d.dimensionId === 'logical_thinking');
    assert(Boolean(logical && logical.assessed), 'logical_thinking should be assessed');
    assertClose(logical!.score!, 0.875, 'Average of 0.75 and 1.00 should be 0.875');
    passed++;
    results.push('PASS [Test 05]: El promedio de varias preguntas produce el score esperado (0.875).');
  }

  // Test 6: Las dimensiones no evaluadas no se consideran como cero
  {
    const mockQuestions: Question[] = [
      {
        id: 'q_tech',
        text: 'Pregunta tecnología',
        dimensionId: 'technology',
        category: 'interest',
        responseType: 'likert',
        options: DEFAULT_LIKERT_OPTIONS,
        required: true,
      },
    ];
    const mockAnswers: AssessmentAnswer[] = [
      { questionId: 'q_tech', value: 5, answeredAt: '2026-10-06T00:00:00Z' }, // 1.0
    ];
    const dimScores = scoreDimensions(mockAnswers, mockQuestions);
    const unassessedResearch = dimScores.find((d) => d.dimensionId === 'research');
    assert(
      unassessedResearch !== undefined &&
        unassessedResearch.assessed === false &&
        unassessedResearch.score === undefined,
      'Unassessed dimension must have assessed=false and score=undefined, never 0'
    );

    // Verificar que en el cálculo de carrera 'research' queda fuera del denominador
    const testCareer: Career = {
      id: 'test_career',
      name: 'Carrera de Prueba',
      normalizedName: 'carrera de prueba',
      familyId: 'technology',
      shortDescription: 'Descripción',
      whatYouDo: ['Hacer X'],
      typicalAreas: ['Área Y'],
      relatedDimensions: ['technology', 'research'],
    };
    const testWeights: CareerDimensionWeight[] = [
      { careerId: 'test_career', dimensionId: 'technology', weight: 1.0 },
      { careerId: 'test_career', dimensionId: 'research', weight: 1.0 }, // No evaluada
    ];
    const careerScores = scoreCareers(dimScores, [testCareer], testWeights);
    // Si research se tomara como 0, el score sería (1*1 + 0*1)/2 = 0.5.
    // Como se ignora por no estar evaluada, el score debe ser (1*1)/1 = 1.0.
    assertClose(
      careerScores[0].rawScore,
      1.0,
      'Unassessed dimension must be excluded from denominator, yielding 1.0 instead of 0.5'
    );
    passed++;
    results.push(
      'PASS [Test 06]: Las dimensiones no evaluadas tienen score=undefined y se excluyen del denominador de carrera.'
    );
  }

  // Test 7: El cálculo de carrera utiliza correctamente sus pesos
  {
    const customDimScores = [
      {
        dimensionId: 'technology',
        category: 'interest' as const,
        assessed: true,
        score: 1.0,
        questionCount: 1,
        answeredCount: 1,
      },
      {
        dimensionId: 'logical_thinking',
        category: 'aptitude' as const,
        assessed: true,
        score: 0.5,
        questionCount: 1,
        answeredCount: 1,
      },
      {
        dimensionId: 'creativity',
        category: 'aptitude' as const,
        assessed: true,
        score: 0.0,
        questionCount: 1,
        answeredCount: 1,
      },
    ];
    const customCareer: Career = {
      id: 'weighted_career',
      name: 'Carrera Ponderada',
      normalizedName: 'carrera ponderada',
      familyId: 'technology',
      shortDescription: 'Desc',
      whatYouDo: ['A'],
      typicalAreas: ['B'],
      relatedDimensions: ['technology', 'logical_thinking', 'creativity'],
    };
    const customWeights: CareerDimensionWeight[] = [
      { careerId: 'weighted_career', dimensionId: 'technology', weight: 1.0 },
      { careerId: 'weighted_career', dimensionId: 'logical_thinking', weight: 0.5 },
      { careerId: 'weighted_career', dimensionId: 'creativity', weight: 0.5 },
    ];
    // Numerador = (1.0 * 1.0) + (0.5 * 0.5) + (0.0 * 0.5) = 1.25
    // Denominador = 1.0 + 0.5 + 0.5 = 2.0
    // Expected = 1.25 / 2.0 = 0.625
    const scored = scoreCareers(customDimScores, [customCareer], customWeights);
    assertClose(scored[0].rawScore, 0.625, 'Weighted career score should be 0.625');
    passed++;
    results.push(
      'PASS [Test 07]: El cálculo de carrera aplica exactamente Σ(score × weight) / Σ(weight).'
    );
  }

  // Test 8: Dos ejecuciones con las mismas respuestas producen el mismo resultado
  {
    const sampleAnswers: AssessmentAnswer[] = ASSESSMENT_QUESTIONS.map((q, idx) => ({
      questionId: q.id,
      value: (((idx % 5) + 1) as LikertValue),
      answeredAt: '2026-10-06T12:00:00.000Z',
    }));
    const resA = buildAssessmentResult(sampleAnswers, {
      completedAt: '2026-10-06T12:00:00.000Z',
    });
    const resB = buildAssessmentResult(sampleAnswers, {
      completedAt: '2026-10-06T12:00:00.000Z',
    });
    assert(
      JSON.stringify(resA) === JSON.stringify(resB),
      'Two executions with identical answers must produce identical results'
    );
    passed++;
    results.push(
      'PASS [Test 08]: Determinismo verificado (dos ejecuciones con las mismas respuestas producen resultado idéntico).'
    );
  }

  // Test 9: El Top 5 siempre contiene como máximo 5 carreras
  {
    const allFives: AssessmentAnswer[] = ASSESSMENT_QUESTIONS.map((q) => ({
      questionId: q.id,
      value: 5,
      answeredAt: '2026-10-06T12:00:00.000Z',
    }));
    const res = buildAssessmentResult(allFives);
    assert(
      res.topCareers.length === 5 && res.topCareers.length <= 5,
      `Expected Top 5 to have at most 5 careers, got ${res.topCareers.length}`
    );
    passed++;
    results.push('PASS [Test 09]: El Top 5 contiene exactamente 5 carreras (máximo 5).');
  }

  // Test 10: No existen carreras duplicadas en el ranking
  {
    const sampleAnswers: AssessmentAnswer[] = ASSESSMENT_QUESTIONS.map((q, i) => ({
      questionId: q.id,
      value: (((i * 3) % 5) + 1) as LikertValue,
      answeredAt: '2026-10-06T12:00:00.000Z',
    }));
    const res = buildAssessmentResult(sampleAnswers);
    const rankedIds = res.careerScores.map((c) => c.careerId);
    const uniqueRankedIds = new Set(rankedIds);
    assert(
      rankedIds.length === uniqueRankedIds.size,
      'Duplicate career IDs found in careerScores ranking'
    );
    const uniqueTopIds = new Set(res.topCareers);
    assert(
      res.topCareers.length === uniqueTopIds.size,
      'Duplicate career IDs found in topCareers'
    );
    passed++;
    results.push('PASS [Test 10]: No existen carreras duplicadas en el ranking ni en el Top 5.');
  }

  // Test 11: Los empates son deterministas (1º coincidencias fuertes, 2º careerId alfabético)
  {
    const baseCareerScore = {
      familyId: 'technology',
      rawScore: 0.75,
      normalizedScore: 0.75,
      rank: 0,
      evaluatedDimensionsCount: 3,
      matchedDimensions: [],
      explanation: {
        strongMatches: [],
        moderateMatches: [],
        lowMatches: [],
        summaryText: '',
      },
    };

    const tiedInput = [
      { ...baseCareerScore, careerId: 'z_career', strongMatchesCount: 2 },
      { ...baseCareerScore, careerId: 'a_career', strongMatchesCount: 2 },
      { ...baseCareerScore, careerId: 'm_career', strongMatchesCount: 4 },
    ];

    const { rankedCareers } = rankCareers(tiedInput, 5);
    assert(
      rankedCareers[0].careerId === 'm_career',
      'Higher strongMatchesCount should win first tie-breaker'
    );
    assert(
      rankedCareers[1].careerId === 'a_career' && rankedCareers[2].careerId === 'z_career',
      'Alphabetical careerId should win when score and strongMatchesCount are tied'
    );
    passed++;
    results.push(
      'PASS [Test 11]: Los empates se resuelven de forma determinista (strongMatchesCount y luego careerId alfabético).'
    );
  }

  // Test 12: Una familia no obtiene ventaja simplemente por tener más carreras
  {
    const families: CareerFamily[] = [
      { id: 'small_family', name: 'Familia Pequeña (2 carreras)', description: 'Desc' },
      { id: 'large_family', name: 'Familia Grande (6 carreras)', description: 'Desc' },
    ];

    const makeMockCareerScore = (careerId: string, familyId: string, score: number) => ({
      careerId,
      familyId,
      rawScore: score,
      normalizedScore: score,
      rank: 1,
      evaluatedDimensionsCount: 5,
      strongMatchesCount: 3,
      matchedDimensions: [],
      explanation: {
        strongMatches: [],
        moderateMatches: [],
        lowMatches: [],
        summaryText: '',
      },
    });

    const mockCareerScores = [
      // Familia pequeña: 2 carreras con afinidad 0.85
      makeMockCareerScore('s1', 'small_family', 0.85),
      makeMockCareerScore('s2', 'small_family', 0.85),
      // Familia grande: 6 carreras con afinidad 0.80
      makeMockCareerScore('l1', 'large_family', 0.8),
      makeMockCareerScore('l2', 'large_family', 0.8),
      makeMockCareerScore('l3', 'large_family', 0.8),
      makeMockCareerScore('l4', 'large_family', 0.8),
      makeMockCareerScore('l5', 'large_family', 0.8),
      makeMockCareerScore('l6', 'large_family', 0.8),
    ];

    const familyResults = scoreFamilies(mockCareerScores, families);
    assert(
      familyResults[0].familyId === 'small_family',
      'Small family with higher average career affinity (0.85) must rank above larger family (0.80)'
    );
    assertClose(familyResults[0].rawScore, 0.85, 'Small family score should be 0.85');
    assertClose(familyResults[1].rawScore, 0.8, 'Large family score should be 0.80');
    passed++;
    results.push(
      'PASS [Test 12]: Una familia con más carreras no obtiene ventaja artificial sobre una familia con menos carreras.'
    );
  }

  // Test 13: Validación del banco de preguntas (48 preguntas, 12 por categoría)
  {
    const validation = validateAssessmentQuestions();
    assert(
      validation.isValid && validation.issues.length === 0,
      `Question bank validation failed: ${JSON.stringify(validation.issues)}`
    );
    assert(
      validation.stats.totalQuestions === 48,
      `Expected 48 questions, got ${validation.stats.totalQuestions}`
    );
    assert(
      validation.stats.byCategory.interest === 12 &&
        validation.stats.byCategory.aptitude === 12 &&
        validation.stats.byCategory.work_preference === 12 &&
        validation.stats.byCategory.motivator === 12,
      'Expected 12 questions in each of the 4 categories'
    );
    passed++;
    results.push(
      `PASS [Test 13]: Banco de 48 preguntas validado (12 por categoría, ${validation.stats.uniqueDimensionsCovered} dimensiones cubiertas, ${validation.stats.reverseScoredCount} inversas).`
    );
  }

  // Test 14: Casos extremos (todas = 1, todas = 3, todas = 5, e incompletas)
  {
    for (const val of [1, 3, 5] as LikertValue[]) {
      const answers: AssessmentAnswer[] = ASSESSMENT_QUESTIONS.map((q) => ({
        questionId: q.id,
        value: val,
        answeredAt: '2026-10-06T12:00:00.000Z',
      }));
      const res = buildAssessmentResult(answers);
      assert(res.topCareers.length === 5, `Top 5 must exist when all answers = ${val}`);
      assert(
        res.careerScores.every((c) => c.rawScore >= 0 && c.rawScore <= 1),
        `All career scores must be in [0, 1] when all answers = ${val}`
      );
    }

    // Respuestas incompletas / parciales (solo 5 preguntas respondidas)
    const partialAnswers: AssessmentAnswer[] = ASSESSMENT_QUESTIONS.slice(0, 5).map((q) => ({
      questionId: q.id,
      value: 4,
      answeredAt: '2026-10-06T12:00:00.000Z',
    }));
    const partialRes = buildAssessmentResult(partialAnswers);
    assert(
      partialRes.topCareers.length === 5 &&
        partialRes.dimensionScores.filter((d) => d.assessed).length === 5,
      'Partial answers should safely score only the 5 evaluated dimensions without crashing'
    );
    passed++;
    results.push(
      'PASS [Test 14]: Casos extremos verificados (todas=1, todas=3, todas=5 y respuestas parciales/incompletas).'
    );
  }

  return { passed, results };
}

const isDirectRun =
  typeof process !== 'undefined' &&
  Array.isArray(process.argv) &&
  process.argv[1]?.includes('validateAssessmentQuestions.test');

if (isDirectRun) {
  (async () => {
    console.log('=== EJECUTANDO TESTS FASE 3A (CATÁLOGO VOCACIONAL) ===');
    const catalogRes = runCatalogTests();
    for (const line of catalogRes.results) {
      console.log(line);
    }

    console.log('\n=== EJECUTANDO TESTS FASE 3B (MOTOR DE ASSESSMENT Y SCORING) ===');
    const assessmentRes = runAssessmentEngineTests();
    for (const line of assessmentRes.results) {
      console.log(line);
    }

    console.log('\n=== EJECUTANDO TESTS FASE 4 (RESULTADOS, EXPLICACIÓN E IA SEGURA) ===');
    const resultsAIRes = await runResultsAndAITests();
    for (const line of resultsAIRes.results) {
      console.log(line);
    }

    console.log('\n=== EJECUTANDO TESTS FASE 5 (ACADEMIC EXPLORER E INTEGRIDAD SNIES/MOCK) ===');
    const academicRes = await runAcademicExplorerTests();
    for (const line of academicRes.results) {
      console.log(line);
    }

    console.log('\n=== EJECUTANDO TESTS FASE 6A (INTEGRACIÓN ACADÉMICA REAL: SNIES + SITIOS OFICIALES) ===');
    const phase6ARes = await runPhase6AAcademicIntegrationTests();
    for (const line of phase6ARes.results) {
      console.log(line);
    }

    const totalPassed =
      catalogRes.passed +
      assessmentRes.passed +
      resultsAIRes.passed +
      academicRes.passed +
      phase6ARes.passed;
    console.log(`\nTotal global: ${totalPassed}/${totalPassed} tests ejecutados con éxito.`);
  })();
}
