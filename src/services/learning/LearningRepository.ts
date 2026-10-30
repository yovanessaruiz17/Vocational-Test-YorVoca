import { CAREERS, CAREERS_BY_ID } from '../../data/careers/careers';
import {
  CAREER_LEARNING_PATHS,
  VERIFIED_LEARNING_RESOURCES,
  VERIFIED_LEARNING_SOURCES,
} from '../../data/learning/verifiedLearningCatalog';
import {
  LearningValidationResult,
  normalizeLearningText,
  validateLearningCatalogIntegrity,
} from '../../lib/learning/validateLearningModels';
import { Career } from '../../types/career';
import {
  CareerLearningCoverageStatus,
  CareerLearningCoverageSummary,
  CareerLearningPath,
  LearningDifficultyLevel,
  LearningExplorerFilters,
  LearningMatchTier,
  LearningPathStep,
  LearningResource,
  LearningResourceMatch,
  LearningSourceReference,
} from '../../types/learning';

export interface LearningRepositorySeed {
  sources?: LearningSourceReference[];
  resources?: LearningResource[];
  paths?: CareerLearningPath[];
}

const DIFFICULTY_SORT_ORDER: Record<LearningDifficultyLevel, number> = {
  introductory: 0,
  foundational: 1,
  intermediate: 2,
};

function isResourceStrictlyVerified(
  resource: LearningResource,
  source: LearningSourceReference
): boolean {
  return (
    resource.verificationStatus === 'verified' &&
    source.verificationStatus === 'verified'
  );
}

function compareResourceMatchesDeterministically(
  a: LearningResourceMatch,
  b: LearningResourceMatch
): number {
  const tierOrderA = a.matchTier === 'direct' ? 0 : 1;
  const tierOrderB = b.matchTier === 'direct' ? 0 : 1;
  if (tierOrderA !== tierOrderB) {
    return tierOrderA - tierOrderB;
  }

  const verifiedOrderA = isResourceStrictlyVerified(a.resource, a.source) ? 0 : 1;
  const verifiedOrderB = isResourceStrictlyVerified(b.resource, b.source) ? 0 : 1;
  if (verifiedOrderA !== verifiedOrderB) {
    return verifiedOrderA - verifiedOrderB;
  }

  const colombiaOrderA = a.resource.isColombiaSpecific ? 0 : 1;
  const colombiaOrderB = b.resource.isColombiaSpecific ? 0 : 1;
  if (colombiaOrderA !== colombiaOrderB) {
    return colombiaOrderA - colombiaOrderB;
  }

  const diffOrderA = DIFFICULTY_SORT_ORDER[a.resource.difficulty] ?? 99;
  const diffOrderB = DIFFICULTY_SORT_ORDER[b.resource.difficulty] ?? 99;
  if (diffOrderA !== diffOrderB) {
    return diffOrderA - diffOrderB;
  }

  const titleCmp = a.resource.title.localeCompare(b.resource.title, 'es');
  if (titleCmp !== 0) {
    return titleCmp;
  }

  return a.resource.id.localeCompare(b.resource.id);
}

export class LearningRepository {
  private readonly sources: LearningSourceReference[];
  private readonly sourcesById: Record<string, LearningSourceReference>;
  private readonly resources: LearningResource[];
  private readonly resourcesById: Record<string, LearningResource>;
  private readonly paths: CareerLearningPath[];
  private readonly pathsByCareerId: Record<string, CareerLearningPath>;

  constructor(seed?: LearningRepositorySeed) {
    this.sources = [...(seed?.sources ?? VERIFIED_LEARNING_SOURCES)];
    this.resources = [...(seed?.resources ?? VERIFIED_LEARNING_RESOURCES)];
    this.paths = [...(seed?.paths ?? CAREER_LEARNING_PATHS)];

    this.sourcesById = Object.fromEntries(
      this.sources.map((source) => [source.id, source])
    );
    this.resourcesById = Object.fromEntries(
      this.resources.map((resource) => [resource.id, resource])
    );
    this.pathsByCareerId = Object.fromEntries(
      this.paths.map((path) => [path.careerId, path])
    );
  }

  validateIntegrity(): LearningValidationResult {
    return validateLearningCatalogIntegrity(
      this.sources,
      this.resources,
      this.paths
    );
  }

  getAllSources(): LearningSourceReference[] {
    return [...this.sources];
  }

  getSourceById(sourceId: string): LearningSourceReference | undefined {
    return this.sourcesById[sourceId];
  }

  getAllResources(): LearningResource[] {
    return this.resources.filter((resource) => resource.active);
  }

  getResourceById(resourceId: string): LearningResource | undefined {
    const resource = this.resourcesById[resourceId];
    return resource && resource.active ? resource : undefined;
  }

  getLearningPathByCareerId(careerId: string): CareerLearningPath | undefined {
    return this.pathsByCareerId[careerId];
  }

  getAllLearningPaths(): CareerLearningPath[] {
    return [...this.paths];
  }

  getStepResources(step: LearningPathStep): LearningResource[] {
    if (!step || !Array.isArray(step.linkedResourceIds)) return [];
    return step.linkedResourceIds
      .map((id) => this.getResourceById(id))
      .filter((r): r is LearningResource => r !== undefined && r.active);
  }

  getPathResources(careerId: string): LearningResource[] {
    const path = this.getLearningPathByCareerId(careerId);
    if (!path) return [];
    const resourceMap = new Map<string, LearningResource>();
    for (const step of path.steps) {
      for (const resId of step.linkedResourceIds) {
        const res = this.getResourceById(resId);
        if (res && res.active) {
          resourceMap.set(res.id, res);
        }
      }
    }
    return Array.from(resourceMap.values());
  }

  private evaluateCareerResourceAffinity(
    career: Career,
    resource: LearningResource
  ): { matched: boolean; tier: LearningMatchTier; reason: string } | null {
    if (!resource.active) return null;

    if (resource.careerIds.includes(career.id)) {
      return {
        matched: true,
        tier: 'direct',
        reason: `Recurso directamente asociado a ${career.name}.`,
      };
    }

    if (!resource.familyIds.includes(career.familyId)) {
      return null;
    }

    const careerDimensions = new Set(career.relatedDimensions);
    const sharedDimensions = resource.relatedDimensionIds.filter((dimId) =>
      careerDimensions.has(dimId)
    );
    if (sharedDimensions.length < 2) {
      return null;
    }

    const learningPath = this.pathsByCareerId[career.id];
    const careerTopicCorpus = normalizeLearningText(
      [...(learningPath?.starterTopics ?? []), ...career.typicalAreas].join(' ')
    );

    const hasTopicOverlap = resource.starterTopicTags.some((tag) => {
      const normalizedTag = normalizeLearningText(tag);
      return (
        normalizedTag.length >= 5 && careerTopicCorpus.includes(normalizedTag)
      );
    });

    if (!hasTopicOverlap) {
      return null;
    }

    return {
      matched: true,
      tier: 'related',
      reason: `Recurso afín por familia profesional (${career.familyId}) y temas base relacionados con ${career.name}.`,
    };
  }

  getResourcesForCareer(
    careerId: string,
    options?: { includeRelated?: boolean; verifiedOnly?: boolean }
  ): LearningResourceMatch[] {
    const career = CAREERS_BY_ID[careerId];
    if (!career) return [];

    const includeRelated = options?.includeRelated !== false;
    const verifiedOnly = options?.verifiedOnly === true;

    const matches: LearningResourceMatch[] = [];

    for (const resource of this.resources) {
      if (!resource.active) continue;
      const source = this.sourcesById[resource.sourceId];
      if (!source) continue;

      if (verifiedOnly && !isResourceStrictlyVerified(resource, source)) {
        continue;
      }

      const affinity = this.evaluateCareerResourceAffinity(career, resource);
      if (!affinity) continue;

      if (affinity.tier === 'related' && !includeRelated) {
        continue;
      }

      matches.push({
        resource,
        source,
        matchTier: affinity.tier,
        matchedCareerId: career.id,
        matchReason: affinity.reason,
      });
    }

    return matches.sort(compareResourceMatchesDeterministically);
  }

  queryResources(filters: LearningExplorerFilters = {}): LearningResourceMatch[] {
    const includeRelated = filters.includeRelated !== false;
    const verifiedOnly = filters.verifiedOnly === true;
    const colombiaOnly = filters.colombiaOnly === true;
    const normalizedQuery = filters.searchQuery
      ? normalizeLearningText(filters.searchQuery)
      : '';

    let candidateMatches: LearningResourceMatch[] = [];

    if (filters.careerId && filters.careerId !== 'all') {
      candidateMatches = this.getResourcesForCareer(filters.careerId, {
        includeRelated,
        verifiedOnly,
      });
    } else {
      for (const resource of this.resources) {
        if (!resource.active) continue;
        const source = this.sourcesById[resource.sourceId];
        if (!source) continue;

        if (verifiedOnly && !isResourceStrictlyVerified(resource, source)) {
          continue;
        }

        let matchTier: LearningMatchTier = 'direct';
        let matchedCareerId = resource.careerIds[0] ?? '';
        let matchReason = 'Recurso del catálogo controlado de aprendizaje.';

        if (filters.familyId && filters.familyId !== 'all') {
          if (!resource.familyIds.includes(filters.familyId)) {
            continue;
          }
          const directCareerInFamily = resource.careerIds.find(
            (cId) => CAREERS_BY_ID[cId]?.familyId === filters.familyId
          );
          if (directCareerInFamily) {
            matchTier = 'direct';
            matchedCareerId = directCareerInFamily;
            matchReason = `Recurso directo de la familia profesional ${filters.familyId}.`;
          } else {
            if (!includeRelated) continue;
            matchTier = 'related';
            matchReason = `Recurso relacionado con la familia profesional ${filters.familyId}.`;
          }
        }

        candidateMatches.push({
          resource,
          source,
          matchTier,
          matchedCareerId,
          matchReason,
        });
      }
    }

    const filtered = candidateMatches.filter(({ resource }) => {
      if (
        filters.familyId &&
        filters.familyId !== 'all' &&
        !resource.familyIds.includes(filters.familyId)
      ) {
        return false;
      }

      if (
        filters.difficulty &&
        filters.difficulty !== 'all' &&
        resource.difficulty !== filters.difficulty
      ) {
        return false;
      }

      if (
        filters.accessType &&
        filters.accessType !== 'all' &&
        resource.accessType !== filters.accessType
      ) {
        return false;
      }

      if (
        filters.language &&
        filters.language !== 'all' &&
        resource.language !== filters.language
      ) {
        return false;
      }

      if (
        filters.resourceType &&
        filters.resourceType !== 'all' &&
        resource.resourceType !== filters.resourceType
      ) {
        return false;
      }

      if (colombiaOnly && !resource.isColombiaSpecific) {
        return false;
      }

      if (normalizedQuery.length > 0) {
        const searchableFields = [
          resource.title,
          resource.normalizedTitle,
          resource.providerName,
          resource.summary,
          ...resource.starterTopicTags,
        ]
          .map(normalizeLearningText)
          .join(' ');

        if (!searchableFields.includes(normalizedQuery)) {
          return false;
        }
      }

      return true;
    });

    return filtered.sort(compareResourceMatchesDeterministically);
  }

  getCareerLearningCoverage(
    careerId: string
  ): CareerLearningCoverageSummary | undefined {
    const career = CAREERS_BY_ID[careerId];
    if (!career) return undefined;

    const hasLearningPath = Boolean(this.pathsByCareerId[career.id]);
    const allMatches = this.getResourcesForCareer(career.id, {
      includeRelated: true,
      verifiedOnly: false,
    });

    const directResourceCount = allMatches.filter(
      (m) => m.matchTier === 'direct'
    ).length;
    const relatedResourceCount = allMatches.filter(
      (m) => m.matchTier === 'related'
    ).length;
    const totalResourceCount = directResourceCount + relatedResourceCount;

    let coverageStatus: CareerLearningCoverageStatus = 'path_only';
    if (directResourceCount > 0) {
      coverageStatus = 'direct_and_path';
    } else if (relatedResourceCount > 0) {
      coverageStatus = 'related_and_path';
    }

    return {
      careerId: career.id,
      careerName: career.name,
      familyId: career.familyId,
      hasLearningPath,
      directResourceCount,
      relatedResourceCount,
      totalResourceCount,
      coverageStatus,
    };
  }

  getAllCareerLearningCoverage(): CareerLearningCoverageSummary[] {
    return CAREERS.map((career) => {
      const coverage = this.getCareerLearningCoverage(career.id);
      if (!coverage) {
        return {
          careerId: career.id,
          careerName: career.name,
          familyId: career.familyId,
          hasLearningPath: false,
          directResourceCount: 0,
          relatedResourceCount: 0,
          totalResourceCount: 0,
          coverageStatus: 'path_only' as const,
        };
      }
      return coverage;
    });
  }
}

export const defaultLearningRepository = new LearningRepository();
