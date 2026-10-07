import { CAREER_FAMILIES } from '../../data/careers';
import { CareerScore, FamilyScore } from '../../types/assessment';
import { CareerFamily } from '../../types/career';
import { compareCareerScores } from './rankCareers';

const SCORE_EPSILON = 1e-9;

/**
 * Calcula la afinidad por familia profesional a partir del perfil de las carreras de cada familia.
 *
 * Método:
 * Para evitar que una familia con mayor cantidad de carreras en el catálogo (p. ej. 7 vs 2)
 * obtenga ventaja artificial por tamaño de muestra, se calcula el centroide de afinidad de la
 * familia como la media aritmética de los `rawScore` normalizados de las carreras que la integran:
 *
 *   familyRawScore(F) = (1 / |C_F|) * Σ_{c in C_F} careerRawScore(c)
 *
 * De este modo, duplicar o añadir más carreras con el mismo perfil a una familia mantiene su
 * puntuación invariante.
 */
export function scoreFamilies(
  careerScores: CareerScore[],
  families: CareerFamily[] = CAREER_FAMILIES
): FamilyScore[] {
  const careersByFamily = new Map<string, CareerScore[]>();
  for (const cs of careerScores) {
    if (!careersByFamily.has(cs.familyId)) {
      careersByFamily.set(cs.familyId, []);
    }
    careersByFamily.get(cs.familyId)!.push(cs);
  }

  const unranked = families.map((family): FamilyScore => {
    const familyCareers = [...(careersByFamily.get(family.id) ?? [])].sort(compareCareerScores);
    const careerCount = familyCareers.length;

    if (careerCount === 0) {
      return {
        familyId: family.id,
        rawScore: 0,
        normalizedScore: 0,
        rank: 0,
        careerCount: 0,
        topCareerIds: [],
      };
    }

    const sumScores = familyCareers.reduce((acc, c) => acc + c.rawScore, 0);
    const rawScore = sumScores / careerCount;
    const normalizedScore = Number(rawScore.toFixed(4));

    return {
      familyId: family.id,
      rawScore,
      normalizedScore,
      rank: 0,
      careerCount,
      topCareerIds: familyCareers.slice(0, 3).map((c) => c.careerId),
    };
  });

  const sorted = unranked.sort((a, b) => {
    const diff = b.rawScore - a.rawScore;
    if (Math.abs(diff) > SCORE_EPSILON) {
      return diff;
    }
    return a.familyId.localeCompare(b.familyId);
  });

  return sorted.map((item, idx) => ({
    ...item,
    rank: idx + 1,
  }));
}
