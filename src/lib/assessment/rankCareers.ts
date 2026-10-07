import { CareerScore } from '../../types/assessment';

const SCORE_EPSILON = 1e-9;

function getHighWeightAverageScore(careerScore: CareerScore): number {
  const highWeightDims = careerScore.matchedDimensions.filter((m) => m.careerWeight >= 1.0);
  if (highWeightDims.length === 0) return 0;
  const sum = highWeightDims.reduce((acc, m) => acc + m.userScore, 0);
  return sum / highWeightDims.length;
}

export function compareCareerScores(a: CareerScore, b: CareerScore): number {
  // 1. Mayor rawScore
  const scoreDiff = b.rawScore - a.rawScore;
  if (Math.abs(scoreDiff) > SCORE_EPSILON) {
    return scoreDiff;
  }

  // 2. Mayor cantidad de coincidencias fuertes (strongMatchesCount)
  if (b.strongMatchesCount !== a.strongMatchesCount) {
    return b.strongMatchesCount - a.strongMatchesCount;
  }

  // 3. Mayor afinidad promedio en dimensiones nucleares (peso 1.0)
  const highWeightDiff = getHighWeightAverageScore(b) - getHighWeightAverageScore(a);
  if (Math.abs(highWeightDiff) > SCORE_EPSILON) {
    return highWeightDiff;
  }

  // 4. Desempate alfabético estable por careerId
  return a.careerId.localeCompare(b.careerId);
}

export function rankCareers(
  careerScores: CareerScore[],
  topLimit = 5
): {
  rankedCareers: CareerScore[];
  topCareers: string[];
} {
  // Deduplicar por careerId por seguridad antes de ordenar
  const uniqueMap = new Map<string, CareerScore>();
  for (const score of careerScores) {
    if (!uniqueMap.has(score.careerId)) {
      uniqueMap.set(score.careerId, score);
    }
  }

  const sorted = Array.from(uniqueMap.values()).sort(compareCareerScores);

  const rankedCareers = sorted.map((item, idx) => ({
    ...item,
    rank: idx + 1,
  }));

  const topCareers = rankedCareers
    .slice(0, Math.max(0, topLimit))
    .map((item) => item.careerId);

  return {
    rankedCareers,
    topCareers,
  };
}
