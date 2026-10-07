export {
  isValidHttpUrl,
  isValidSniesCodeFormat,
  validateAcademicProgram,
  validateAcademicSource,
  validateAcademicSourceRecord,
  validateInstitution,
} from './validateAcademicModels';
export {
  CAREER_ACADEMIC_NORMALIZATION_RULES,
  matchCareerToProgram,
  matchProgramAgainstCareers,
  normalizeAcademicText,
} from './academicMatcher';
export {
  buildInitialAcademicFilters,
  buildSuggestedFiltersFromContext,
  normalizePreferredInstitutionType,
  normalizePreferredModality,
  normalizePreferredSector,
  normalizeStudentContextForAcademic,
  type ExtendedStudentContextInput,
} from './contextMapper';
export {
  filterAndSortAcademicPrograms,
  type FilterAndSortOptions,
} from './filterAndSortPrograms';
export {
  extractNormalizedDomain,
  isBlockedThirdPartyUrl,
  isOfficialMenSourceUrl,
  verifyOfficialDomain,
  type DomainVerificationResult,
} from './verifyOfficialDomain';
export {
  buildInstitutionDeduplicationKey,
  buildProgramDeduplicationKey,
  deduplicateInstitutions,
  deduplicatePrograms,
  normalizeInstitutionDeduplicationName,
  normalizeProgramDeduplicationName,
} from './deduplicatePrograms';
export {
  detectAcademicConflicts,
  parseModalityFromText,
  parseStatusFromText,
} from './detectAcademicConflicts';
export {
  computeSourceVerificationStatus,
  DEFAULT_STALE_THRESHOLD_DAYS,
  resolveAndMergeProgramSources,
  type MergeProgramSourcesResult,
} from './resolveAcademicSource';
