import { VOCATIONAL_DIMENSIONS } from '../../data/careers';
import { ASSESSMENT_QUESTIONS } from '../../data/questions';
import { AssessmentAnswer, DimensionScore, Question } from '../../types/assessment';
import { VocationalDimension } from '../../types/career';
import { isValidLikertValue, normalizeLikertAnswer } from './normalizeAnswer';

export function scoreDimensions(
  answersInput: Record<string, AssessmentAnswer> | AssessmentAnswer[],
  questions: Question[] = ASSESSMENT_QUESTIONS,
  dimensions: VocationalDimension[] = VOCATIONAL_DIMENSIONS
): DimensionScore[] {
  const answersMap: Record<string, AssessmentAnswer> = Array.isArray(answersInput)
    ? Object.fromEntries(answersInput.map((a) => [a.questionId, a]))
    : answersInput;

  const questionsByDimension = new Map<string, Question[]>();
  for (const question of questions) {
    if (!questionsByDimension.has(question.dimensionId)) {
      questionsByDimension.set(question.dimensionId, []);
    }
    questionsByDimension.get(question.dimensionId)!.push(question);
  }

  return dimensions.map((dimension): DimensionScore => {
    const dimQuestions = questionsByDimension.get(dimension.id) ?? [];
    const normalizedValues: number[] = [];

    for (const q of dimQuestions) {
      const answer = answersMap[q.id];
      if (answer && isValidLikertValue(answer.value)) {
        normalizedValues.push(normalizeLikertAnswer(answer.value, Boolean(q.reverseScored)));
      }
    }

    if (normalizedValues.length === 0) {
      return {
        dimensionId: dimension.id,
        category: dimension.category,
        assessed: false,
        score: undefined,
        questionCount: dimQuestions.length,
        answeredCount: 0,
      };
    }

    const sum = normalizedValues.reduce((acc, val) => acc + val, 0);
    const averageScore = sum / normalizedValues.length;

    return {
      dimensionId: dimension.id,
      category: dimension.category,
      assessed: true,
      score: averageScore,
      questionCount: dimQuestions.length,
      answeredCount: normalizedValues.length,
    };
  });
}
