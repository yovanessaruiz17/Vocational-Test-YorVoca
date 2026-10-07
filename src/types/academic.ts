import {
  AcademicConflict,
  AcademicSourceRecord,
  AcademicSourceType,
  CareerProgramMapping,
  ProgramOfficialContent,
  SourceVerificationStatus,
} from './academicSource';

export type {
  AcademicConflict,
  AcademicSourceRecord,
  AcademicSourceType,
  CareerProgramMapping,
  ProgramOfficialContent,
  SourceVerificationStatus,
};

export type AcademicSourceProvider =
  | 'snies'
  | 'men_open_data'
  | 'institution_official'
  | 'institution_website'
  | 'mock';

export interface AcademicSource {
  provider: AcademicSourceProvider;
  sourceId?: string;
  type?: AcademicSourceType;
  sourceUrl?: string;
  verificationStatus?: SourceVerificationStatus;
  retrievedAt?: string;
  lastVerifiedAt?: string;
  contentHash?: string;
  notes?: string;
}

export type AcademicInstitutionType =
  | 'university'
  | 'university_institution'
  | 'technological'
  | 'technical'
  | 'technical_professional'
  | 'sena'
  | 'other';

export type AcademicSector = 'public' | 'private' | 'mixed' | 'unknown';

export interface Institution {
  institutionId: string;
  name: string;
  officialName?: string;
  shortName?: string;
  institutionType: AcademicInstitutionType;
  sector: AcademicSector;
  city: string;
  municipality?: string;
  department: string;
  officialWebsite?: string;
  officialWebsiteUrl?: string;
  officialDomain?: string;
  sniesCode?: string;
  sniesInstitutionCode?: string;
  nit?: string;
  accreditation?: string;
  status?: 'active' | 'inactive' | 'unknown';
  sourceStatus?: SourceVerificationStatus;
  source: AcademicSource;
  lastVerifiedAt?: string;
}

export type AcademicLevel =
  | 'technical_professional'
  | 'technological'
  | 'professional'
  | 'specialization'
  | 'masters'
  | 'doctorate'
  | 'other';

export type AcademicModality = 'presential' | 'virtual' | 'hybrid' | 'unknown';

export type AcademicProgramStatus = 'active' | 'inactive' | 'unknown';

export interface AcademicProgram {
  programId: string;
  institutionId: string;
  name: string;
  officialName?: string;
  normalizedName?: string;
  academicLevel: AcademicLevel;
  modality: AcademicModality;
  city: string;
  municipality?: string;
  department: string;
  sniesCode?: string;
  status: AcademicProgramStatus;
  officialUrl?: string;
  officialProgramUrl?: string;
  officialSourceId?: string;
  sourceStatus?: SourceVerificationStatus;
  source: AcademicSource;
  lastVerifiedAt?: string;
  officialContent?: ProgramOfficialContent;
  conflicts?: AcademicConflict[];
}

export type AcademicMatchType = 'direct' | 'related';

export type AcademicRelevance = 'high' | 'medium' | 'low';

export interface CareerAcademicMapping {
  careerId: string;
  programId: string;
  relevance: AcademicRelevance;
  matchType?: AcademicMatchType;
  rationale?: string;
}

export type AcademicDataStatus = 'loading' | 'ready' | 'empty' | 'error' | 'mock';

export type StudyLocationPreferenceMode =
  | 'current_city'
  | 'specific_city'
  | 'any_colombian_city'
  | 'virtual'
  | 'undecided';

export type GeographicFlexibilityMode =
  | 'only_current_city'
  | 'nearby_cities'
  | 'any_colombian_city'
  | 'open_to_virtual';

export interface NormalizedStudentAcademicContext {
  hasContext: boolean;
  currentCity?: string;
  currentDepartment?: string;
  targetCity?: string;
  targetDepartment?: string;
  studyLocationPreference: StudyLocationPreferenceMode;
  geographicFlexibility: GeographicFlexibilityMode;
  preferredModality: AcademicModality | 'any';
  preferredSector: 'public' | 'private' | 'any';
  preferredInstitutionType: AcademicInstitutionType | 'any';
  suggestedCity?: string;
  suggestedDepartment?: string;
}

export type CareerFilterScope = 'top5' | 'specific' | 'all';

export interface AcademicSearchFilters {
  careerScope: CareerFilterScope;
  careerId?: string;
  topCareerIds?: string[];
  city?: string;
  department?: string;
  modality?: AcademicModality | 'any';
  institutionType?: AcademicInstitutionType | 'any';
  sector?: 'public' | 'private' | 'any';
  status?: AcademicProgramStatus | 'all';
  matchType?: AcademicMatchType | 'all';
  searchQuery?: string;
  verifiedOnly?: boolean;
}

export interface ProgramCareerMatchInfo {
  careerId: string;
  careerName: string;
  matchType: AcademicMatchType;
  relevance: AcademicRelevance;
  rationale: string;
  careerAffinityScore?: number;
  careerAffinityPercent?: number;
}

export interface EnrichedAcademicProgram {
  program: AcademicProgram;
  institution: Institution;
  matches: ProgramCareerMatchInfo[];
  primaryMatch: ProgramCareerMatchInfo | null;
  locationCompatible: boolean;
  modalityCompatible: boolean;
  institutionTypeCompatible?: boolean;
  sectorCompatible?: boolean;
  preferenceMatchCount?: number;
  preferenceMatchLabels?: string[];
}

export interface InstitutionWithPrograms {
  institution: Institution;
  programs: EnrichedAcademicProgram[];
  directMatchCount: number;
  relatedMatchCount: number;
}

export interface AcademicCacheMetadata {
  retrievedAt: string;
  lastVerifiedAt?: string;
  expiresAt: string;
  provider: AcademicSourceProvider;
  isFromOfflineCache?: boolean;
}

export interface AcademicSearchResult {
  status: AcademicDataStatus;
  provider: AcademicSourceProvider;
  programs: EnrichedAcademicProgram[];
  institutions: InstitutionWithPrograms[];
  totalProgramsCount: number;
  totalInstitutionsCount: number;
  unfilteredCareerProgramsCount?: number;
  appliedFilters: AcademicSearchFilters;
  cacheMetadata?: AcademicCacheMetadata;
  notice?: string;
  errorMessage?: string;
}
