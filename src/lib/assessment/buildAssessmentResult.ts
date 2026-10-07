import {
  CAREER_DIMENSION_WEIGHTS,
  CAREER_FAMILIES,
  CAREERS,
  VOCATIONAL_DIMENSIONS,
} from '../../data/careers';
import { ASSESSMENT_QUESTIONS } from '../../data/questions';
import {
  AssessmentAnswer,
  AssessmentResult,
  Question,
} from '../../types/assessment';
import {
  Career,
  CareerDimensionWeight,
  CareerFamily,
  VocationalDimension,
} from '../../types/career';
import { rankCareers } from './rankCareers';
import { scoreCareers } from './scoreCareers';
import { scoreDimensions } from './scoreDimensions';
import { scoreFamilies } from './scoreFamilies';

export interface BuildAssessmentResultOptions {
  questions?: Question[];
  dimensions?: VocationalDimension[];
  families?: CareerFamily[];
  careers?: Career[];
  weights?: CareerDimensionWeight[];
  topLimit?: number;
  assessmentId?: string;
  completedAt?: string;
}

function computeDeterministicAssessmentId(
  answers: Record<string, AssessmentAnswer>
): string {
  const canonical = Object.keys(answers)
    .sort()
    .map((qId) => `${qId}:${answers[qId].value}`)
    .join('|');

  let hash = 2166136261;
  for (let i = 0; i < canonical.length; i++) {
    hash ^= canonical.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const unsigned = (hash >>> 0).toString(16).padStart(8, '0');
  return `yv_assessment_${unsigned}`;
}

export function buildAssessmentResult(
  answersInput: Record<string, AssessmentAnswer> | AssessmentAnswer[],
  options: BuildAssessmentResultOptions = {}
): AssessmentResult {
  const answersMap: Record<string, AssessmentAnswer> = Array.isArray(answersInput)
    ? Object.fromEntries(answersInput.map((a) => [a.questionId, a]))
    : answersInput;

  const questions = options.questions ?? ASSESSMENT_QUESTIONS;
  const dimensions = options.dimensions ?? VOCATIONAL_DIMENSIONS;
  const families = options.families ?? CAREER_FAMILIES;
  const careers = options.careers ?? CAREERS;
  const weights = options.weights ?? CAREER_DIMENSION_WEIGHTS;
  const topLimit = options.topLimit ?? 5;

  const dimensionScores = scoreDimensions(answersMap, questions, dimensions);
  const unrankedCareers = scoreCareers(dimensionScores, careers, weights, dimensions);
  const { rankedCareers, topCareers } = rankCareers(unrankedCareers, topLimit);
  const familyScores = scoreFamilies(rankedCareers, families);

  return {
    assessmentId: options.assessmentId ?? computeDeterministicAssessmentId(answersMap),
    completedAt: options.completedAt ?? new Date().toISOString(),
    dimensionScores,
    familyScores,
    careerScores: rankedCareers,
    topCareers,
  };
}
