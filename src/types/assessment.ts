import { DimensionCategory } from './career';

export type LikertValue = 1 | 2 | 3 | 4 | 5;

export interface AnswerOption {
  value: LikertValue;
  label: string;
  shortLabel?: string;
}

export interface Question {
  id: string;
  text: string;
  dimensionId: string;
  category: DimensionCategory;
  responseType: 'likert';
  options: AnswerOption[];
  reverseScored?: boolean;
  required: boolean;
}

export interface AssessmentAnswer {
  questionId: string;
  value: LikertValue;
  answeredAt: string;
}

export interface DimensionScore {
  dimensionId: string;
  category: DimensionCategory;
  assessed: boolean;
  score?: number;
  questionCount: number;
  answeredCount: number;
}

export type MatchTier = 'high' | 'moderate' | 'low';

export interface DimensionMatch {
  dimensionId: string;
  dimensionName: string;
  category: DimensionCategory;
  userScore: number;
  careerWeight: number;
  contribution: number;
  matchTier: MatchTier;
}

export interface DeterministicExplanation {
  strongMatches: DimensionMatch[];
  moderateMatches: DimensionMatch[];
  lowMatches: DimensionMatch[];
  summaryText: string;
}

export interface CareerScore {
  careerId: string;
  familyId: string;
  rawScore: number;
  normalizedScore: number;
  rank: number;
  evaluatedDimensionsCount: number;
  strongMatchesCount: number;
  matchedDimensions: DimensionMatch[];
  explanation: DeterministicExplanation;
}

export interface FamilyScore {
  familyId: string;
  rawScore: number;
  normalizedScore: number;
  rank: number;
  careerCount: number;
  topCareerIds: string[];
}

export interface AssessmentResult {
  assessmentId: string;
  completedAt: string;
  dimensionScores: DimensionScore[];
  familyScores: FamilyScore[];
  careerScores: CareerScore[];
  topCareers: string[];
}

export interface AssessmentStorageState {
  hasStarted: boolean;
  currentIndex: number;
  answers: Record<string, AssessmentAnswer>;
  result: AssessmentResult | null;
  updatedAt: string;
}

export interface QuestionValidationIssue {
  code: string;
  severity: 'error' | 'warning';
  message: string;
  questionId?: string;
}

export interface QuestionValidationResult {
  isValid: boolean;
  issues: QuestionValidationIssue[];
  stats: {
    totalQuestions: number;
    byCategory: Record<DimensionCategory, number>;
    uniqueDimensionsCovered: number;
    reverseScoredCount: number;
  };
}
