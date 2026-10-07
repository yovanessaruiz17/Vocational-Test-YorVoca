import {
  CAREER_DIMENSION_WEIGHTS,
  CAREERS,
  DIMENSIONS_BY_ID,
  VOCATIONAL_DIMENSIONS,
} from '../../data/careers';
import {
  CareerScore,
  DeterministicExplanation,
  DimensionMatch,
  DimensionScore,
  MatchTier,
} from '../../types/assessment';
import { Career, CareerDimensionWeight, VocationalDimension } from '../../types/career';

function classifyMatchTier(userScore: number, careerWeight: number): MatchTier {
  if (userScore >= 0.7 && careerWeight >= 0.75) {
    return 'high';
  }
  if (userScore <= 0.35 && careerWeight >= 0.5) {
    return 'low';
  }
  return 'moderate';
}

function buildDeterministicExplanation(
  career: Career,
  matchedDimensions: DimensionMatch[]
): DeterministicExplanation {
  const strongMatches = matchedDimensions.filter((m) => m.matchTier === 'high');
  const moderateMatches = matchedDimensions.filter((m) => m.matchTier === 'moderate');
  const lowMatches = matchedDimensions.filter((m) => m.matchTier === 'low');

  let summaryText: string;

  if (strongMatches.length > 0) {
    const topNames = strongMatches
      .slice(0, 3)
      .map((m) => m.dimensionName.toLowerCase())
      .join(', ');
    summaryText = `${career.name} muestra alta afinidad con tu perfil por la coincidencia en ${topNames}.`;
  } else if (moderateMatches.length > 0) {
    const topNames = moderateMatches
      .slice(0, 3)
      .map((m) => m.dimensionName.toLowerCase())
      .join(', ');
    summaryText = `${career.name} presenta una coincidencia moderada con tu perfil en dimensiones como ${topNames}.`;
  } else {
    summaryText = `${career.name} presenta baja coincidencia actual con las preferencias e intereses reportados en tu perfil.`;
  }

  return {
    strongMatches,
    moderateMatches,
    lowMatches,
    summaryText,
  };
}

/**
 * Calcula la puntuación determinista de cada carrera (sin ordenar por ranking todavía).
 *
 * Fórmula:
 *   rawScore = Σ(userDimensionScore * careerWeight) / Σ(careerWeight)
 * considerando ÚNICAMENTE las dimensiones que fueron efectivamente evaluadas (assessed === true).
 * Las dimensiones no evaluadas se excluyen tanto del numerador como del denominador.
 */
export function scoreCareers(
  dimensionScores: DimensionScore[],
  careers: Career[] = CAREERS,
  weights: CareerDimensionWeight[] = CAREER_DIMENSION_WEIGHTS,
  dimensions: VocationalDimension[] = VOCATIONAL_DIMENSIONS
): CareerScore[] {
  const assessedScoresById = new Map<string, number>();
  for (const ds of dimensionScores) {
    if (ds.assessed && typeof ds.score === 'number' && !Number.isNaN(ds.score)) {
      assessedScoresById.set(ds.dimensionId, ds.score);
    }
  }

  const dimensionLookup = new Map<string, VocationalDimension>();
  for (const dim of dimensions) {
    dimensionLookup.set(dim.id, dim);
  }

  const weightsByCareer = new Map<string, CareerDimensionWeight[]>();
  for (const w of weights) {
    if (w.weight <= 0) continue;
    if (!weightsByCareer.has(w.careerId)) {
      weightsByCareer.set(w.careerId, []);
    }
    weightsByCareer.get(w.careerId)!.push(w);
  }

  return careers.map((career): CareerScore => {
    const careerWeights = weightsByCareer.get(career.id) ?? [];

    const evaluatedPairs: Array<{
      weightItem: CareerDimensionWeight;
      userScore: number;
      dimension: VocationalDimension;
    }> = [];

    let totalEvaluatedWeight = 0;
    let weightedSum = 0;

    for (const weightItem of careerWeights) {
      const userScore = assessedScoresById.get(weightItem.dimensionId);
      if (userScore === undefined) {
        // Dimensión no evaluada: se ignora en numerador y denominador
        continue;
      }

      const dimension =
        dimensionLookup.get(weightItem.dimensionId) ??
        DIMENSIONS_BY_ID[weightItem.dimensionId] ?? {
          id: weightItem.dimensionId,
          name: weightItem.dimensionId,
          description: '',
          category: 'interest',
        };

      evaluatedPairs.push({ weightItem, userScore, dimension });
      totalEvaluatedWeight += weightItem.weight;
      weightedSum += userScore * weightItem.weight;
    }

    const rawScore = totalEvaluatedWeight > 0 ? weightedSum / totalEvaluatedWeight : 0;
    const normalizedScore = Number(rawScore.toFixed(4));

    const matchedDimensions: DimensionMatch[] = evaluatedPairs
      .map(({ weightItem, userScore, dimension }) => {
        const contribution =
          totalEvaluatedWeight > 0
            ? (userScore * weightItem.weight) / totalEvaluatedWeight
            : 0;
        return {
          dimensionId: weightItem.dimensionId,
          dimensionName: dimension.name,
          category: dimension.category,
          userScore,
          careerWeight: weightItem.weight,
          contribution: Number(contribution.toFixed(4)),
          matchTier: classifyMatchTier(userScore, weightItem.weight),
        };
      })
      .sort((a, b) => {
        if (Math.abs(b.contribution - a.contribution) > 1e-9) {
          return b.contribution - a.contribution;
        }
        if (Math.abs(b.careerWeight - a.careerWeight) > 1e-9) {
          return b.careerWeight - a.careerWeight;
        }
        return a.dimensionId.localeCompare(b.dimensionId);
      });

    const explanation = buildDeterministicExplanation(career, matchedDimensions);

    return {
      careerId: career.id,
      familyId: career.familyId,
      rawScore,
      normalizedScore,
      rank: 0, // Asignado por rankCareers
      evaluatedDimensionsCount: evaluatedPairs.length,
      strongMatchesCount: explanation.strongMatches.length,
      matchedDimensions,
      explanation,
    };
  });
}
