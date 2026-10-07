import { ASSESSMENT_QUESTIONS } from '../../data/questions';
import {
  buildAssessmentResult,
  buildCareerExplanation,
  buildDeterministicAIInterpretation,
  getTopEvaluatedDimensions,
  scoreDimensions,
  validateStoredAssessmentResult,
} from '../assessment';
import { ASSESSMENT_STORAGE_KEY } from '../../features/assessment/hooks/useAssessment';
import { loadAndValidateResultsFromStorage } from '../../features/results/hooks/useResults';
import { requestVocationalInterpretation } from '../../services/ai/gemini';
import { buildAIInterpretationPayload } from '../../services/ai/prompts';
import { validateAIInterpretation } from '../../services/ai/schemas';
import { AssessmentAnswer, LikertValue } from '../../types/assessment';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export async function runResultsAndAITests(): Promise<{ passed: number; results: string[] }> {
  const results: string[] = [];
  let passed = 0;

  const sampleAnswers: AssessmentAnswer[] = ASSESSMENT_QUESTIONS.map((q, idx) => ({
    questionId: q.id,
    value: (((idx % 5) + 1) as LikertValue),
    answeredAt: '2026-10-06T15:00:00.000Z',
  }));
  const sampleResult = buildAssessmentResult(sampleAnswers, {
    assessmentId: 'assessment_test_f4',
    completedAt: '2026-10-06T15:05:00.000Z',
  });

  // Test 1: getTopEvaluatedDimensions excluye estrictamente dimensiones con assessed === false
  {
    const partialAnswers = sampleAnswers.slice(0, 4);
    const dimScores = scoreDimensions(partialAnswers, ASSESSMENT_QUESTIONS);
    const topDims = getTopEvaluatedDimensions(dimScores, 10);

    assert(
      topDims.length === 4,
      `Expected only 4 evaluated dimensions, got ${topDims.length}`
    );
    assert(
      topDims.every((d) => d.assessed === true && typeof d.score === 'number'),
      'getTopEvaluatedDimensions must never include unassessed dimensions'
    );
    passed++;
    results.push(
      'PASS [F4 Test 01]: getTopEvaluatedDimensions excluye dimensiones con assessed === false.'
    );
  }

  // Test 2: buildCareerExplanation genera explicación determinista completa para el Top 5
  {
    for (const careerId of sampleResult.topCareers) {
      const cs = sampleResult.careerScores.find((c) => c.careerId === careerId)!;
      const explanation = buildCareerExplanation(cs);
      assert(explanation.careerId === careerId, 'Career ID must match');
      assert(explanation.careerName.length > 0, 'Career name must not be empty');
      assert(explanation.familyName.length > 0, 'Family name must not be empty');
      assert(
        explanation.affinityPercent >= 0 && explanation.affinityPercent <= 100,
        'Affinity percent must be in [0, 100]'
      );
      assert(explanation.whyItAppeared.length > 20, 'whyItAppeared must be descriptive');
      assert(explanation.whatYouDo.length > 0, 'whatYouDo must contain activities');
      assert(explanation.typicalAreas.length > 0, 'typicalAreas must contain areas');
      assert(explanation.aspectsToExplore.length >= 2, 'aspectsToExplore must have items');
    }
    passed++;
    results.push(
      'PASS [F4 Test 02]: buildCareerExplanation genera explicación determinista completa para cada carrera del Top 5.'
    );
  }

  // Test 3: buildDeterministicAIInterpretation cumple el esquema AIInterpretation
  {
    const detInterp = buildDeterministicAIInterpretation(sampleResult);
    const validation = validateAIInterpretation(detInterp);
    assert(
      validation.isValid && validation.data !== null,
      `Deterministic interpretation must satisfy AIInterpretation schema: ${validation.error}`
    );
    passed++;
    results.push(
      'PASS [F4 Test 03]: buildDeterministicAIInterpretation produce una síntesis válida bajo el esquema AIInterpretation.'
    );
  }

  // Test 4: buildAIInterpretationPayload envía solo datos estructurados anonimizados (sin ubicación ni respuestas crudas)
  {
    const payload = buildAIInterpretationPayload(sampleResult);
    const serialized = JSON.stringify(payload);
    assert(payload.topDimensions.length <= 6, 'topDimensions max 6');
    assert(payload.topFamilies.length <= 4, 'topFamilies max 4');
    assert(payload.topCareers.length === 5, 'topCareers must be 5');
    assert(payload.careerMatches.length === 5, 'careerMatches must be 5');
    assert(
      !serialized.includes('answeredAt') &&
        !serialized.includes('currentLocation') &&
        !serialized.includes('targetLocation'),
      'AI payload must not leak raw answers or student location'
    );
    passed++;
    results.push(
      'PASS [F4 Test 04]: buildAIInterpretationPayload construye payload mínimo sin datos sensibles ni respuestas crudas.'
    );
  }

  // Test 5: validateAIInterpretation rechaza JSON inválido o campos prohibidos (como topCareers o careerScores)
  {
    const malformed = validateAIInterpretation('{ invalid json ');
    assert(!malformed.isValid, 'Malformed JSON must be rejected');

    const withForbiddenField = validateAIInterpretation({
      summary: 'Este es un resumen suficientemente largo para pasar la longitud.',
      strengths: ['Fortaleza número uno válida', 'Fortaleza número dos válida'],
      explorationAdvice: ['Consejo de exploración uno', 'Consejo de exploración dos'],
      reflectionQuestions: ['¿Pregunta de reflexión uno?', '¿Pregunta de reflexión dos?'],
      topCareers: ['hacked_career_1'],
    });
    assert(
      !withForbiddenField.isValid &&
        Boolean(withForbiddenField.error?.includes('topCareers')),
      'Payload attempting to inject topCareers must be rejected'
    );
    passed++;
    results.push(
      'PASS [F4 Test 05]: validateAIInterpretation bloquea JSON inválido e intentos de alterar topCareers o careerScores.'
    );
  }

  // Test 6: requestVocationalInterpretation mantiene inmutables topCareers y careerScores con respuesta válida de Gemini
  {
    const beforeTopCareers = [...sampleResult.topCareers];
    const beforeScores = sampleResult.careerScores.map((c) => ({
      id: c.careerId,
      score: c.rawScore,
      rank: c.rank,
    }));

    const mockValidGeminiOutput = {
      summary:
        'Tu perfil muestra afinidad consistente con áreas analíticas y tecnológicas que vale la pena explorar paso a paso.',
      strengths: [
        'Afinidad destacada con el pensamiento lógico y la resolución de problemas.',
        'Interés por comprender sistemas complejos y herramientas digitales.',
        'Motivación por el aprendizaje continuo en entornos dinámicos.',
      ],
      explorationAdvice: [
        'Revisa proyectos introductorios de las carreras en tu Top 5 para comparar sus actividades diarias.',
        'Contrasta el enfoque de cada familia profesional antes de elegir una ruta académica.',
      ],
      reflectionQuestions: [
        '¿Qué tipo de problemas cotidianos disfrutas resolver con mayor naturalidad?',
        '¿En qué modalidad de trabajo sientes que aprendes mejor?',
      ],
    };

    const response = await requestVocationalInterpretation(sampleResult, {
      rawResponseOverride: mockValidGeminiOutput,
    });

    assert(response.source === 'gemini', 'Expected source to be gemini for valid response');
    assert(
      JSON.stringify(sampleResult.topCareers) === JSON.stringify(beforeTopCareers),
      'topCareers must remain 100% unchanged after Gemini interpretation'
    );
    assert(
      JSON.stringify(
        sampleResult.careerScores.map((c) => ({
          id: c.careerId,
          score: c.rawScore,
          rank: c.rank,
        }))
      ) === JSON.stringify(beforeScores),
      'careerScores must remain 100% unchanged after Gemini interpretation'
    );
    passed++;
    results.push(
      'PASS [F4 Test 06]: requestVocationalInterpretation procesa respuesta válida de Gemini sin alterar topCareers ni careerScores.'
    );
  }

  // Test 7: requestVocationalInterpretation hace fallback determinista limpio cuando Gemini falla o no está disponible
  {
    const failingFetcher = (async () => {
      throw new Error('Network offline');
    }) as unknown as typeof fetch;

    const fallbackRes = await requestVocationalInterpretation(sampleResult, {
      fetcher: failingFetcher,
    });

    assert(
      fallbackRes.source === 'deterministic_fallback',
      'Should use deterministic_fallback on network error'
    );
    assert(
      fallbackRes.notice === 'Esta función requiere conexión con la fuente correspondiente.',
      `Unexpected notice message: ${fallbackRes.notice}`
    );
    assert(
      validateAIInterpretation(fallbackRes.interpretation).isValid,
      'Fallback interpretation must always be valid'
    );
    passed++;
    results.push(
      'PASS [F4 Test 07]: requestVocationalInterpretation activa el fallback determinista cuando Gemini no está disponible.'
    );
  }

  // Test 8: Validación y recuperación ante resultado corrupto en localStorage
  {
    assert(
      validateStoredAssessmentResult(sampleResult).isValid === true,
      'Valid sampleResult should pass validateStoredAssessmentResult'
    );
    assert(
      validateStoredAssessmentResult({ assessmentId: 'broken', topCareers: ['unknown_id'] })
        .isValid === false,
      'Corrupted result with unknown careerId must fail validation'
    );

    // Simular localStorage en entorno Node para verificar loadAndValidateResultsFromStorage
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
      // Caso 1: Vacío
      const emptyLoad = loadAndValidateResultsFromStorage();
      assert(emptyLoad.status === 'empty' && emptyLoad.result === null, 'Should return empty');

      // Caso 2: Corrupto pero con respuestas previas válidas
      mockStorage.setItem(
        ASSESSMENT_STORAGE_KEY,
        JSON.stringify({
          hasStarted: true,
          currentIndex: 5,
          answers: { q_int_01: { questionId: 'q_int_01', value: 4, answeredAt: '2026-10-06' } },
          result: { assessmentId: 'corrupted_only_id' },
          updatedAt: '2026-10-06',
        })
      );

      const corruptLoad = loadAndValidateResultsFromStorage();
      assert(
        corruptLoad.status === 'corrupt' && corruptLoad.result === null,
        'Should detect corrupt result'
      );
      const cleanedRaw = JSON.parse(mockStorage.getItem(ASSESSMENT_STORAGE_KEY)!);
      assert(
        cleanedRaw.result === null && Boolean(cleanedRaw.answers?.q_int_01),
        'Should clean corrupt result while preserving valid answers'
      );
    } finally {
      (globalThis as Record<string, unknown>).localStorage = originalLocalStorage;
    }

    passed++;
    results.push(
      'PASS [F4 Test 08]: validateStoredAssessmentResult y loadAndValidateResultsFromStorage limpian datos corruptos de forma segura.'
    );
  }

  return { passed, results };
}
