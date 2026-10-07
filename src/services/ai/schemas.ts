import { AIInterpretation } from '../../types/interpretation';

const FORBIDDEN_MUTATION_KEYS = [
  'careerScores',
  'topCareers',
  'dimensionScores',
  'familyScores',
  'weights',
  'universities',
  'salaries',
];

function isNonEmptyStringArray(value: unknown, minItems = 1, maxItems = 8): value is string[] {
  if (!Array.isArray(value)) return false;
  if (value.length < minItems || value.length > maxItems) return false;
  return value.every(
    (item) => typeof item === 'string' && item.trim().length >= 5 && item.trim().length <= 500
  );
}

/**
 * Valida estrictamente la respuesta estructurada de Gemini contra el esquema AIInterpretation.
 * Si recibe un string JSON, intenta parsearlo primero.
 * Rechaza cualquier intento de inyectar o modificar careerScores, topCareers u otros campos fuera del contrato.
 */
export function validateAIInterpretation(raw: unknown): {
  isValid: boolean;
  data: AIInterpretation | null;
  error?: string;
} {
  let parsed: unknown = raw;

  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) {
      return { isValid: false, data: null, error: 'Respuesta vacía de Gemini.' };
    }
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      return { isValid: false, data: null, error: 'JSON inválido devuelto por Gemini.' };
    }
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return {
      isValid: false,
      data: null,
      error: 'La respuesta de Gemini no es un objeto JSON válido.',
    };
  }

  const record = parsed as Record<string, unknown>;

  for (const forbiddenKey of FORBIDDEN_MUTATION_KEYS) {
    if (forbiddenKey in record) {
      return {
        isValid: false,
        data: null,
        error: `La respuesta contiene un campo prohibido fuera del contrato: "${forbiddenKey}".`,
      };
    }
  }

  if (
    typeof record.summary !== 'string' ||
    record.summary.trim().length < 15 ||
    record.summary.trim().length > 1200
  ) {
    return {
      isValid: false,
      data: null,
      error: 'El campo "summary" es inválido o está vacío.',
    };
  }

  if (!isNonEmptyStringArray(record.strengths, 2, 6)) {
    return {
      isValid: false,
      data: null,
      error: 'El campo "strengths" debe ser una lista de 2 a 6 textos válidos.',
    };
  }

  if (!isNonEmptyStringArray(record.explorationAdvice, 2, 6)) {
    return {
      isValid: false,
      data: null,
      error: 'El campo "explorationAdvice" debe ser una lista de 2 a 6 textos válidos.',
    };
  }

  if (!isNonEmptyStringArray(record.reflectionQuestions, 2, 6)) {
    return {
      isValid: false,
      data: null,
      error: 'El campo "reflectionQuestions" debe ser una lista de 2 a 6 preguntas válidas.',
    };
  }

  return {
    isValid: true,
    data: {
      summary: record.summary.trim(),
      strengths: record.strengths.map((s) => s.trim()),
      explorationAdvice: record.explorationAdvice.map((s) => s.trim()),
      reflectionQuestions: record.reflectionQuestions.map((s) => s.trim()),
    },
  };
}
