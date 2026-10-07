import {
  CAREER_FAMILIES_BY_ID,
  CAREERS_BY_ID,
  DIMENSIONS_BY_ID,
} from '../../data/careers';
import {
  AssessmentResult,
  CareerScore,
  DimensionScore,
} from '../../types/assessment';
import { Career, CareerFamily } from '../../types/career';
import {
  AIInterpretation,
  CareerDetailedExplanation,
} from '../../types/interpretation';

/**
 * Genera una explicación determinista completa para una carrera a partir de los datos
 * reales del motor (matchedDimensions y catálogo), sin depender de IA ni conexión a internet.
 */
export function buildCareerExplanation(
  careerScore: CareerScore,
  careerInput?: Career,
  familyInput?: CareerFamily
): CareerDetailedExplanation {
  const career = careerInput ?? CAREERS_BY_ID[careerScore.careerId];
  const family =
    familyInput ??
    (career
      ? CAREER_FAMILIES_BY_ID[career.familyId]
      : CAREER_FAMILIES_BY_ID[careerScore.familyId]);

  const careerName = career?.name ?? careerScore.careerId;
  const familyId = career?.familyId ?? careerScore.familyId;
  const familyName = family?.name ?? familyId;
  const affinityPercent = Math.round(careerScore.normalizedScore * 100);

  const strongMatches = careerScore.matchedDimensions.filter(
    (m) => m.matchTier === 'high'
  );
  const moderateMatches = careerScore.matchedDimensions.filter(
    (m) => m.matchTier === 'moderate'
  );
  const lowMatches = careerScore.matchedDimensions.filter(
    (m) => m.matchTier === 'low'
  );

  let whyItAppeared: string;
  if (strongMatches.length >= 2) {
    const names = strongMatches
      .slice(0, 3)
      .map((m) => m.dimensionName.toLowerCase())
      .join(', ');
    whyItAppeared = `Esta carrera aparece entre tus principales afinidades (${affinityPercent}% de coincidencia relativa) porque tu perfil muestra puntuaciones altas en ${names}, dimensiones que tienen una relación importante con el ejercicio de ${careerName}.`;
  } else if (strongMatches.length === 1) {
    const primary = strongMatches[0].dimensionName.toLowerCase();
    const secondary = moderateMatches
      .slice(0, 2)
      .map((m) => m.dimensionName.toLowerCase())
      .join(' y ');
    whyItAppeared = `${careerName} aparece en tu resultado porque tu perfil destaca en ${primary}${
      secondary ? `, complementado por afinidades moderadas en ${secondary}` : ''
    }.`;
  } else if (moderateMatches.length > 0) {
    const names = moderateMatches
      .slice(0, 3)
      .map((m) => m.dimensionName.toLowerCase())
      .join(', ');
    whyItAppeared = `${careerName} muestra una coincidencia equilibrada con tu perfil gracias a tus preferencias e intereses reportados en ${names}.`;
  } else {
    whyItAppeared = `${careerName} presenta una afinidad baja frente a las preferencias principales que registraste en este momento.`;
  }

  const strongMatchesSummary =
    strongMatches.length > 0
      ? `Destacan especialmente tus coincidencias en ${strongMatches
          .slice(0, 4)
          .map((m) => `${m.dimensionName} (${Math.round(m.userScore * 100)}%)`)
          .join(', ')}.`
      : 'En esta carrera tu perfil se apoya más en afinidades equilibradas que en una única dimensión dominante.';

  const moderateMatchesSummary =
    moderateMatches.length > 0
      ? `Presentas un nivel de afinidad intermedio en ${moderateMatches
          .slice(0, 4)
          .map((m) => `${m.dimensionName} (${Math.round(m.userScore * 100)}%)`)
          .join(', ')}.`
      : 'No se registran dimensiones en el rango intermedio para esta carrera.';

  const lowMatchesSummary =
    lowMatches.length > 0
      ? `Conviene revisar qué tanto te atraen aspectos como ${lowMatches
          .slice(0, 3)
          .map((m) => m.dimensionName.toLowerCase())
          .join(', ')}, donde registraste una preferencia menor pero son habituales en este campo.`
      : 'No se observan contrastes bajos marcados entre tu perfil y las dimensiones centrales de esta carrera.';

  const aspectsToExplore: string[] = [];
  if (career?.typicalAreas && career.typicalAreas.length > 0) {
    aspectsToExplore.push(
      `Explorar cómo es el trabajo diario en áreas como ${career.typicalAreas
        .slice(0, 3)
        .join(', ')}.`
    );
  }
  if (strongMatches.length > 0) {
    aspectsToExplore.push(
      `Investigar proyectos reales donde se apliquen ${strongMatches
        .slice(0, 2)
        .map((m) => m.dimensionName.toLowerCase())
        .join(' y ')}.`
    );
  }
  if (lowMatches.length > 0) {
    aspectsToExplore.push(
      `Conversar con estudiantes o profesionales sobre el papel de ${lowMatches[0].dimensionName.toLowerCase()} en ${careerName}.`
    );
  } else {
    aspectsToExplore.push(
      `Comparar el enfoque de ${careerName} frente a otras opciones de la familia de ${familyName}.`
    );
  }

  return {
    careerId: careerScore.careerId,
    careerName,
    familyId,
    familyName,
    rank: careerScore.rank,
    affinityPercent,
    normalizedScore: careerScore.normalizedScore,
    shortDescription:
      career?.shortDescription ??
      'Área académica y profesional incluida en el catálogo vocacional de YorVoca.',
    whatYouDo: career?.whatYouDo ?? [],
    typicalAreas: career?.typicalAreas ?? [],
    whyItAppeared,
    strongMatchesSummary,
    moderateMatchesSummary,
    lowMatchesSummary,
    aspectsToExplore,
  };
}

/**
 * Obtiene las dimensiones efectivamente evaluadas (assessed === true) ordenadas de mayor a menor score.
 * Garantiza que jamás se incluyan dimensiones con assessed === false.
 */
export function getTopEvaluatedDimensions(
  dimensionScores: DimensionScore[],
  limit = 6
): Array<
  DimensionScore & {
    score: number;
    name: string;
    description: string;
  }
> {
  return dimensionScores
    .filter(
      (d): d is DimensionScore & { score: number } =>
        d.assessed === true &&
        typeof d.score === 'number' &&
        !Number.isNaN(d.score)
    )
    .sort((a, b) => {
      if (Math.abs(b.score - a.score) > 1e-9) {
        return b.score - a.score;
      }
      return a.dimensionId.localeCompare(b.dimensionId);
    })
    .slice(0, Math.max(1, limit))
    .map((d) => {
      const info = DIMENSIONS_BY_ID[d.dimensionId];
      return {
        ...d,
        name: info?.name ?? d.dimensionId,
        description: info?.description ?? '',
      };
    });
}

/**
 * Construye una interpretación estructurada y determinista a partir del AssessmentResult.
 * Se utiliza como base inmediata y como fallback seguro cuando Gemini no está disponible.
 */
export function buildDeterministicAIInterpretation(
  result: AssessmentResult
): AIInterpretation {
  const topDims = getTopEvaluatedDimensions(result.dimensionScores, 5);
  const topFamilies = result.familyScores.slice(0, 3);
  const topCareers = result.careerScores.slice(0, 5);

  const dimNames = topDims
    .slice(0, 3)
    .map((d) => d.name.toLowerCase())
    .join(', ');
  const famNames = topFamilies
    .slice(0, 2)
    .map((f) => CAREER_FAMILIES_BY_ID[f.familyId]?.name ?? f.familyId)
    .join(' y ');
  const careerNames = topCareers
    .slice(0, 3)
    .map((c) => CAREERS_BY_ID[c.careerId]?.name ?? c.careerId)
    .join(', ');

  const summary = `Tus respuestas reflejan una afinidad destacada hacia dimensiones como ${
    dimNames || 'el aprendizaje y la resolución de problemas'
  }. Este patrón conecta de manera consistente con las familias de ${
    famNames || 'exploración profesional'
  }, situando a ${
    careerNames || 'tus primeras opciones'
  } entre las áreas que más vale la pena explorar según tu perfil actual.`;

  const strengths = topDims.slice(0, 4).map((d) => {
    const pct = Math.round(d.score * 100);
    return `${d.name} (${pct}% de afinidad): ${d.description}`;
  });

  const explorationAdvice = [
    `Revisa en detalle qué hace un profesional en ${
      CAREERS_BY_ID[topCareers[0]?.careerId]?.name ?? 'tu primera opción'
    } y compáralo con ${
      CAREERS_BY_ID[topCareers[1]?.careerId]?.name ?? 'tu segunda opción'
    } para identificar cuál entorno de trabajo te atrae más en el día a día.`,
    `Observa cómo se combinan tus intereses principales con tus preferencias de trabajo antes de tomar una decisión definitiva.`,
    `Contrasta estas áreas compatibles con las modalidades e instituciones disponibles en tu contexto geográfico cuando explores programas reales.`,
  ];

  const reflectionQuestions = [
    `De las actividades cotidianas que realizan las carreras de tu Top 5, ¿cuáles te gustaría experimentar primero en un proyecto corto?`,
    `¿Prefieres un entorno profesional más enfocado en ${
      topDims[0]?.name.toLowerCase() ?? 'tus fortalezas actuales'
    } o uno que combine varias áreas diferentes?`,
    `¿Qué dudas te gustaría resolver sobre ${
      CAREERS_BY_ID[topCareers[0]?.careerId]?.name ?? 'estas carreras'
    } antes de elegir un programa universitario?`,
  ];

  return {
    summary,
    strengths:
      strengths.length >= 2
        ? strengths
        : [
            'Disposición para explorar distintas áreas de conocimiento.',
            'Interés por comprender cómo conectan tus preferencias con el mundo académico.',
          ],
    explorationAdvice,
    reflectionQuestions,
  };
}

/**
 * Valida que un objeto AssessmentResult almacenado en localStorage esté completo,
 * íntegro y sin corrupción antes de renderizar la página de resultados.
 */
export function validateStoredAssessmentResult(raw: unknown): {
  isValid: boolean;
  result: AssessmentResult | null;
  reason?: string;
} {
  if (!raw || typeof raw !== 'object') {
    return { isValid: false, result: null, reason: 'El resultado no es un objeto válido.' };
  }

  const candidate = raw as Partial<AssessmentResult>;

  if (typeof candidate.assessmentId !== 'string' || !candidate.assessmentId.trim()) {
    return { isValid: false, result: null, reason: 'Falta assessmentId válido.' };
  }

  if (typeof candidate.completedAt !== 'string' || !candidate.completedAt.trim()) {
    return { isValid: false, result: null, reason: 'Falta completedAt válido.' };
  }

  if (!Array.isArray(candidate.dimensionScores) || candidate.dimensionScores.length === 0) {
    return { isValid: false, result: null, reason: 'dimensionScores está vacío o corrupto.' };
  }

  const hasAssessedDimension = candidate.dimensionScores.some(
    (d) =>
      d &&
      typeof d.dimensionId === 'string' &&
      Boolean(DIMENSIONS_BY_ID[d.dimensionId]) &&
      d.assessed === true &&
      typeof d.score === 'number' &&
      d.score >= 0 &&
      d.score <= 1
  );

  if (!hasAssessedDimension) {
    return {
      isValid: false,
      result: null,
      reason: 'El resultado no contiene dimensiones evaluadas válidas.',
    };
  }

  if (!Array.isArray(candidate.familyScores) || candidate.familyScores.length === 0) {
    return { isValid: false, result: null, reason: 'familyScores está vacío o corrupto.' };
  }

  if (!Array.isArray(candidate.careerScores) || candidate.careerScores.length < 5) {
    return { isValid: false, result: null, reason: 'careerScores es incompleto o corrupto.' };
  }

  if (
    !Array.isArray(candidate.topCareers) ||
    candidate.topCareers.length === 0 ||
    candidate.topCareers.length > 5
  ) {
    return { isValid: false, result: null, reason: 'topCareers es inválido.' };
  }

  for (const careerId of candidate.topCareers) {
    if (typeof careerId !== 'string' || !CAREERS_BY_ID[careerId]) {
      return {
        isValid: false,
        result: null,
        reason: `topCareers contiene una carrera desconocida: "${String(careerId)}".`,
      };
    }
  }

  for (let i = 0; i < 5; i++) {
    const cs = candidate.careerScores[i];
    if (
      !cs ||
      typeof cs.careerId !== 'string' ||
      !CAREERS_BY_ID[cs.careerId] ||
      typeof cs.rawScore !== 'number' ||
      Number.isNaN(cs.rawScore) ||
      cs.rawScore < 0 ||
      cs.rawScore > 1 ||
      typeof cs.normalizedScore !== 'number' ||
      !Array.isArray(cs.matchedDimensions) ||
      !cs.explanation
    ) {
      return {
        isValid: false,
        result: null,
        reason: 'Uno de los elementos principales de careerScores está corrupto.',
      };
    }
  }

  return {
    isValid: true,
    result: candidate as AssessmentResult,
  };
}
