import { buildDeterministicAIInterpretation } from '../../lib/assessment';
import { AssessmentResult } from '../../types/assessment';
import { AIInterpretationResponse } from '../../types/interpretation';
import { buildAIInterpretationPayload } from './prompts';
import { validateAIInterpretation } from './schemas';

export interface RequestInterpretationOptions {
  rawResponseOverride?: unknown;
  fetcher?: typeof fetch;
}

/**
 * Solicita una interpretación orientativa a la capa de Gemini (vía endpoint de servidor /api/ai/interpret)
 * o utiliza de forma transparente el fallback determinista si la fuente no está disponible o devuelve
 * un esquema inválido.
 *
 * GARANTÍA DE INMUTABILIDAD:
 * Esta función jamás modifica ni reemplaza `careerScores`, `topCareers`, `dimensionScores` ni `familyScores`.
 */
export async function requestVocationalInterpretation(
  result: AssessmentResult,
  options: RequestInterpretationOptions = {}
): Promise<AIInterpretationResponse> {
  // Snapshot de seguridad para garantizar que ni el cliente ni la respuesta alteren el resultado
  const originalTopCareersJson = JSON.stringify(result.topCareers);
  const originalCareerScoresJson = JSON.stringify(result.careerScores);

  const fallback = buildDeterministicAIInterpretation(result);

  try {
    let rawCandidate: unknown;

    if ('rawResponseOverride' in options && options.rawResponseOverride !== undefined) {
      rawCandidate = options.rawResponseOverride;
    } else {
      const fetchFn =
        options.fetcher ?? (typeof fetch !== 'undefined' ? fetch : undefined);

      if (!fetchFn) {
        return {
          interpretation: fallback,
          source: 'deterministic_fallback',
          notice: 'Esta función requiere conexión con la fuente correspondiente.',
        };
      }

      const payload = buildAIInterpretationPayload(result);

      const response = await fetchFn('/api/ai/interpret', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ payload }),
      });

      if (!response.ok) {
        return {
          interpretation: fallback,
          source: 'deterministic_fallback',
          notice: 'Esta función requiere conexión con la fuente correspondiente.',
        };
      }

      const body = (await response.json()) as {
        available?: boolean;
        interpretation?: unknown;
        message?: string;
      };

      if (body && body.available === false) {
        return {
          interpretation: fallback,
          source: 'deterministic_fallback',
          notice:
            body.message ??
            'Esta función requiere conexión con la fuente correspondiente.',
        };
      }

      rawCandidate = body?.interpretation ?? body;
    }

    const validation = validateAIInterpretation(rawCandidate);

    // Verificar invariante de inmutabilidad sobre el AssessmentResult original
    if (
      JSON.stringify(result.topCareers) !== originalTopCareersJson ||
      JSON.stringify(result.careerScores) !== originalCareerScoresJson
    ) {
      throw new Error('Invariante violada: intento de mutación sobre AssessmentResult.');
    }

    if (!validation.isValid || !validation.data) {
      return {
        interpretation: fallback,
        source: 'deterministic_fallback',
        notice: 'Se utilizó la síntesis determinista del motor vocacional.',
      };
    }

    return {
      interpretation: validation.data,
      source: 'gemini',
    };
  } catch {
    return {
      interpretation: fallback,
      source: 'deterministic_fallback',
      notice: 'Esta función requiere conexión con la fuente correspondiente.',
    };
  }
}
