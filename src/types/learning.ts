export type LearningResourceType =
  | 'mooc'
  | 'course'
  | 'guide'
  | 'documentation'
  | 'interactive_tutorial'
  | 'video_series'
  | 'book_open'
  | 'practice_platform'
  | 'community_program';

export type LearningDifficultyLevel =
  | 'introductory'
  | 'foundational'
  | 'intermediate';

export type LearningAccessType =
  | 'free'
  | 'freemium_audit'
  | 'public_open';

export type LearningLanguage =
  | 'es'
  | 'en'
  | 'es_subtitled';

export type LearningSourceType =
  | 'public_institution'
  | 'university_open'
  | 'official_documentation'
  | 'established_open_platform';

export type LearningVerificationStatus =
  | 'verified'
  | 'partial_reference';

export type LearningMatchTier =
  | 'direct'
  | 'related';

export type CareerLearningCoverageStatus =
  | 'direct_and_path'
  | 'related_and_path'
  | 'path_only';

export interface LearningSourceReference {
  id: string;
  providerName: string;
  sourceType: LearningSourceType;
  canonicalUrl: string;
  verifiedAt: string;
  verificationStatus: LearningVerificationStatus;
  costPolicyNote: string;
  colombiaRelevanceNote?: string;
  notes?: string;
}

export interface LearningResource {
  id: string;
  title: string;
  normalizedTitle: string;
  providerName: string;
  resourceType: LearningResourceType;
  difficulty: LearningDifficultyLevel;
  accessType: LearningAccessType;
  language: LearningLanguage;
  estimatedDuration: string;
  summary: string;
  whatYouWillLearn: string[];
  prerequisitesNote: string;
  careerIds: string[];
  familyIds: string[];
  relatedDimensionIds: string[];
  starterTopicTags: string[];
  canonicalUrl: string;
  sourceId: string;
  verificationStatus: LearningVerificationStatus;
  isColombiaSpecific: boolean;
  active: boolean;
}

export interface LearningPathStep {
  id: string;
  order: number;
  title: string;
  stage: LearningDifficultyLevel;
  objective: string;
  coreTopics: string[];
  suggestedPractice: string;
  estimatedEffort: string;
  linkedResourceIds: string[];
}

export interface CareerLearningPath {
  id: string;
  careerId: string;
  familyId: string;
  title: string;
  firstStepsSummary: string;
  starterTopics: string[];
  entryBarriers: string[];
  steps: LearningPathStep[];
  recommendedProjects: string[];
  relatedDimensionIds: string[];
  verifiedAt: string;
}

export interface CareerLearningCoverageSummary {
  careerId: string;
  careerName: string;
  familyId: string;
  hasLearningPath: boolean;
  directResourceCount: number;
  relatedResourceCount: number;
  totalResourceCount: number;
  coverageStatus: CareerLearningCoverageStatus;
}

export interface LearningResourceMatch {
  resource: LearningResource;
  source: LearningSourceReference;
  matchTier: LearningMatchTier;
  matchedCareerId: string;
  matchReason: string;
}

export interface LearningExplorerFilters {
  careerId?: string;
  familyId?: string;
  difficulty?: LearningDifficultyLevel | 'all';
  accessType?: LearningAccessType | 'all';
  language?: LearningLanguage | 'all';
  resourceType?: LearningResourceType | 'all';
  colombiaOnly?: boolean;
  verifiedOnly?: boolean;
  includeRelated?: boolean;
  searchQuery?: string;
}
