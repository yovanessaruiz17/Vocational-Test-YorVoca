import {
  CAREER_FAMILIES_BY_ID,
  CAREERS_BY_ID,
} from '../../data/careers';
import { getTopEvaluatedDimensions } from '../../lib/assessment';
import { AssessmentResult } from '../../types/assessment';
import { AIInterpretationPayload } from '../../types/interpretation';

export const SYSTEM_INSTRUCTION_INTERPRETATION = `Eres el asistente de interpretación vocacional de YorVoca (Colombia).
Tu función es exclusivamente interpretar y explicar en español claro, cercano y orientativo un resultado vocacional determinista ya calculado por el motor de YorVoca.

REGLAS ESTRICTAS:
1. NO decidas ni afirmes cuál es la carrera "correcta", "ideal" o "definitiva" para la persona.
2. Usa expresiones orientativas como "muestra afinidad con tu perfil", "áreas que vale la pena explorar", "coincidencia con tus preferencias".
3. NO modifiques puntuaciones ni el orden del Top 5 de carreras recibido.
4. NO inventes nombres de universidades, programas SNIES, salarios, tasas de empleabilidad, costos, duración de carreras, cursos de YouTube ni enlaces externos.
5. Basa tu explicación únicamente en las dimensiones, familias y carreras suministradas en el JSON de entrada.
6. Devuelve exclusivamente un objeto JSON válido con las propiedades: "summary", "strengths", "explorationAdvice" y "reflectionQuestions".`;

/**
 * Construye el payload mínimo y anonimizado que puede enviarse a Gemini.
 * No incluye ubicación geográfica, datos personales ni las 48 respuestas crudas.
 */
export function buildAIInterpretationPayload(
  result: AssessmentResult
): AIInterpretationPayload {
  const topDimensions = getTopEvaluatedDimensions(result.dimensionScores, 6).map((d) => ({
    id: d.dimensionId,
    name: d.name,
    category: d.category,
    scorePercent: Math.round(d.score * 100),
  }));

  const topFamilies = result.familyScores.slice(0, 4).map((f) => ({
    id: f.familyId,
    name: CAREER_FAMILIES_BY_ID[f.familyId]?.name ?? f.familyId,
    scorePercent: Math.round(f.normalizedScore * 100),
  }));

  const top5CareerScores = result.careerScores.slice(0, 5);

  const topCareers = top5CareerScores.map((c) => {
    const career = CAREERS_BY_ID[c.careerId];
    const family = career
      ? CAREER_FAMILIES_BY_ID[career.familyId]
      : CAREER_FAMILIES_BY_ID[c.familyId];
    return {
      id: c.careerId,
      name: career?.name ?? c.careerId,
      familyName: family?.name ?? c.familyId,
      rank: c.rank,
      scorePercent: Math.round(c.normalizedScore * 100),
    };
  });

  const careerMatches = top5CareerScores.map((c) => {
    const career = CAREERS_BY_ID[c.careerId];
    return {
      careerId: c.careerId,
      careerName: career?.name ?? c.careerId,
      strongDimensions: c.explanation.strongMatches
        .slice(0, 4)
        .map((m) => m.dimensionName),
      moderateDimensions: c.explanation.moderateMatches
        .slice(0, 3)
        .map((m) => m.dimensionName),
    };
  });

  return {
    topDimensions,
    topFamilies,
    topCareers,
    careerMatches,
  };
}

export function buildInterpretationPrompt(payload: AIInterpretationPayload): string {
  return `Interpreta el siguiente perfil vocacional estructurado y genera una síntesis orientativa para el estudiante:

${JSON.stringify(payload, null, 2)}

Recuerda:
- "summary": 1 párrafo claro (máximo 85 palabras) conectando sus dimensiones destacadas con sus familias y su Top 5 de carreras sin tono determinista.
- "strengths": 3 puntos concretos resaltando las principales afinidades observadas en sus dimensiones evaluadas.
- "explorationAdvice": 3 recomendaciones prácticas para explorar las carreras del Top 5 a partir de sus actividades y áreas típicas (sin mencionar universidades ni salarios).
- "reflectionQuestions": 3 preguntas abiertas que inviten al estudiante a reflexionar sobre cómo se imagina en esos entornos de trabajo.`;
}
