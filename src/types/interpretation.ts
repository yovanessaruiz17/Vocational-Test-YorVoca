export interface AIInterpretation {
  summary: string;
  strengths: string[];
  explorationAdvice: string[];
  reflectionQuestions: string[];
}

export interface AIInterpretationPayload {
  topDimensions: Array<{
    id: string;
    name: string;
    category: string;
    scorePercent: number;
  }>;
  topFamilies: Array<{
    id: string;
    name: string;
    scorePercent: number;
  }>;
  topCareers: Array<{
    id: string;
    name: string;
    familyName: string;
    rank: number;
    scorePercent: number;
  }>;
  careerMatches: Array<{
    careerId: string;
    careerName: string;
    strongDimensions: string[];
    moderateDimensions: string[];
  }>;
}

export type InterpretationSource = 'gemini' | 'deterministic_fallback';

export interface AIInterpretationResponse {
  interpretation: AIInterpretation;
  source: InterpretationSource;
  notice?: string;
}

export interface CareerDetailedExplanation {
  careerId: string;
  careerName: string;
  familyId: string;
  familyName: string;
  rank: number;
  affinityPercent: number;
  normalizedScore: number;
  shortDescription: string;
  whatYouDo: string[];
  typicalAreas: string[];
  whyItAppeared: string;
  strongMatchesSummary: string;
  moderateMatchesSummary: string;
  lowMatchesSummary: string;
  aspectsToExplore: string[];
}
